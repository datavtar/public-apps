import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Truck,
  MapPin,
  Clock,
  Search,
  Filter,
  Plus,
  Package,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Loader,
  Info,
  ArrowDownUp,
  Download,
  Upload,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, parseISO, isAfter, differenceInDays, isBefore, addDays } from 'date-fns';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface CheckpointStatus {
  location: Location;
  timestamp: string;
  status: string;
  notes?: string;
}

export type ShipmentStatus = 'in-transit' | 'delayed' | 'delivered' | 'pending';

interface Shipment {
  id: string;
  trackingNumber: string;
  description: string;
  origin: Location;
  destination: Location;
  currentLocation?: Location;
  status: ShipmentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  priority: 'high' | 'medium' | 'low';
  customer: {
    name: string;
    contact: string;
  };
  carrier: string;
  checkpoints: CheckpointStatus[];
  createdAt: string;
  weight?: number;
  dimensions?: string;
  notes?: string;
}

interface FilterOptions {
  status: ShipmentStatus | 'all';
  priority: 'high' | 'medium' | 'low' | 'all';
  searchQuery: string;
  sortBy: 'estimatedDelivery' | 'createdAt' | 'status' | 'priority';
  sortDirection: 'asc' | 'desc';
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

// Main App Component
const App: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    status: 'all',
    priority: 'all',
    searchQuery: '',
    sortBy: 'estimatedDelivery',
    sortDirection: 'asc',
  });
  const [showFilterPanel, setShowFilterPanel] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>(createEmptyShipment());
  const modalRef = useRef<HTMLDivElement>(null);

  // Create an empty shipment for the new/edit form
  function createEmptyShipment(): Partial<Shipment> {
    return {
      trackingNumber: '',
      description: '',
      origin: { lat: 0, lng: 0, address: '' },
      destination: { lat: 0, lng: 0, address: '' },
      status: 'pending',
      estimatedDelivery: new Date().toISOString().split('T')[0],
      priority: 'medium',
      customer: { name: '', contact: '' },
      carrier: '',
      checkpoints: [],
      createdAt: new Date().toISOString(),
      weight: 0,
      dimensions: '',
      notes: ''
    };
  }

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedShipments = localStorage.getItem('shipments');
        if (savedShipments) {
          setShipments(JSON.parse(savedShipments));
        } else {
          // Generate some sample data for first use
          setShipments(generateSampleData());
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setShipments(generateSampleData());
      } finally {
        setIsLoading(false);
      }
    };

    // Add a small delay to simulate loading from a real API
    setTimeout(() => {
      loadData();
    }, 800);
  }, []);

  // Save to localStorage whenever shipments change
  useEffect(() => {
    if (!isLoading && shipments.length > 0) {
      localStorage.setItem('shipments', JSON.stringify(shipments));
    }
  }, [shipments, isLoading]);

  // Handle ESC key to close modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddModal(false);
        setShowDetailModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside modal to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowAddModal(false);
        setShowDetailModal(false);
      }
    };

    if (showAddModal || showDetailModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddModal, showDetailModal]);

  // Filter and sort shipments based on filter options
  const filteredShipments = shipments.filter(shipment => {
    const matchesStatus = filterOptions.status === 'all' || shipment.status === filterOptions.status;
    const matchesPriority = filterOptions.priority === 'all' || shipment.priority === filterOptions.priority;
    const matchesSearch = filterOptions.searchQuery === '' || 
      shipment.trackingNumber.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) ||
      shipment.description.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) ||
      shipment.customer.name.toLowerCase().includes(filterOptions.searchQuery.toLowerCase()) ||
      shipment.carrier.toLowerCase().includes(filterOptions.searchQuery.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  }).sort((a, b) => {
    const { sortBy, sortDirection } = filterOptions;
    
    if (sortBy === 'estimatedDelivery') {
      return sortDirection === 'asc' 
        ? new Date(a.estimatedDelivery).getTime() - new Date(b.estimatedDelivery).getTime()
        : new Date(b.estimatedDelivery).getTime() - new Date(a.estimatedDelivery).getTime();
    }
    
    if (sortBy === 'createdAt') {
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    if (sortBy === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    
    if (sortBy === 'priority') {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      const aWeight = priorityWeight[a.priority] || 0;
      const bWeight = priorityWeight[b.priority] || 0;
      
      return sortDirection === 'asc' ? aWeight - bWeight : bWeight - aWeight;
    }
    
    return 0;
  });

  // Toggle sort direction
  const toggleSort = (field: FilterOptions['sortBy']) => {
    setFilterOptions(prev => ({
      ...prev,
      sortBy: field,
      sortDirection: prev.sortBy === field && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Status counts for the dashboard
  const statusCounts = shipments.reduce(
    (acc, shipment) => {
      acc[shipment.status] = (acc[shipment.status] || 0) + 1;
      return acc;
    },
    {} as Record<ShipmentStatus, number>
  );

  // Data for pie chart
  const pieChartData: ChartData[] = [
    { name: 'In Transit', value: statusCounts['in-transit'] || 0, color: '#3b82f6' },
    { name: 'Delivered', value: statusCounts.delivered || 0, color: '#10b981' },
    { name: 'Delayed', value: statusCounts.delayed || 0, color: '#ef4444' },
    { name: 'Pending', value: statusCounts.pending || 0, color: '#f59e0b' }
  ];

  // Calculate on-time delivery rate
  const calculateOnTimeRate = (): number => {
    const deliveredShipments = shipments.filter(s => s.status === 'delivered' && s.actualDelivery);
    if (deliveredShipments.length === 0) return 100;
    
    const onTimeDeliveries = deliveredShipments.filter(s => {
      if (!s.actualDelivery || !s.estimatedDelivery) return false;
      return !isAfter(new Date(s.actualDelivery), new Date(s.estimatedDelivery));
    });
    
    return Math.round((onTimeDeliveries.length / deliveredShipments.length) * 100);
  };

  // Prepare data for line chart (deliveries by day)
  const prepareDeliveryTimelineData = () => {
    const today = new Date();
    const startDate = addDays(today, -6); // Last 7 days
    const endDate = today;
    
    const daysArray = [];
    let currentDate = startDate;
    
    while (!isAfter(currentDate, endDate)) {
      daysArray.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    }
    
    return daysArray.map(day => {
      const count = shipments.filter(s => {
        const deliveryDate = s.status === 'delivered' && s.actualDelivery 
          ? s.actualDelivery.split('T')[0] 
          : s.estimatedDelivery.split('T')[0];
        return deliveryDate === day;
      }).length;
      
      return {
        date: format(parseISO(day), 'MMM dd'),
        shipments: count
      };
    });
  };

  // Find at-risk shipments (those likely to miss delivery date)
  const findAtRiskShipments = (): Shipment[] => {
    const today = new Date();
    
    return shipments.filter(shipment => {
      // Only consider shipments that aren't delivered yet
      if (shipment.status === 'delivered') return false;
      
      const estDelivery = new Date(shipment.estimatedDelivery);
      
      // If estimated delivery is today or tomorrow and still in transit/pending
      if (differenceInDays(estDelivery, today) <= 1 && 
          (shipment.status === 'in-transit' || shipment.status === 'pending')) {
        return true;
      }
      
      // If already past the estimated delivery date
      if (isBefore(estDelivery, today) && shipment.status !== 'delivered') {
        return true;
      }
      
      return false;
    });
  };

  // Handle adding a new shipment
  const handleAddShipment = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newShipment.trackingNumber || !newShipment.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    const shipmentToAdd: Shipment = {
      id: editMode && selectedShipment ? selectedShipment.id : `ship-${Date.now()}`,
      trackingNumber: newShipment.trackingNumber || '',
      description: newShipment.description || '',
      origin: newShipment.origin || { lat: 0, lng: 0, address: '' },
      destination: newShipment.destination || { lat: 0, lng: 0, address: '' },
      currentLocation: newShipment.currentLocation,
      status: newShipment.status as ShipmentStatus || 'pending',
      estimatedDelivery: newShipment.estimatedDelivery || new Date().toISOString(),
      actualDelivery: newShipment.actualDelivery,
      priority: newShipment.priority as 'high' | 'medium' | 'low' || 'medium',
      customer: newShipment.customer || { name: '', contact: '' },
      carrier: newShipment.carrier || '',
      checkpoints: newShipment.checkpoints || [],
      createdAt: editMode && selectedShipment ? selectedShipment.createdAt : new Date().toISOString(),
      weight: newShipment.weight,
      dimensions: newShipment.dimensions,
      notes: newShipment.notes
    };
    
    if (editMode && selectedShipment) {
      setShipments(shipments.map(s => s.id === selectedShipment.id ? shipmentToAdd : s));
    } else {
      setShipments([...shipments, shipmentToAdd]);
    }
    
    resetForm();
  };

  // Handle deleting a shipment
  const handleDeleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(s => s.id !== id));
      if (selectedShipment?.id === id) {
        setSelectedShipment(null);
        setShowDetailModal(false);
      }
    }
  };

  // Reset the form state
  const resetForm = () => {
    setNewShipment(createEmptyShipment());
    setEditMode(false);
    setShowAddModal(false);
    setSelectedShipment(null);
  };

  // Edit an existing shipment
  const handleEditShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setNewShipment({
      ...shipment
    });
    setEditMode(true);
    setShowDetailModal(false);
    setShowAddModal(true);
  };

  // View details of a shipment
  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowDetailModal(true);
  };

  // Generate sample data for first run
  const generateSampleData = (): Shipment[] => {
    const cities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Miami', lat: 25.7617, lng: -80.1918 },
      { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
      { name: 'Denver', lat: 39.7392, lng: -104.9903 },
      { name: 'Atlanta', lat: 33.7490, lng: -84.3880 },
      { name: 'Boston', lat: 42.3601, lng: -71.0589 }
    ];
    
    const statuses: ShipmentStatus[] = ['in-transit', 'delayed', 'delivered', 'pending'];
    const priorities = ['high', 'medium', 'low'];
    const carriers = ['FastShip Express', 'Global Logistics', 'Prime Delivery', 'Rapid Transport', 'Secure Freight'];
    
    return Array.from({ length: 20 }, (_, i) => {
      const originIndex = Math.floor(Math.random() * cities.length);
      let destinationIndex = Math.floor(Math.random() * cities.length);
      while (destinationIndex === originIndex) {
        destinationIndex = Math.floor(Math.random() * cities.length);
      }
      
      const origin = cities[originIndex];
      const destination = cities[destinationIndex];
      
      // Generate random midpoint for current location (for in-transit shipments)
      const midLat = (origin.lat + destination.lat) / 2 + (Math.random() * 2 - 1);
      const midLng = (origin.lng + destination.lng) / 2 + (Math.random() * 2 - 1);
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
      
      const estDelivery = new Date(createdAt);
      estDelivery.setDate(estDelivery.getDate() + Math.floor(Math.random() * 14) + 1);
      
      let actualDelivery;
      if (status === 'delivered') {
        actualDelivery = new Date(estDelivery);
        // 70% chance of on-time or early delivery
        if (Math.random() < 0.7) {
          actualDelivery.setDate(actualDelivery.getDate() - Math.floor(Math.random() * 2));
        } else {
          actualDelivery.setDate(actualDelivery.getDate() + Math.floor(Math.random() * 3) + 1);
        }
      }
      
      // Generate checkpoints
      const checkpointCount = Math.floor(Math.random() * 5) + 1;
      const checkpoints: CheckpointStatus[] = [];
      
      // Always add origin checkpoint
      checkpoints.push({
        location: { 
          lat: origin.lat, 
          lng: origin.lng, 
          address: `${origin.name} Distribution Center`
        },
        timestamp: new Date(createdAt).toISOString(),
        status: 'Shipment received'
      });
      
      // Add random intermediate checkpoints
      for (let j = 0; j < checkpointCount; j++) {
        const checkpointDate = new Date(createdAt);
        checkpointDate.setDate(checkpointDate.getDate() + j + 1);
        
        // Calculate position along the route
        const progress = (j + 1) / (checkpointCount + 1);
        const lat = origin.lat + (destination.lat - origin.lat) * progress + (Math.random() * 1 - 0.5);
        const lng = origin.lng + (destination.lng - origin.lng) * progress + (Math.random() * 1 - 0.5);
        
        checkpoints.push({
          location: {
            lat,
            lng,
            address: `Transit point ${j+1}`
          },
          timestamp: checkpointDate.toISOString(),
          status: ['In transit', 'Package scanned', 'Arrived at facility', 'Departed facility'][Math.floor(Math.random() * 4)]
        });
      }
      
      // Add destination checkpoint for delivered items
      if (status === 'delivered' && actualDelivery) {
        checkpoints.push({
          location: { 
            lat: destination.lat, 
            lng: destination.lng, 
            address: `${destination.name} Delivery Point`
          },
          timestamp: actualDelivery.toISOString(),
          status: 'Delivered'
        });
      }
      
      return {
        id: `ship-${i+1}`,
        trackingNumber: `TRK${Math.floor(1000000 + Math.random() * 9000000)}`,
        description: `Shipment to ${destination.name}`,
        origin: {
          lat: origin.lat,
          lng: origin.lng,
          address: `${origin.name}, Distribution Center`
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng,
          address: `${destination.name}, Customer Location`
        },
        currentLocation: status === 'in-transit' ? {
          lat: midLat,
          lng: midLng,
          address: 'In transit'
        } : undefined,
        status,
        estimatedDelivery: estDelivery.toISOString(),
        actualDelivery: actualDelivery ? actualDelivery.toISOString() : undefined,
        priority: priorities[Math.floor(Math.random() * priorities.length)] as 'high' | 'medium' | 'low',
        customer: {
          name: `Customer ${i+1}`,
          contact: `customer${i+1}@example.com`
        },
        carrier: carriers[Math.floor(Math.random() * carriers.length)],
        checkpoints,
        createdAt: createdAt.toISOString(),
        weight: Math.floor(Math.random() * 100) + 1,
        dimensions: `${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10}x${Math.floor(Math.random() * 50) + 10} cm`,
        notes: Math.random() > 0.7 ? 'Handle with care' : ''
      };
    });
  };

  // Download shipments as JSON
  const handleExportData = () => {
    const dataStr = JSON.stringify(shipments, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'shipments.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Get template shipment file
  const handleGetTemplate = () => {
    const template = [generateSampleData()[0]];
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'shipments-template.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import shipments from file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string) as Shipment[];
        if (Array.isArray(importedData)) {
          if (window.confirm(`Import ${importedData.length} shipments? This will replace your current data.`)) {
            setShipments(importedData);
          }
        } else {
          alert('Invalid data format. Please use the template.');
        }
      } catch (error) {
        console.error('Error parsing import file:', error);
        alert('Error importing data. Please check file format.');
      }
    };
    reader.readAsText(file);
    
    // Reset the input value so the same file can be imported again if needed
    e.target.value = '';
  };

  // Render the status badge with appropriate color
  const renderStatusBadge = (status: ShipmentStatus) => {
    const statusConfig = {
      'in-transit': { class: 'badge-info', label: 'In Transit' },
      'delayed': { class: 'badge-error', label: 'Delayed' },
      'delivered': { class: 'badge-success', label: 'Delivered' },
      'pending': { class: 'badge-warning', label: 'Pending' }
    };
    
    const config = statusConfig[status];
    
    return (
      <span className={`badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  // Render the priority badge
  const renderPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'high': { class: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: 'High' },
      'medium': { class: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Medium' },
      'low': { class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', label: 'Low' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    
    return (
      <span className={`badge ${config.class}`}>
        {config.label}
      </span>
    );
  };

  // Handler for input changes in the form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, field: string, nestedField?: string) => {
    const value = e.target.value;
    
    if (nestedField) {
      setNewShipment(prev => ({
        ...prev,
        [field]: {
          ...prev[field as keyof typeof prev],
          [nestedField]: value
        }
      }));
    } else {
      setNewShipment(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Format date for display - converts ISO string to human-readable format
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Calculate delivery status (on time, delayed, etc.)
  const calculateDeliveryStatus = (shipment: Shipment): { label: string; className: string } => {
    const today = new Date();
    const estDelivery = new Date(shipment.estimatedDelivery);
    
    if (shipment.status === 'delivered') {
      if (!shipment.actualDelivery) return { label: 'Delivered', className: 'text-green-600 dark:text-green-400' };
      
      const actualDelivery = new Date(shipment.actualDelivery);
      
      if (isAfter(actualDelivery, estDelivery)) {
        const days = differenceInDays(actualDelivery, estDelivery);
        return { 
          label: `Delivered ${days} day${days > 1 ? 's' : ''} late`, 
          className: 'text-red-600 dark:text-red-400'
        };
      } else {
        return { label: 'Delivered on time', className: 'text-green-600 dark:text-green-400' };
      }
    }
    
    if (shipment.status === 'delayed') {
      return { label: 'Delayed', className: 'text-red-600 dark:text-red-400' };
    }
    
    if (isBefore(estDelivery, today)) {
      const days = differenceInDays(today, estDelivery);
      return { 
        label: `${days} day${days > 1 ? 's' : ''} overdue`, 
        className: 'text-red-600 dark:text-red-400'
      };
    }
    
    if (differenceInDays(estDelivery, today) <= 1) {
      return { label: 'Due today/tomorrow', className: 'text-yellow-600 dark:text-yellow-400' };
    }
    
    return { label: 'On schedule', className: 'text-blue-600 dark:text-blue-400' };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <div className="relative">
                <input
                  type="file"
                  id="import-file"
                  className="hidden"
                  accept=".json"
                  onChange={handleImportData}
                />
                <label 
                  htmlFor="import-file"
                  className="btn btn-secondary flex items-center gap-2 cursor-pointer"
                >
                  <Upload size={16} />
                  Import
                </label>
              </div>
              <button 
                className="btn btn-secondary flex items-center gap-2"
                onClick={handleExportData}
              >
                <Download size={16} />
                Export
              </button>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} />
                Add Shipment
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {isLoading ? (
          <div className="flex-center h-64">
            <div className="flex flex-col items-center">
              <Loader className="h-8 w-8 text-primary-600 animate-spin" />
              <p className="mt-2 text-gray-600 dark:text-gray-300">Loading shipments...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Dashboard Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Shipments</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{shipments.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="mt-4 flex justify-between">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">In Transit</p>
                    <p className="font-medium text-primary-600 dark:text-primary-400">{statusCounts['in-transit'] || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivered</p>
                    <p className="font-medium text-green-600 dark:text-green-400">{statusCounts.delivered || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delayed</p>
                    <p className="font-medium text-red-600 dark:text-red-400">{statusCounts.delayed || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">On-Time Delivery</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{calculateOnTimeRate()}%</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="mt-2">
                  <div className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${calculateOnTimeRate()}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Delivery Timeline</p>
                  </div>
                </div>
                <div className="h-24 mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart
                      data={prepareDeliveryTimelineData()}
                      margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis 
                        dataKey="date" 
                        tick={{ fontSize: 10 }} 
                        tickMargin={5} 
                      />
                      <YAxis 
                        tick={{ fontSize: 10 }} 
                        tickMargin={5}
                        domain={[0, 'dataMax + 1']}
                      />
                      <RechartsTooltip 
                        formatter={(value: number) => [`${value} shipments`, 'Count']}
                        labelFormatter={(label: string) => `Date: ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="shipments" 
                        stroke="#3b82f6" 
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status Distribution</p>
                  </div>
                </div>
                <div className="h-32 mt-2 flex-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => 
                          percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                        labelLine={false}
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend 
                        iconSize={8} 
                        layout="horizontal" 
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Alert for At-Risk Shipments */}
            {findAtRiskShipments().length > 0 && (
              <div className="alert alert-warning mb-6 flex-between">
                <div className="flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5" />
                  <span>There are {findAtRiskShipments().length} shipments at risk of late delivery</span>
                </div>
                <button 
                  className="btn btn-sm bg-yellow-200 text-yellow-800 hover:bg-yellow-300"
                  onClick={() => setFilterOptions({ ...filterOptions, status: 'delayed', searchQuery: '' })}
                >
                  View At-Risk
                </button>
              </div>
            )}
            
            {/* Filter and Search */}
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="input pl-10"
                      placeholder="Search shipments..."
                      value={filterOptions.searchQuery}
                      onChange={(e) => setFilterOptions({ ...filterOptions, searchQuery: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2"
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                    >
                      <Filter className="h-4 w-4" />
                      Filters
                      {showFilterPanel ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    {/* Reset filters button */}
                    {(filterOptions.status !== 'all' || filterOptions.priority !== 'all' || filterOptions.searchQuery) && (
                      <button
                        className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2"
                        onClick={() => setFilterOptions({
                          status: 'all',
                          priority: 'all',
                          searchQuery: '',
                          sortBy: 'estimatedDelivery',
                          sortDirection: 'asc',
                        })}
                      >
                        <X className="h-4 w-4" />
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredShipments.length} shipment{filteredShipments.length !== 1 ? 's' : ''}
                  </span>
                  
                  <button 
                    className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 flex items-center gap-2"
                    onClick={handleGetTemplate}
                  >
                    <Download className="h-4 w-4" />
                    Template
                  </button>
                </div>
              </div>
              
              {/* Filter panel */}
              {showFilterPanel && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="form-label" htmlFor="status-filter">Status</label>
                    <select
                      id="status-filter"
                      className="input"
                      value={filterOptions.status}
                      onChange={(e) => setFilterOptions({ ...filterOptions, status: e.target.value as ShipmentStatus | 'all' })}
                    >
                      <option value="all">All Statuses</option>
                      <option value="in-transit">In Transit</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label" htmlFor="priority-filter">Priority</label>
                    <select
                      id="priority-filter"
                      className="input"
                      value={filterOptions.priority}
                      onChange={(e) => setFilterOptions({ ...filterOptions, priority: e.target.value as 'high' | 'medium' | 'low' | 'all' })}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label" htmlFor="sort-by">Sort By</label>
                    <select
                      id="sort-by"
                      className="input"
                      value={filterOptions.sortBy}
                      onChange={(e) => setFilterOptions({
                        ...filterOptions,
                        sortBy: e.target.value as FilterOptions['sortBy']
                      })}
                    >
                      <option value="estimatedDelivery">Estimated Delivery</option>
                      <option value="createdAt">Created Date</option>
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="form-label" htmlFor="sort-direction">Sort Direction</label>
                    <div className="flex gap-2">
                      <button
                        className={`btn flex-1 ${filterOptions.sortDirection === 'asc' 
                          ? 'bg-primary-600 text-white hover:bg-primary-700' 
                          : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                        onClick={() => setFilterOptions({ ...filterOptions, sortDirection: 'asc' })}
                      >
                        Ascending
                      </button>
                      <button
                        className={`btn flex-1 ${filterOptions.sortDirection === 'desc' 
                          ? 'bg-primary-600 text-white hover:bg-primary-700' 
                          : 'bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600'}`}
                        onClick={() => setFilterOptions({ ...filterOptions, sortDirection: 'desc' })}
                      >
                        Descending
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Shipments Table */}
            <div className="overflow-hidden bg-white dark:bg-slate-800 shadow-sm rounded-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('estimatedDelivery')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Delivery Date</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tracking
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Route
                      </th>
                      <th 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Status</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Customer
                      </th>
                      <th 
                        scope="col" 
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                        onClick={() => toggleSort('priority')}
                      >
                        <div className="flex items-center gap-1">
                          <span>Priority</span>
                          <ArrowDownUp className="h-3 w-3" />
                        </div>
                      </th>
                      <th scope="col" className="relative px-4 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredShipments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No shipments found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredShipments.map((shipment) => {
                        const deliveryStatus = calculateDeliveryStatus(shipment);
                        
                        return (
                          <tr 
                            key={shipment.id} 
                            className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer theme-transition"
                            onClick={() => handleViewDetails(shipment)}
                          >
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(shipment.estimatedDelivery)}
                                </span>
                                <span className={`text-xs ${deliveryStatus.className}`}>
                                  {deliveryStatus.label}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {shipment.trackingNumber}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {shipment.carrier}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="truncate max-w-[130px]" title={shipment.origin.address}>
                                  {shipment.origin.address.split(',')[0]}
                                </span>
                                <span className="text-gray-400">→</span>
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="truncate max-w-[130px]" title={shipment.destination.address}>
                                  {shipment.destination.address.split(',')[0]}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {renderStatusBadge(shipment.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <div className="flex flex-col">
                                <span className="text-gray-900 dark:text-white">{shipment.customer.name}</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{shipment.customer.contact}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              {renderPriorityBadge(shipment.priority)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-end items-center space-x-2">
                                <button
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditShipment(shipment);
                                  }}
                                  aria-label="Edit shipment"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteShipment(shipment.id);
                                  }}
                                  aria-label="Delete shipment"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-sm theme-transition py-4 border-t border-gray-200 dark:border-gray-700">
        <div className="container-fluid">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Add/Edit Shipment Modal */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content max-w-2xl w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipment-form-title"
          >
            <div className="modal-header">
              <h3 id="shipment-form-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {editMode ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={resetForm}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddShipment} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="tracking-number">Tracking Number *</label>
                  <input
                    id="tracking-number"
                    type="text"
                    className="input"
                    value={newShipment.trackingNumber || ''}
                    onChange={(e) => handleInputChange(e, 'trackingNumber')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description *</label>
                  <input
                    id="description"
                    type="text"
                    className="input"
                    value={newShipment.description || ''}
                    onChange={(e) => handleInputChange(e, 'description')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="origin-address">Origin Address *</label>
                  <input
                    id="origin-address"
                    type="text"
                    className="input"
                    value={newShipment.origin?.address || ''}
                    onChange={(e) => handleInputChange(e, 'origin', 'address')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="destination-address">Destination Address *</label>
                  <input
                    id="destination-address"
                    type="text"
                    className="input"
                    value={newShipment.destination?.address || ''}
                    onChange={(e) => handleInputChange(e, 'destination', 'address')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    value={newShipment.status || 'pending'}
                    onChange={(e) => handleInputChange(e, 'status')}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="priority">Priority</label>
                  <select
                    id="priority"
                    className="input"
                    value={newShipment.priority || 'medium'}
                    onChange={(e) => handleInputChange(e, 'priority')}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="estimated-delivery">Estimated Delivery *</label>
                  <input
                    id="estimated-delivery"
                    type="date"
                    className="input"
                    value={newShipment.estimatedDelivery?.split('T')[0] || ''}
                    onChange={(e) => handleInputChange(e, 'estimatedDelivery')}
                    required
                  />
                </div>
                
                {newShipment.status === 'delivered' && (
                  <div className="form-group">
                    <label className="form-label" htmlFor="actual-delivery">Actual Delivery Date</label>
                    <input
                      id="actual-delivery"
                      type="date"
                      className="input"
                      value={newShipment.actualDelivery?.split('T')[0] || ''}
                      onChange={(e) => handleInputChange(e, 'actualDelivery')}
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label" htmlFor="carrier">Carrier *</label>
                  <input
                    id="carrier"
                    type="text"
                    className="input"
                    value={newShipment.carrier || ''}
                    onChange={(e) => handleInputChange(e, 'carrier')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="weight">Weight (kg)</label>
                  <input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    value={newShipment.weight || ''}
                    onChange={(e) => handleInputChange(e, 'weight')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="dimensions">Dimensions</label>
                  <input
                    id="dimensions"
                    type="text"
                    className="input"
                    placeholder="L x W x H"
                    value={newShipment.dimensions || ''}
                    onChange={(e) => handleInputChange(e, 'dimensions')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="customer-name">Customer Name *</label>
                  <input
                    id="customer-name"
                    type="text"
                    className="input"
                    value={newShipment.customer?.name || ''}
                    onChange={(e) => handleInputChange(e, 'customer', 'name')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="customer-contact">Customer Contact *</label>
                  <input
                    id="customer-contact"
                    type="text"
                    className="input"
                    value={newShipment.customer?.contact || ''}
                    onChange={(e) => handleInputChange(e, 'customer', 'contact')}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group mt-4">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  className="input min-h-[80px]"
                  value={newShipment.notes || ''}
                  onChange={(e) => handleInputChange(e, 'notes')}
                ></textarea>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editMode ? 'Update Shipment' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Shipment Details Modal */}
      {showDetailModal && selectedShipment && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content max-w-4xl w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipment-details-title"
          >
            <div className="modal-header">
              <h3 id="shipment-details-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Shipment Details: {selectedShipment.trackingNumber}
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setShowDetailModal(false)}
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left column - Basic Details */}
              <div className="md:col-span-1">
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Shipment Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedShipment.description}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Carrier</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedShipment.carrier}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                      <div className="mt-1">{renderStatusBadge(selectedShipment.status)}</div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Priority</p>
                      <div className="mt-1">{renderPriorityBadge(selectedShipment.priority)}</div>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Weight</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedShipment.weight ? `${selectedShipment.weight} kg` : 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Dimensions</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedShipment.dimensions || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedShipment.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Delivery Timeline
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Delivery</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(selectedShipment.estimatedDelivery)}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Actual Delivery</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedShipment.actualDelivery ? formatDate(selectedShipment.actualDelivery) : 'Pending'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Delivery Status</p>
                      <p className={`text-sm font-medium ${calculateDeliveryStatus(selectedShipment).className}`}>
                        {calculateDeliveryStatus(selectedShipment).label}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Info className="h-4 w-4 mr-2" />
                    Customer Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedShipment.customer.name}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedShipment.customer.contact}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right column - Map and Tracking */}
              <div className="md:col-span-2 space-y-4">
                {/* Map */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipment Location
                  </h4>
                  
                  <div className="h-[300px] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                    <MapContainer 
                      center={selectedShipment.currentLocation || selectedShipment.origin} 
                      zoom={5} 
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Origin marker */}
                      <Marker position={[selectedShipment.origin.lat, selectedShipment.origin.lng]}>
                        <Popup>
                          <div className="text-gray-900 font-medium">Origin</div>
                          <div className="text-gray-600 text-sm">{selectedShipment.origin.address}</div>
                        </Popup>
                      </Marker>
                      
                      {/* Destination marker */}
                      <Marker position={[selectedShipment.destination.lat, selectedShipment.destination.lng]}>
                        <Popup>
                          <div className="text-gray-900 font-medium">Destination</div>
                          <div className="text-gray-600 text-sm">{selectedShipment.destination.address}</div>
                        </Popup>
                      </Marker>
                      
                      {/* Current location if available */}
                      {selectedShipment.currentLocation && (
                        <Marker 
                          position={[selectedShipment.currentLocation.lat, selectedShipment.currentLocation.lng]}
                          icon={new Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                          })}
                        >
                          <Popup>
                            <div className="text-gray-900 font-medium">Current Location</div>
                            <div className="text-gray-600 text-sm">
                              {selectedShipment.currentLocation.address || 'In transit'}
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>
                
                {/* Tracking Timeline */}
                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Tracking History
                  </h4>
                  
                  <div className="space-y-4">
                    {selectedShipment.checkpoints.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No tracking information available yet.
                      </p>
                    ) : (
                      <div className={styles.timeline}>
                        {selectedShipment.checkpoints
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .map((checkpoint, index) => (
                            <div key={index} className={styles.timelineItem}>
                              <div className={styles.timelineDot}></div>
                              <div className={styles.timelineDate}>
                                {format(new Date(checkpoint.timestamp), 'MMM dd, yyyy')}
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {format(new Date(checkpoint.timestamp), 'hh:mm a')}
                                </div>
                              </div>
                              <div className={styles.timelineContent}>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {checkpoint.status}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {checkpoint.location.address}
                                </div>
                                {checkpoint.notes && (
                                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {checkpoint.notes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Notes */}
                {selectedShipment.notes && (
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      Notes
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {selectedShipment.notes}
                    </p>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600"
                    onClick={() => setShowDetailModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary flex items-center gap-2"
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditShipment(selectedShipment);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;