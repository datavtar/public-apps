import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  Settings,
  LogOut,
  Calendar,
  BarChart,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Navigation,
  Globe,
  Timer,
  Target,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  User,
  Building,
  Phone,
  Mail,
  RefreshCw,
  FileUp,
  FileDown,
  ChevronDown,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart } from 'recharts';
import styles from './styles/styles.module.css';

interface Shipment {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  origin: string;
  destination: string;
  carrier: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled';
  shipDate: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  weight: number;
  dimensions: string;
  value: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes: string;
  route: string[];
  currentLocation: string;
  progress: number;
  documents: ShipmentDocument[];
}

interface ShipmentDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

interface Carrier {
  id: string;
  name: string;
  contact: string;
  email: string;
  rating: number;
  isActive: boolean;
}

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  estimatedDays: number;
  cost: number;
  isActive: boolean;
}

interface Settings {
  currency: string;
  timezone: string;
  language: string;
  theme: 'light' | 'dark';
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

type FilterType = {
  status: string;
  carrier: string;
  priority: string;
  dateRange: string;
  search: string;
};

type SortType = {
  field: string;
  direction: 'asc' | 'desc';
};

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shipments' | 'analytics' | 'settings'>('dashboard');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [settings, setSettings] = useState<Settings>({
    currency: 'USD',
    timezone: 'UTC',
    language: 'English',
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30
  });

  // Modal states
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showCarrierModal, setShowCarrierModal] = useState(false);
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  // Form states
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  // Filter and search states
  const [filters, setFilters] = useState<FilterType>({
    status: '',
    carrier: '',
    priority: '',
    dateRange: '',
    search: ''
  });
  const [sort, setSort] = useState<SortType>({
    field: 'shipDate',
    direction: 'desc'
  });

  // AI states
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Other states
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Initialize data
  useEffect(() => {
    loadData();
    initializeSampleData();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (settings.autoRefresh) {
      const interval = setInterval(() => {
        handleRefresh();
      }, settings.refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoRefresh, settings.refreshInterval]);

  // Theme handling
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  const loadData = () => {
    try {
      const savedShipments = localStorage.getItem('shipments');
      const savedCarriers = localStorage.getItem('carriers');
      const savedRoutes = localStorage.getItem('routes');
      const savedSettings = localStorage.getItem('settings');

      if (savedShipments) setShipments(JSON.parse(savedShipments));
      if (savedCarriers) setCarriers(JSON.parse(savedCarriers));
      if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
      if (savedSettings) setSettings({ ...settings, ...JSON.parse(savedSettings) });
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('shipments', JSON.stringify(shipments));
      localStorage.setItem('carriers', JSON.stringify(carriers));
      localStorage.setItem('routes', JSON.stringify(routes));
      localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    saveData();
  }, [shipments, carriers, routes, settings]);

  const initializeSampleData = () => {
    if (shipments.length === 0) {
      const sampleShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'TRK001234567',
          customerName: 'Acme Corporation',
          customerEmail: 'orders@acme.com',
          customerPhone: '+1-555-0123',
          origin: 'New York, NY',
          destination: 'Los Angeles, CA',
          carrier: 'FedEx',
          status: 'in-transit',
          shipDate: '2025-06-01',
          estimatedDelivery: '2025-06-07',
          weight: 25.5,
          dimensions: '24x18x12 inches',
          value: 1250.00,
          priority: 'high',
          notes: 'Fragile items - handle with care',
          route: ['New York, NY', 'Chicago, IL', 'Denver, CO', 'Los Angeles, CA'],
          currentLocation: 'Denver, CO',
          progress: 75,
          documents: []
        },
        {
          id: '2',
          trackingNumber: 'TRK002345678',
          customerName: 'Tech Solutions Inc',
          customerEmail: 'shipping@techsol.com',
          customerPhone: '+1-555-0456',
          origin: 'Seattle, WA',
          destination: 'Miami, FL',
          carrier: 'UPS',
          status: 'delivered',
          shipDate: '2025-05-28',
          estimatedDelivery: '2025-06-03',
          actualDelivery: '2025-06-02',
          weight: 15.2,
          dimensions: '20x16x10 inches',
          value: 850.00,
          priority: 'medium',
          notes: 'Electronics - signature required',
          route: ['Seattle, WA', 'Phoenix, AZ', 'Dallas, TX', 'Miami, FL'],
          currentLocation: 'Miami, FL',
          progress: 100,
          documents: []
        },
        {
          id: '3',
          trackingNumber: 'TRK003456789',
          customerName: 'Global Manufacturing',
          customerEmail: 'logistics@global.com',
          customerPhone: '+1-555-0789',
          origin: 'Chicago, IL',
          destination: 'Houston, TX',
          carrier: 'DHL',
          status: 'delayed',
          shipDate: '2025-06-03',
          estimatedDelivery: '2025-06-06',
          weight: 45.8,
          dimensions: '36x24x18 inches',
          value: 2100.00,
          priority: 'urgent',
          notes: 'Weather delay in transit',
          route: ['Chicago, IL', 'St. Louis, MO', 'Dallas, TX', 'Houston, TX'],
          currentLocation: 'St. Louis, MO',
          progress: 40,
          documents: []
        }
      ];
      setShipments(sampleShipments);
    }

    if (carriers.length === 0) {
      const sampleCarriers: Carrier[] = [
        { id: '1', name: 'FedEx', contact: '+1-800-FEDEX', email: 'support@fedex.com', rating: 4.8, isActive: true },
        { id: '2', name: 'UPS', contact: '+1-800-PICKUP', email: 'support@ups.com', rating: 4.6, isActive: true },
        { id: '3', name: 'DHL', contact: '+1-800-CALL-DHL', email: 'support@dhl.com', rating: 4.5, isActive: true },
        { id: '4', name: 'USPS', contact: '+1-800-ASK-USPS', email: 'support@usps.com', rating: 4.2, isActive: true }
      ];
      setCarriers(sampleCarriers);
    }

    if (routes.length === 0) {
      const sampleRoutes: Route[] = [
        { id: '1', name: 'East Coast Express', origin: 'New York, NY', destination: 'Miami, FL', estimatedDays: 3, cost: 45.99, isActive: true },
        { id: '2', name: 'Cross Country Standard', origin: 'Los Angeles, CA', destination: 'New York, NY', estimatedDays: 5, cost: 35.99, isActive: true },
        { id: '3', name: 'Midwest Regional', origin: 'Chicago, IL', destination: 'Detroit, MI', estimatedDays: 2, cost: 25.99, isActive: true }
      ];
      setRoutes(sampleRoutes);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update shipment progress and status
    setShipments(prev => prev.map(shipment => {
      if (shipment.status === 'in-transit' && shipment.progress < 100) {
        const newProgress = Math.min(shipment.progress + Math.random() * 10, 100);
        return {
          ...shipment,
          progress: newProgress,
          status: newProgress >= 100 ? 'delivered' : shipment.status,
          actualDelivery: newProgress >= 100 ? new Date().toISOString().split('T')[0] : shipment.actualDelivery
        };
      }
      return shipment;
    }));
    
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      case 'in-transit': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'delayed': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200';
      case 'medium': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'in-transit': return <Truck className="w-4 h-4" />;
      case 'delayed': return <AlertTriangle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = !filters.search || 
      shipment.trackingNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.destination.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesStatus = !filters.status || shipment.status === filters.status;
    const matchesCarrier = !filters.carrier || shipment.carrier === filters.carrier;
    const matchesPriority = !filters.priority || shipment.priority === filters.priority;
    
    return matchesSearch && matchesStatus && matchesCarrier && matchesPriority;
  }).sort((a, b) => {
    const aValue = a[sort.field as keyof Shipment];
    const bValue = b[sort.field as keyof Shipment];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sort.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const getShipmentStats = () => {
    const total = shipments.length;
    const delivered = shipments.filter(s => s.status === 'delivered').length;
    const inTransit = shipments.filter(s => s.status === 'in-transit').length;
    const delayed = shipments.filter(s => s.status === 'delayed').length;
    const onTime = shipments.filter(s => {
      if (s.status === 'delivered' && s.actualDelivery && s.estimatedDelivery) {
        return new Date(s.actualDelivery) <= new Date(s.estimatedDelivery);
      }
      return false;
    }).length;
    
    return { total, delivered, inTransit, delayed, onTime, onTimeRate: total > 0 ? (onTime / delivered * 100) : 0 };
  };

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const deliveryData = last7Days.map(date => {
      const delivered = shipments.filter(s => s.actualDelivery === date).length;
      const shipped = shipments.filter(s => s.shipDate === date).length;
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        delivered,
        shipped
      };
    });

    const statusData = [
      { name: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length, color: '#10B981' },
      { name: 'In Transit', value: shipments.filter(s => s.status === 'in-transit').length, color: '#3B82F6' },
      { name: 'Delayed', value: shipments.filter(s => s.status === 'delayed').length, color: '#EF4444' },
      { name: 'Pending', value: shipments.filter(s => s.status === 'pending').length, color: '#F59E0B' }
    ];

    const carrierData = carriers.map(carrier => {
      const carrierShipments = shipments.filter(s => s.carrier === carrier.name);
      const onTime = carrierShipments.filter(s => {
        if (s.status === 'delivered' && s.actualDelivery && s.estimatedDelivery) {
          return new Date(s.actualDelivery) <= new Date(s.estimatedDelivery);
        }
        return false;
      }).length;
      
      return {
        name: carrier.name,
        shipments: carrierShipments.length,
        onTimeRate: carrierShipments.length > 0 ? (onTime / carrierShipments.filter(s => s.status === 'delivered').length * 100) || 0 : 0
      };
    });

    return { deliveryData, statusData, carrierData };
  };

  const handleShipmentSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const shipmentData: Omit<Shipment, 'id'> = {
      trackingNumber: formData.get('trackingNumber') as string,
      customerName: formData.get('customerName') as string,
      customerEmail: formData.get('customerEmail') as string,
      customerPhone: formData.get('customerPhone') as string,
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      carrier: formData.get('carrier') as string,
      status: formData.get('status') as 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled',
      shipDate: formData.get('shipDate') as string,
      estimatedDelivery: formData.get('estimatedDelivery') as string,
      actualDelivery: formData.get('actualDelivery') as string || undefined,
      weight: parseFloat(formData.get('weight') as string),
      dimensions: formData.get('dimensions') as string,
      value: parseFloat(formData.get('value') as string),
      priority: formData.get('priority') as 'low' | 'medium' | 'high' | 'urgent',
      notes: formData.get('notes') as string,
      route: (formData.get('route') as string).split(',').map(r => r.trim()),
      currentLocation: formData.get('currentLocation') as string,
      progress: parseInt(formData.get('progress') as string),
      documents: []
    };

    if (editingShipment) {
      setShipments(prev => prev.map(s => s.id === editingShipment.id ? { ...shipmentData, id: editingShipment.id } : s));
    } else {
      const newShipment: Shipment = {
        ...shipmentData,
        id: Date.now().toString()
      };
      setShipments(prev => [...prev, newShipment]);
    }

    setShowShipmentModal(false);
    setEditingShipment(null);
  };

  const handleDeleteShipment = (id: string) => {
    setConfirmMessage('Are you sure you want to delete this shipment?');
    setConfirmAction(() => () => {
      setShipments(prev => prev.filter(s => s.id !== id));
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleCarrierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const carrierData: Omit<Carrier, 'id'> = {
      name: formData.get('name') as string,
      contact: formData.get('contact') as string,
      email: formData.get('email') as string,
      rating: parseFloat(formData.get('rating') as string),
      isActive: formData.get('isActive') === 'on'
    };

    if (editingCarrier) {
      setCarriers(prev => prev.map(c => c.id === editingCarrier.id ? { ...carrierData, id: editingCarrier.id } : c));
    } else {
      const newCarrier: Carrier = {
        ...carrierData,
        id: Date.now().toString()
      };
      setCarriers(prev => [...prev, newCarrier]);
    }

    setShowCarrierModal(false);
    setEditingCarrier(null);
  };

  const handleRouteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const routeData: Omit<Route, 'id'> = {
      name: formData.get('name') as string,
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      estimatedDays: parseInt(formData.get('estimatedDays') as string),
      cost: parseFloat(formData.get('cost') as string),
      isActive: formData.get('isActive') === 'on'
    };

    if (editingRoute) {
      setRoutes(prev => prev.map(r => r.id === editingRoute.id ? { ...routeData, id: editingRoute.id } : r));
    } else {
      const newRoute: Route = {
        ...routeData,
        id: Date.now().toString()
      };
      setRoutes(prev => [...prev, newRoute]);
    }

    setShowRouteModal(false);
    setEditingRoute(null);
  };

  const handleExportData = () => {
    const csvContent = [
      'Tracking Number,Customer Name,Origin,Destination,Carrier,Status,Ship Date,Estimated Delivery,Actual Delivery,Weight,Value,Priority,Progress',
      ...shipments.map(s => [
        s.trackingNumber,
        s.customerName,
        s.origin,
        s.destination,
        s.carrier,
        s.status,
        s.shipDate,
        s.estimatedDelivery,
        s.actualDelivery || '',
        s.weight,
        s.value,
        s.priority,
        s.progress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadTemplate = () => {
    const templateContent = [
      'Tracking Number,Customer Name,Customer Email,Customer Phone,Origin,Destination,Carrier,Status,Ship Date,Estimated Delivery,Weight,Dimensions,Value,Priority,Notes,Current Location,Progress',
      'TRK123456789,Sample Customer,customer@example.com,+1-555-0123,New York NY,Los Angeles CA,FedEx,pending,2025-06-05,2025-06-10,25.5,24x18x12 inches,1250.00,medium,Handle with care,New York NY,0'
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'shipments_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',');
        
        const importedShipments: Shipment[] = lines.slice(1)
          .filter(line => line.trim())
          .map((line, index) => {
            const values = line.split(',');
            return {
              id: Date.now().toString() + index,
              trackingNumber: values[0] || '',
              customerName: values[1] || '',
              customerEmail: values[2] || '',
              customerPhone: values[3] || '',
              origin: values[4] || '',
              destination: values[5] || '',
              carrier: values[6] || '',
              status: (values[7] || 'pending') as 'pending' | 'in-transit' | 'delivered' | 'delayed' | 'cancelled',
              shipDate: values[8] || new Date().toISOString().split('T')[0],
              estimatedDelivery: values[9] || new Date().toISOString().split('T')[0],
              weight: parseFloat(values[10]) || 0,
              dimensions: values[11] || '',
              value: parseFloat(values[12]) || 0,
              priority: (values[13] || 'medium') as 'low' | 'medium' | 'high' | 'urgent',
              notes: values[14] || '',
              route: [values[4] || '', values[5] || ''],
              currentLocation: values[15] || values[4] || '',
              progress: parseInt(values[16]) || 0,
              documents: []
            };
          });

        setShipments(prev => [...prev, ...importedShipments]);
        setShowImportModal(false);
      } catch (error) {
        console.error('Error importing data:', error);
        setAiError('Error importing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleAISubmit = () => {
    if (!aiPrompt?.trim() && !selectedFile) {
      setAiError('Please provide a prompt or select a file to process.');
      return;
    }
    
    setAiResult(null);
    setAiError(null);
    
    let prompt = aiPrompt;
    if (selectedFile && !aiPrompt?.trim()) {
      prompt = 'Extract shipment data from this document and return JSON with keys: trackingNumber, customerName, customerEmail, customerPhone, origin, destination, carrier, status, shipDate, estimatedDelivery, weight, dimensions, value, priority, notes';
    }
    
    try {
      aiLayerRef.current?.sendToAI(prompt, selectedFile || undefined);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const processAIResult = (result: string) => {
    try {
      const data = JSON.parse(result);
      if (data.trackingNumber) {
        const newShipment: Shipment = {
          id: Date.now().toString(),
          trackingNumber: data.trackingNumber || 'AUTO-' + Date.now(),
          customerName: data.customerName || '',
          customerEmail: data.customerEmail || '',
          customerPhone: data.customerPhone || '',
          origin: data.origin || '',
          destination: data.destination || '',
          carrier: data.carrier || '',
          status: data.status || 'pending',
          shipDate: data.shipDate || new Date().toISOString().split('T')[0],
          estimatedDelivery: data.estimatedDelivery || new Date().toISOString().split('T')[0],
          weight: parseFloat(data.weight) || 0,
          dimensions: data.dimensions || '',
          value: parseFloat(data.value) || 0,
          priority: data.priority || 'medium',
          notes: data.notes || 'Created via AI extraction',
          route: [data.origin || '', data.destination || ''],
          currentLocation: data.origin || '',
          progress: 0,
          documents: []
        };
        
        setShipments(prev => [...prev, newShipment]);
        setAiPrompt('');
        setSelectedFile(null);
      }
    } catch (error) {
      console.error('Error processing AI result:', error);
    }
  };

  useEffect(() => {
    if (aiResult) {
      processAIResult(aiResult);
    }
  }, [aiResult]);

  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all data? This action cannot be undone.');
    setConfirmAction(() => () => {
      setShipments([]);
      setCarriers([]);
      setRoutes([]);
      localStorage.clear();
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const stats = getShipmentStats();
  const chartData = getChartData();

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* AI Layer */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-primary-600 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">ShipTracker Pro</h1>
                <p className="text-sm text-gray-500 dark:text-slate-400">Logistics Management System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              
              <button
                onClick={() => setSettings(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }))}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                aria-label="Toggle theme"
              >
                {settings.theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
                <User className="w-4 h-4" />
                <span>Welcome, {currentUser?.first_name}</span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b theme-transition">
        <div className="container-fluid">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart },
              { id: 'shipments', label: 'Shipments', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={id === 'dashboard' ? 'generation_issue_fallback' : undefined}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Total Shipments</div>
                    <div className="stat-value">{stats.total}</div>
                  </div>
                  <Package className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">In Transit</div>
                    <div className="stat-value">{stats.inTransit}</div>
                  </div>
                  <Truck className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">Delivered</div>
                    <div className="stat-value">{stats.delivered}</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              
              <div className="stat-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stat-title">On-Time Rate</div>
                    <div className="stat-value">{stats.onTimeRate.toFixed(1)}%</div>
                  </div>
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Recent Shipments */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Shipments</h2>
                <button
                  id="add-shipment-btn"
                  onClick={() => {
                    setEditingShipment(null);
                    setShowShipmentModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Shipment
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Tracking #</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Route</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Progress</th>
                      <th className="table-header">Delivery</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredShipments.slice(0, 5).map(shipment => (
                      <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                        <td className="table-cell">{shipment.customerName}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1 text-xs">
                            <span>{shipment.origin}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{shipment.destination}</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(shipment.status)}`}>
                            {getStatusIcon(shipment.status)}
                            {shipment.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${shipment.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{shipment.progress}%</span>
                          </div>
                        </td>
                        <td className="table-cell">{shipment.estimatedDelivery}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedShipment(shipment)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingShipment(shipment);
                                setShowShipmentModal(true);
                              }}
                              className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={chartData.deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="shipped" fill="#3B82F6" name="Shipped" />
                    <Bar dataKey="delivered" fill="#10B981" name="Delivered" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart data={chartData.statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                      {chartData.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'shipments' && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="card">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      id="search-shipments"
                      type="text"
                      placeholder="Search shipments..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="input pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="input w-auto"
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  
                  <select
                    value={filters.carrier}
                    onChange={(e) => setFilters(prev => ({ ...prev, carrier: e.target.value }))}
                    className="input w-auto"
                  >
                    <option value="">All Carriers</option>
                    {carriers.map(carrier => (
                      <option key={carrier.id} value={carrier.name}>{carrier.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="input w-auto"
                  >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingShipment(null);
                      setShowShipmentModal(true);
                    }}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import
                  </button>
                  
                  <button
                    onClick={handleExportData}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
            </div>

            {/* AI Document Processing */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Document Processing</h3>
              <div className="space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
                    <textarea
                      placeholder="Enter shipping details or leave empty to auto-extract from document..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="input h-24 resize-none"
                    />
                  </div>
                  
                  <div className="lg:w-64">
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="input"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-500 mt-1">Selected: {selectedFile.name}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleAISubmit}
                    disabled={aiLoading}
                    className="btn btn-primary flex items-center gap-2 h-fit"
                  >
                    {aiLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {aiLoading ? 'Processing...' : 'Process'}
                  </button>
                </div>
                
                {aiError && (
                  <div className="alert alert-error">
                    <AlertTriangle className="w-4 h-4" />
                    <p>{aiError}</p>
                  </div>
                )}
                
                {aiResult && (
                  <div className="alert alert-success">
                    <CheckCircle className="w-4 h-4" />
                    <p>Document processed successfully and shipment added!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipments Table */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Shipments ({filteredShipments.length})
                </h2>
                
                <div className="flex items-center gap-2">
                  <select
                    value={`${sort.field}-${sort.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-');
                      setSort({ field, direction: direction as 'asc' | 'desc' });
                    }}
                    className="input w-auto text-sm"
                  >
                    <option value="shipDate-desc">Ship Date (Newest)</option>
                    <option value="shipDate-asc">Ship Date (Oldest)</option>
                    <option value="estimatedDelivery-asc">Delivery Date</option>
                    <option value="customerName-asc">Customer A-Z</option>
                    <option value="status-asc">Status</option>
                    <option value="priority-desc">Priority</option>
                  </select>
                </div>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Tracking #</th>
                      <th className="table-header">Customer</th>
                      <th className="table-header">Route</th>
                      <th className="table-header">Carrier</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Priority</th>
                      <th className="table-header">Progress</th>
                      <th className="table-header">Ship Date</th>
                      <th className="table-header">Est. Delivery</th>
                      <th className="table-header">Value</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredShipments.map(shipment => (
                      <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="table-cell font-medium">{shipment.trackingNumber}</td>
                        <td className="table-cell">
                          <div>
                            <div className="font-medium">{shipment.customerName}</div>
                            <div className="text-xs text-gray-500">{shipment.customerEmail}</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span>{shipment.origin}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span>{shipment.destination}</span>
                          </div>
                        </td>
                        <td className="table-cell">{shipment.carrier}</td>
                        <td className="table-cell">
                          <span className={`badge ${getStatusColor(shipment.status)}`}>
                            {getStatusIcon(shipment.status)}
                            {shipment.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${getPriorityColor(shipment.priority)}`}>
                            {shipment.priority}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{ width: `${shipment.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{shipment.progress}%</span>
                          </div>
                        </td>
                        <td className="table-cell">{shipment.shipDate}</td>
                        <td className="table-cell">{shipment.estimatedDelivery}</td>
                        <td className="table-cell">${shipment.value.toLocaleString()}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedShipment(shipment)}
                              className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingShipment(shipment);
                                setShowShipmentModal(true);
                              }}
                              className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteShipment(shipment.id)}
                              className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredShipments.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No shipments found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="stat-title">Average Delivery Time</div>
                <div className="stat-value">4.2 days</div>
                <div className="stat-desc flex items-center gap-1 text-green-600">
                  <ArrowDown className="w-4 h-4" />
                  0.3 days faster
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Delayed Shipments</div>
                <div className="stat-value">{stats.delayed}</div>
                <div className="stat-desc flex items-center gap-1 text-red-600">
                  <ArrowUp className="w-4 h-4" />
                  {((stats.delayed / stats.total) * 100).toFixed(1)}% of total
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Customer Satisfaction</div>
                <div className="stat-value">94.2%</div>
                <div className="stat-desc flex items-center gap-1 text-green-600">
                  <ArrowUp className="w-4 h-4" />
                  2.1% improvement
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Daily Shipment Volume</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData.deliveryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="shipped" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="delivered" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Carrier Performance</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <RechartsBarChart data={chartData.carrierData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip />
                    <Bar dataKey="onTimeRate" fill="#10B981" name="On-Time Rate %" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Weekly Trends</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.deliveryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="shipped" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6' }} />
                  <Line type="monotone" dataKey="delivered" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                    className="input"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    className="input"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">Eastern Time</option>
                    <option value="PST">Pacific Time</option>
                    <option value="CST">Central Time</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                    className="input"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({ ...prev, theme: e.target.value as 'light' | 'dark' }))}
                    className="input"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between py-4 border-t mt-6">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Auto Refresh</h4>
                  <p className="text-sm text-gray-500 dark:text-slate-400">Automatically refresh shipment data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoRefresh}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              {settings.autoRefresh && (
                <div className="form-group">
                  <label className="form-label">Refresh Interval (seconds)</label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={settings.refreshInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                    className="input"
                  />
                </div>
              )}
            </div>

            {/* Carriers Management */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Carriers</h2>
                <button
                  id="manage-carriers-btn"
                  onClick={() => {
                    setEditingCarrier(null);
                    setShowCarrierModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Carrier
                </button>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Contact</th>
                      <th className="table-header">Email</th>
                      <th className="table-header">Rating</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {carriers.map(carrier => (
                      <tr key={carrier.id}>
                        <td className="table-cell font-medium">{carrier.name}</td>
                        <td className="table-cell">{carrier.contact}</td>
                        <td className="table-cell">{carrier.email}</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <span>{carrier.rating}</span>
                            <div className="text-yellow-400">★</div>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${carrier.isActive ? 'badge-success' : 'badge-error'}`}>
                            {carrier.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => {
                              setEditingCarrier(carrier);
                              setShowCarrierModal(true);
                            }}
                            className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded mr-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Routes Management */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Routes</h2>
                <button
                  onClick={() => {
                    setEditingRoute(null);
                    setShowRouteModal(true);
                  }}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Route
                </button>
              </div>
              
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Origin</th>
                      <th className="table-header">Destination</th>
                      <th className="table-header">Est. Days</th>
                      <th className="table-header">Cost</th>
                      <th className="table-header">Status</th>
                      <th className="table-header">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {routes.map(route => (
                      <tr key={route.id}>
                        <td className="table-cell font-medium">{route.name}</td>
                        <td className="table-cell">{route.origin}</td>
                        <td className="table-cell">{route.destination}</td>
                        <td className="table-cell">{route.estimatedDays}</td>
                        <td className="table-cell">${route.cost}</td>
                        <td className="table-cell">
                          <span className={`badge ${route.isActive ? 'badge-success' : 'badge-error'}`}>
                            {route.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <button
                            onClick={() => {
                              setEditingRoute(route);
                              setShowRouteModal(true);
                            }}
                            className="p-1 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded mr-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Data Management */}
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Data Management</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleExportData}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </button>
                  
                  <button
                    onClick={() => setShowImportModal(true)}
                    className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Import Data
                  </button>
                  
                  <button
                    onClick={handleDownloadTemplate}
                    className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                  >
                    <FileDown className="w-4 h-4" />
                    Download Template
                  </button>
                </div>
                
                <div className="border-t pt-4">
                  <button
                    onClick={clearAllData}
                    className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                    Warning: This will permanently delete all shipments, carriers, and routes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t theme-transition">
        <div className="container-fluid py-4">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {showShipmentModal && (
        <div className="modal-backdrop" onClick={() => setShowShipmentModal(false)}>
          <div className="modal-content max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingShipment ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button
                onClick={() => setShowShipmentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleShipmentSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Tracking Number</label>
                  <input
                    name="trackingNumber"
                    defaultValue={editingShipment?.trackingNumber || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Name</label>
                  <input
                    name="customerName"
                    defaultValue={editingShipment?.customerName || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Email</label>
                  <input
                    name="customerEmail"
                    type="email"
                    defaultValue={editingShipment?.customerEmail || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Customer Phone</label>
                  <input
                    name="customerPhone"
                    defaultValue={editingShipment?.customerPhone || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input
                    name="origin"
                    defaultValue={editingShipment?.origin || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    name="destination"
                    defaultValue={editingShipment?.destination || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Carrier</label>
                  <select name="carrier" defaultValue={editingShipment?.carrier || ''} className="input" required>
                    <option value="">Select Carrier</option>
                    {carriers.filter(c => c.isActive).map(carrier => (
                      <option key={carrier.id} value={carrier.name}>{carrier.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select name="status" defaultValue={editingShipment?.status || 'pending'} className="input">
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Ship Date</label>
                  <input
                    name="shipDate"
                    type="date"
                    defaultValue={editingShipment?.shipDate || new Date().toISOString().split('T')[0]}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Estimated Delivery</label>
                  <input
                    name="estimatedDelivery"
                    type="date"
                    defaultValue={editingShipment?.estimatedDelivery || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Actual Delivery</label>
                  <input
                    name="actualDelivery"
                    type="date"
                    defaultValue={editingShipment?.actualDelivery || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Weight (lbs)</label>
                  <input
                    name="weight"
                    type="number"
                    step="0.1"
                    defaultValue={editingShipment?.weight || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Dimensions</label>
                  <input
                    name="dimensions"
                    placeholder="e.g., 24x18x12 inches"
                    defaultValue={editingShipment?.dimensions || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Value ($)</label>
                  <input
                    name="value"
                    type="number"
                    step="0.01"
                    defaultValue={editingShipment?.value || ''}
                    className="input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select name="priority" defaultValue={editingShipment?.priority || 'medium'} className="input">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Current Location</label>
                  <input
                    name="currentLocation"
                    defaultValue={editingShipment?.currentLocation || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Progress (%)</label>
                  <input
                    name="progress"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={editingShipment?.progress || 0}
                    className="input"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Route (comma-separated)</label>
                  <input
                    name="route"
                    placeholder="New York NY, Chicago IL, Denver CO, Los Angeles CA"
                    defaultValue={editingShipment?.route?.join(', ') || ''}
                    className="input"
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={editingShipment?.notes || ''}
                    className="input h-20 resize-none"
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowShipmentModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingShipment ? 'Update' : 'Create'} Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCarrierModal && (
        <div className="modal-backdrop" onClick={() => setShowCarrierModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingCarrier ? 'Edit Carrier' : 'Add New Carrier'}
              </h3>
              <button
                onClick={() => setShowCarrierModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCarrierSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  name="name"
                  defaultValue={editingCarrier?.name || ''}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Contact</label>
                <input
                  name="contact"
                  defaultValue={editingCarrier?.contact || ''}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={editingCarrier?.email || ''}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Rating</label>
                <input
                  name="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  defaultValue={editingCarrier?.rating || 5}
                  className="input"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editingCarrier?.isActive ?? true}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Active</label>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowCarrierModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCarrier ? 'Update' : 'Create'} Carrier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRouteModal && (
        <div className="modal-backdrop" onClick={() => setShowRouteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingRoute ? 'Edit Route' : 'Add New Route'}
              </h3>
              <button
                onClick={() => setShowRouteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleRouteSubmit} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  name="name"
                  defaultValue={editingRoute?.name || ''}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Origin</label>
                <input
                  name="origin"
                  defaultValue={editingRoute?.origin || ''}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Destination</label>
                <input
                  name="destination"
                  defaultValue={editingRoute?.destination || ''}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Estimated Days</label>
                <input
                  name="estimatedDays"
                  type="number"
                  min="1"
                  defaultValue={editingRoute?.estimatedDays || 1}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Cost ($)</label>
                <input
                  name="cost"
                  type="number"
                  step="0.01"
                  defaultValue={editingRoute?.cost || 0}
                  className="input"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  name="isActive"
                  type="checkbox"
                  defaultChecked={editingRoute?.isActive ?? true}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Active</label>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowRouteModal(false)}
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoute ? 'Update' : 'Create'} Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Shipments</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="alert alert-info">
                <FileText className="w-4 h-4" />
                <p>Upload a CSV file with shipment data. Download the template file to see the required format.</p>
              </div>
              
              <div className="form-group">
                <label className="form-label">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleImportData}
                  className="input"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
                >
                  <FileDown className="w-4 h-4" />
                  Download Template
                </button>
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

      {showConfirmDialog && (
        <div className="modal-backdrop">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Action</h3>
            </div>
            
            <div className="py-4">
              <p className="text-gray-600 dark:text-slate-400">{confirmMessage}</p>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="btn bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedShipment && (
        <div className="modal-backdrop" onClick={() => setSelectedShipment(null)}>
          <div className="modal-content max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipment Details</h3>
              <button
                onClick={() => setSelectedShipment(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Shipment Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Tracking Number:</span>
                      <span className="font-medium">{selectedShipment.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status:</span>
                      <span className={`badge ${getStatusColor(selectedShipment.status)}`}>
                        {getStatusIcon(selectedShipment.status)}
                        {selectedShipment.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Priority:</span>
                      <span className={`badge ${getPriorityColor(selectedShipment.priority)}`}>
                        {selectedShipment.priority}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Carrier:</span>
                      <span className="font-medium">{selectedShipment.carrier}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-medium">{selectedShipment.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="font-medium">{selectedShipment.customerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="font-medium">{selectedShipment.customerPhone}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Route Progress */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Route Progress</h4>
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Progress</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{selectedShipment.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedShipment.progress}%` }}
                    />
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {selectedShipment.route.map((location, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index <= (selectedShipment.progress / 100 * (selectedShipment.route.length - 1))
                            ? 'bg-primary-600'
                            : 'bg-gray-300 dark:bg-slate-600'
                        }`} />
                        <span className={`text-sm ${
                          location === selectedShipment.currentLocation
                            ? 'font-semibold text-primary-600'
                            : 'text-gray-600 dark:text-slate-400'
                        }`}>
                          {location}
                          {location === selectedShipment.currentLocation && ' (Current)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Shipment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Shipment Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight:</span>
                      <span className="font-medium">{selectedShipment.weight} lbs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dimensions:</span>
                      <span className="font-medium">{selectedShipment.dimensions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Value:</span>
                      <span className="font-medium">${selectedShipment.value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ship Date:</span>
                      <span className="font-medium">{selectedShipment.shipDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Est. Delivery:</span>
                      <span className="font-medium">{selectedShipment.estimatedDelivery}</span>
                    </div>
                    {selectedShipment.actualDelivery && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Actual Delivery:</span>
                        <span className="font-medium">{selectedShipment.actualDelivery}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedShipment.notes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700 p-3 rounded">
                    {selectedShipment.notes}
                  </p>
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setSelectedShipment(null)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setEditingShipment(selectedShipment);
                  setSelectedShipment(null);
                  setShowShipmentModal(true);
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Shipment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;