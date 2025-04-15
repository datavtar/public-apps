import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Search, Filter, Plus, Edit, Trash2, ChevronDown, ChevronUp, Truck, ArrowDownUp, Download, Upload, MapPin, Calendar, Package, Settings, Moon, Sun, ArrowRight, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import styles from './styles/styles.module.css';

// TypeScript interfaces
interface Shipment {
  id: string;
  trackingNumber: string;
  customer: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  departureDate: string;
  estimatedArrival: string;
  actualArrival?: string;
  carrier: string;
  items: ShipmentItem[];
  priority: Priority;
  notes?: string;
  cost: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
}

interface ShipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight: number;
}

interface DashboardStat {
  title: string;
  value: number | string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  icon: React.ReactNode;
}

enum ShipmentStatus {
  PENDING = 'pending',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

type SortField = 'customer' | 'departureDate' | 'estimatedArrival' | 'status' | 'priority' | 'cost';

interface SortConfig {
  field: SortField;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status: ShipmentStatus | 'all';
  priority: Priority | 'all';
  searchTerm: string;
  dateRange: {
    from: string;
    to: string;
  } | null;
}

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const App: React.FC = () => {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // State for shipments data
  const [shipments, setShipments] = useState<Shipment[]>(() => {
    const savedShipments = localStorage.getItem('shipments');
    return savedShipments ? JSON.parse(savedShipments) : generateSampleShipments();
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>(getEmptyShipment());
  const [newItem, setNewItem] = useState<Partial<ShipmentItem>>({ id: '', name: '', quantity: 1, weight: 0 });
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: 'departureDate', direction: 'desc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: 'all',
    priority: 'all',
    searchTerm: '',
    dateRange: null
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState<boolean>(false);

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save shipments to localStorage
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isAddModalOpen) setIsAddModalOpen(false);
        if (isDetailModalOpen) setIsDetailModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isAddModalOpen, isDetailModalOpen]);

  // Generate tabs
  const tabs: Tab[] = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: <Package size={18} /> },
    { id: 'shipments', label: 'Shipments', icon: <Truck size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ], []);

  // Handle sortable column click
  const handleSort = (field: SortField) => {
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Get sorted and filtered shipments
  const filteredAndSortedShipments = useMemo(() => {
    // First apply filters
    let result = [...shipments];
    
    // Apply status filter
    if (filterConfig.status !== 'all') {
      result = result.filter(s => s.status === filterConfig.status);
    }
    
    // Apply priority filter
    if (filterConfig.priority !== 'all') {
      result = result.filter(s => s.priority === filterConfig.priority);
    }
    
    // Apply search filter
    if (filterConfig.searchTerm) {
      const searchLower = filterConfig.searchTerm.toLowerCase();
      result = result.filter(s => 
        s.trackingNumber.toLowerCase().includes(searchLower) ||
        s.customer.toLowerCase().includes(searchLower) ||
        s.origin.toLowerCase().includes(searchLower) ||
        s.destination.toLowerCase().includes(searchLower) ||
        s.carrier.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply date range filter
    if (filterConfig.dateRange) {
      const { from, to } = filterConfig.dateRange;
      if (from && to) {
        result = result.filter(s => {
          const departureDate = new Date(s.departureDate).getTime();
          const fromDate = new Date(from).getTime();
          const toDate = new Date(to).getTime();
          return departureDate >= fromDate && departureDate <= toDate;
        });
      }
    }

    // Then sort
    return result.sort((a, b) => {
      const field = sortConfig.field;
      let aValue: any = a[field];
      let bValue: any = b[field];

      // Special handling for dates
      if (field === 'departureDate' || field === 'estimatedArrival') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [shipments, sortConfig, filterConfig]);

  // Dashboard statistics
  const dashboardStats = useMemo(() => {
    const totalShipments = shipments.length;
    const inTransitCount = shipments.filter(s => s.status === ShipmentStatus.IN_TRANSIT).length;
    const deliveredCount = shipments.filter(s => s.status === ShipmentStatus.DELIVERED).length;
    const delayedCount = shipments.filter(s => s.status === ShipmentStatus.DELAYED).length;
    const totalCost = shipments.reduce((sum, s) => sum + s.cost, 0);

    return [
      {
        title: 'Total Shipments',
        value: totalShipments,
        change: 5,
        changeType: 'increase',
        icon: <Package size={24} className="text-blue-500" />
      },
      {
        title: 'In Transit',
        value: inTransitCount,
        change: 12,
        changeType: 'increase',
        icon: <Truck size={24} className="text-green-500" />
      },
      {
        title: 'Delivered',
        value: deliveredCount,
        change: 8,
        changeType: 'increase',
        icon: <MapPin size={24} className="text-purple-500" />
      },
      {
        title: 'Delayed',
        value: delayedCount,
        change: 3,
        changeType: 'decrease',
        icon: <Clock size={24} className="text-red-500" />
      },
      {
        title: 'Total Cost',
        value: `$${totalCost.toLocaleString()}`,
        change: 4,
        changeType: 'increase',
        icon: <Download size={24} className="text-amber-500" />
      }
    ] as DashboardStat[];
  }, [shipments]);

  // Chart data for dashboard
  const statusChartData = useMemo(() => {
    const statuses = Object.values(ShipmentStatus);
    return statuses.map(status => ({
      name: formatStatusText(status),
      value: shipments.filter(s => s.status === status).length
    }));
  }, [shipments]);

  const monthlyShipmentData = useMemo(() => {
    const months: { [key: string]: { month: string; shipments: number; deliveries: number } } = {};
    
    // Initialize with last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = format(date, 'MMM yyyy');
      months[monthKey] = { month: monthKey, shipments: 0, deliveries: 0 };
    }
    
    // Count shipments by month
    shipments.forEach(shipment => {
      const departureDate = new Date(shipment.departureDate);
      const monthKey = format(departureDate, 'MMM yyyy');
      
      if (months[monthKey]) {
        months[monthKey].shipments++;
        
        if (shipment.status === ShipmentStatus.DELIVERED) {
          months[monthKey].deliveries++;
        }
      }
    });
    
    return Object.values(months);
  }, [shipments]);

  // Weekly shipment data for line chart
  const weeklyShipmentData = useMemo(() => {
    const weeks: { [key: string]: { week: string; count: number } } = {};
    
    // Initialize weeks (last 7 weeks)
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (i * 7));
      const weekKey = `Week ${Math.ceil((date.getDate() + (new Date(date.getFullYear(), date.getMonth(), 1).getDay())) / 7)}`;
      weeks[weekKey] = { week: weekKey, count: 0 };
    }
    
    // Count shipments by week
    shipments.forEach(shipment => {
      const departureDate = new Date(shipment.departureDate);
      const weekKey = `Week ${Math.ceil((departureDate.getDate() + (new Date(departureDate.getFullYear(), departureDate.getMonth(), 1).getDay())) / 7)}`;
      
      if (weeks[weekKey]) {
        weeks[weekKey].count++;
      }
    });
    
    return Object.values(weeks);
  }, [shipments]);

  // Color array for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Status badge color mapping
  const getStatusColor = (status: ShipmentStatus): string => {
    switch (status) {
      case ShipmentStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case ShipmentStatus.IN_TRANSIT: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ShipmentStatus.DELIVERED: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ShipmentStatus.DELAYED: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case ShipmentStatus.CANCELLED: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return '';
    }
  };

  // Priority badge color mapping
  const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
      case Priority.LOW: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case Priority.MEDIUM: return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case Priority.URGENT: return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return '';
    }
  };

  // Format status text
  function formatStatusText(status: string): string {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Format priority text
  function formatPriorityText(priority: string): string {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  }

  // Add a new shipment
  const handleAddShipment = () => {
    // Create ID and timestamps
    const timestamp = new Date().toISOString();
    const newId = `ship-${Date.now()}`;
    
    // Process items to ensure they have IDs
    const items = (newShipment.items || []).map(item => {
      if (!item.id) {
        return { ...item, id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
      }
      return item;
    });
    
    const completeShipment: Shipment = {
      id: newId,
      trackingNumber: newShipment.trackingNumber || `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      customer: newShipment.customer || '',
      origin: newShipment.origin || '',
      destination: newShipment.destination || '',
      status: newShipment.status || ShipmentStatus.PENDING,
      departureDate: newShipment.departureDate || timestamp,
      estimatedArrival: newShipment.estimatedArrival || timestamp,
      actualArrival: newShipment.actualArrival,
      carrier: newShipment.carrier || '',
      items: items as ShipmentItem[],
      priority: newShipment.priority || Priority.MEDIUM,
      notes: newShipment.notes || '',
      cost: newShipment.cost || 0,
      weight: newShipment.weight || 0,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    setShipments(prevShipments => [...prevShipments, completeShipment]);
    setIsAddModalOpen(false);
    setNewShipment(getEmptyShipment());
  };

  // Add an item to the shipment
  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity === undefined || newItem.weight === undefined) {
      return;
    }

    const itemWithId: ShipmentItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: newItem.name,
      quantity: newItem.quantity,
      weight: newItem.weight
    };

    setNewShipment(prev => ({
      ...prev,
      items: [...(prev.items || []), itemWithId],
      weight: (prev.weight || 0) + (itemWithId.weight * itemWithId.quantity)
    }));

    setNewItem({ id: '', name: '', quantity: 1, weight: 0 });
  };

  // Remove an item from the shipment
  const handleRemoveItem = (itemId: string) => {
    setNewShipment(prev => {
      const items = prev.items?.filter(item => item.id !== itemId) || [];
      const weight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);
      return {
        ...prev,
        items,
        weight
      };
    });
  };

  // Edit a shipment
  const handleEditShipment = () => {
    if (!selectedShipment) return;
    
    const updatedShipment: Shipment = {
      ...selectedShipment,
      ...newShipment,
      updatedAt: new Date().toISOString()
    };
    
    setShipments(prevShipments => 
      prevShipments.map(s => s.id === updatedShipment.id ? updatedShipment : s)
    );
    
    setIsDetailModalOpen(false);
    setSelectedShipment(null);
    setIsEditMode(false);
    setNewShipment(getEmptyShipment());
  };

  // Delete a shipment
  const handleDeleteShipment = (id: string) => {
    setShipments(prevShipments => prevShipments.filter(s => s.id !== id));
    setIsDetailModalOpen(false);
    setSelectedShipment(null);
  };

  // Open detail modal
  const openDetailModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailModalOpen(true);
  };

  // Start editing a shipment
  const startEditingShipment = () => {
    if (selectedShipment) {
      setNewShipment({ ...selectedShipment });
      setIsEditMode(true);
    }
  };

  // Cancel editing
  const cancelEditing = () => {
    setIsEditMode(false);
    setNewShipment(getEmptyShipment());
  };

  // Export shipments as CSV
  const exportShipmentsCSV = () => {
    const headers = ['Tracking Number', 'Customer', 'Origin', 'Destination', 'Status', 
                    'Departure Date', 'Estimated Arrival', 'Actual Arrival', 'Carrier', 
                    'Priority', 'Cost', 'Weight', 'Notes'];
    
    const csvRows = [
      headers.join(','),
      ...shipments.map(s => [
        s.trackingNumber,
        `"${s.customer}"`,
        `"${s.origin}"`,
        `"${s.destination}"`,
        formatStatusText(s.status),
        new Date(s.departureDate).toLocaleDateString(),
        new Date(s.estimatedArrival).toLocaleDateString(),
        s.actualArrival ? new Date(s.actualArrival).toLocaleDateString() : '',
        `"${s.carrier}"`,
        formatPriorityText(s.priority),
        s.cost,
        s.weight,
        `"${s.notes?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shipments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import shipments from CSV
  const importShipmentsCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',');
        
        // Parse the CSV rows into shipments
        const importedShipments: Shipment[] = [];
        
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          const values = parseCSVRow(rows[i]);
          if (values.length !== headers.length) continue;
          
          // Map CSV columns to shipment object
          const timestamp = new Date().toISOString();
          const shipment: Shipment = {
            id: `ship-${Date.now()}-${i}`,
            trackingNumber: values[0],
            customer: values[1],
            origin: values[2],
            destination: values[3],
            status: getStatusFromText(values[4]),
            departureDate: new Date(values[5]).toISOString(),
            estimatedArrival: new Date(values[6]).toISOString(),
            actualArrival: values[7] ? new Date(values[7]).toISOString() : undefined,
            carrier: values[8],
            priority: getPriorityFromText(values[9]),
            cost: parseFloat(values[10]) || 0,
            weight: parseFloat(values[11]) || 0,
            notes: values[12],
            items: [],
            createdAt: timestamp,
            updatedAt: timestamp
          };
          
          importedShipments.push(shipment);
        }
        
        // Add the imported shipments to the existing ones
        setShipments(prev => [...prev, ...importedShipments]);
        
        // Reset file input
        if (event.target) {
          event.target.value = '';
        }
      } catch (error) {
        console.error('Error importing CSV:', error);
        alert('Error importing CSV. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  // Function to parse CSV row handling quoted fields
  const parseCSVRow = (row: string): string[] => {
    const result: string[] = [];
    let insideQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      
      if (char === '"') {
        // Handle double quotes inside quoted strings ("" -> ")
        if (i + 1 < row.length && row[i + 1] === '"' && insideQuotes) {
          currentValue += '"';
          i++; // Skip the next quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        // End of field
        result.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    
    // Don't forget the last field
    result.push(currentValue);
    
    return result;
  };

  // Map text status to enum
  const getStatusFromText = (text: string): ShipmentStatus => {
    const normalizedText = text.toLowerCase().replace(' ', '_');
    return (
      Object.values(ShipmentStatus).find(status => 
        status.toLowerCase() === normalizedText
      ) || ShipmentStatus.PENDING
    );
  };

  // Map text priority to enum
  const getPriorityFromText = (text: string): Priority => {
    const normalizedText = text.toLowerCase();
    return (
      Object.values(Priority).find(priority => 
        priority.toLowerCase() === normalizedText
      ) || Priority.MEDIUM
    );
  };

  // Generate an empty shipment for form initialization
  function getEmptyShipment(): Partial<Shipment> {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      trackingNumber: '',
      customer: '',
      origin: '',
      destination: '',
      status: ShipmentStatus.PENDING,
      departureDate: today.toISOString().substring(0, 10),
      estimatedArrival: tomorrow.toISOString().substring(0, 10),
      carrier: '',
      items: [],
      priority: Priority.MEDIUM,
      notes: '',
      cost: 0,
      weight: 0,
    };
  }

  // Generate sample shipments for demo
  function generateSampleShipments(): Shipment[] {
    const cities = ['New York', 'Chicago', 'Los Angeles', 'Miami', 'Dallas', 'Seattle',
      'Boston', 'Denver', 'Atlanta', 'Portland', 'San Francisco', 'Austin'];
    const carriers = ['FedEx', 'UPS', 'DHL', 'USPS', 'Amazon Logistics'];
    const customers = ['Acme Corp', 'Globex Inc', 'Wayne Enterprises', 'Stark Industries',
      'Umbrella Corporation', 'Initech', 'Hooli', 'Massive Dynamic', 'Soylent Corp'];
    const products = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Toys',
      'Medical Supplies', 'Food Products', 'Machinery Parts', 'Raw Materials', 'Office Supplies'];
    
    const shipments: Shipment[] = [];
    
    // Current date and some date helpers
    const now = new Date();
    const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const future30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Create 20 sample shipments
    for (let i = 0; i < 20; i++) {
      // Random dates within +/- 30 days from now
      const departureDate = new Date(past30Days.getTime() + Math.random() * (future30Days.getTime() - past30Days.getTime()));
      
      // Estimated arrival is 1-10 days after departure
      const estimatedArrival = new Date(departureDate);
      estimatedArrival.setDate(departureDate.getDate() + Math.floor(Math.random() * 10) + 1);
      
      // Randomly determine if the shipment has been delivered
      const isDelivered = departureDate < now && Math.random() > 0.5;
      
      // If delivered, set an actual arrival date
      let actualArrival;
      if (isDelivered) {
        actualArrival = new Date(estimatedArrival);
        // 70% chance to arrive on time, 30% chance to be late
        const onTime = Math.random() > 0.3;
        if (!onTime) {
          actualArrival.setDate(estimatedArrival.getDate() + Math.floor(Math.random() * 3) + 1);
        }
      }
      
      // Determine status based on dates
      let status;
      if (isDelivered) {
        status = ShipmentStatus.DELIVERED;
      } else if (departureDate > now) {
        status = ShipmentStatus.PENDING;
      } else {
        // Shipment has departed but not delivered
        status = Math.random() > 0.8 ? ShipmentStatus.DELAYED : ShipmentStatus.IN_TRANSIT;
      }
      
      // Randomly cancelled in some cases
      if (Math.random() > 0.9) {
        status = ShipmentStatus.CANCELLED;
      }
      
      // Random city pair (different origin and destination)
      let origin, destination;
      do {
        origin = cities[Math.floor(Math.random() * cities.length)];
        destination = cities[Math.floor(Math.random() * cities.length)];
      } while (origin === destination);
      
      // Random items (1-5 items per shipment)
      const itemCount = Math.floor(Math.random() * 5) + 1;
      const items: ShipmentItem[] = [];
      let totalWeight = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 10) + 1;
        const weight = parseFloat((Math.random() * 50).toFixed(2));
        totalWeight += weight * quantity;
        
        items.push({
          id: `item-${i}-${j}`,
          name: `${product} ${String.fromCharCode(65 + j)}`, // Add A, B, C etc. to make unique
          quantity,
          weight
        });
      }
      
      // Random priority, biased towards medium
      const priorityRandom = Math.random();
      let priority;
      if (priorityRandom < 0.2) priority = Priority.LOW;
      else if (priorityRandom < 0.7) priority = Priority.MEDIUM;
      else if (priorityRandom < 0.9) priority = Priority.HIGH;
      else priority = Priority.URGENT;
      
      // Random cost between $50 and $1000
      const cost = parseFloat((Math.random() * 950 + 50).toFixed(2));
      
      // Create shipment
      shipments.push({
        id: `ship-${i}`,
        trackingNumber: `TRK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        customer: customers[Math.floor(Math.random() * customers.length)],
        origin,
        destination,
        status,
        departureDate: departureDate.toISOString(),
        estimatedArrival: estimatedArrival.toISOString(),
        actualArrival: actualArrival?.toISOString(),
        carrier: carriers[Math.floor(Math.random() * carriers.length)],
        items,
        priority,
        notes: Math.random() > 0.7 ? 'Handle with care. Customer requires confirmation upon delivery.' : '',
        cost,
        weight: parseFloat(totalWeight.toFixed(2)),
        createdAt: new Date(departureDate.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 7).toISOString(), // 1-7 days before departure
        updatedAt: new Date(departureDate.getTime() - Math.random() * 1000 * 60 * 60 * 24 * 3).toISOString() // 1-3 days before departure
      });
    }
    
    return shipments;
  }

  // Template for CSV import
  const downloadTemplate = () => {
    const headers = ['Tracking Number', 'Customer', 'Origin', 'Destination', 'Status', 
                    'Departure Date', 'Estimated Arrival', 'Actual Arrival', 'Carrier', 
                    'Priority', 'Cost', 'Weight', 'Notes'];
    const sampleRow = [
      'TRK-123456',
      'Acme Corp',
      'New York',
      'Chicago',
      'Pending',
      '2023-01-01',
      '2023-01-05',
      '',
      'FedEx',
      'Medium',
      '500',
      '125.5',
      'Handle with care'
    ];
    
    const csvContent = [headers.join(','), sampleRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shipment_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4 flex-between">
          <div className="flex items-center gap-2">
            <Truck className="text-primary-600 dark:text-primary-400" size={24} />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
              <span className="theme-toggle-thumb"></span>
              <span className="absolute inset-0 flex items-center justify-center">
                {isDarkMode ? <Moon size={14} className="text-slate-200" /> : <Sun size={14} className="text-amber-500" />}
              </span>
            </button>
            
            {/* User info - simplified for demo */}
            <div className="flex items-center gap-2">
              <div className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 h-8 w-8 rounded-full flex-center">
                <span className="text-sm font-medium">LM</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline-block dark:text-white">Logistics Manager</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container-fluid py-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6 overflow-x-auto theme-transition">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${activeTab === tab.id
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-300'
              } transition-colors`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="stat-card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="stat-title">{stat.title}</p>
                      <p className="stat-value">{stat.value}</p>
                    </div>
                    <div className="p-2 rounded-full bg-gray-50 dark:bg-slate-700">
                      {stat.icon}
                    </div>
                  </div>
                  {stat.change !== undefined && (
                    <div className={`flex items-center mt-2 text-sm ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.changeType === 'increase' ? <ArrowRight size={16} className="rotate-45" /> : <ArrowRight size={16} className="-rotate-45" />}
                      <span>{stat.change}% from last month</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Chart row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly shipments chart */}
              <div className="card p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Monthly Shipments</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyShipmentData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="shipments" fill="#3B82F6" name="Shipments" />
                      <Bar dataKey="deliveries" fill="#10B981" name="Deliveries" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Shipment status distribution */}
              <div className="card p-4">
                <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Shipment Status</h3>
                <div className="h-72 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Weekly trends chart */}
            <div className="card p-4">
              <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Weekly Shipment Trends</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyShipmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} name="Shipments" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent shipments table */}
            <div className="card">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Shipments</h3>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setActiveTab('shipments')}
                >
                  View All
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="table-header px-6 py-3">Tracking #</th>
                      <th className="table-header px-6 py-3">Customer</th>
                      <th className="table-header px-6 py-3">Status</th>
                      <th className="table-header px-6 py-3">Departure</th>
                      <th className="table-header px-6 py-3">Arrival</th>
                      <th className="table-header px-6 py-3">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {shipments.slice(0, 5).map(shipment => (
                      <tr
                        key={shipment.id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                        onClick={() => openDetailModal(shipment)}
                      >
                        <td className="table-cell px-6 py-4">{shipment.trackingNumber}</td>
                        <td className="table-cell px-6 py-4">{shipment.customer}</td>
                        <td className="table-cell px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {formatStatusText(shipment.status)}
                          </span>
                        </td>
                        <td className="table-cell px-6 py-4">{format(new Date(shipment.departureDate), 'MMM dd, yyyy')}</td>
                        <td className="table-cell px-6 py-4">{format(new Date(shipment.estimatedArrival), 'MMM dd, yyyy')}</td>
                        <td className="table-cell px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(shipment.priority)}`}>
                            {formatPriorityText(shipment.priority)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Shipments tab */}
        {activeTab === 'shipments' && (
          <div className="space-y-4 animate-fade-in">
            {/* Action bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search size={18} className="text-gray-400" />
                  </span>
                  <input
                    type="text"
                    className="input pl-10"
                    placeholder="Search shipments..."
                    value={filterConfig.searchTerm}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, searchTerm: e.target.value }))}
                  />
                </div>

                <button
                  className="btn flex items-center justify-center gap-2"
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                >
                  <Filter size={18} />
                  <span>Filter</span>
                  {isFilterPanelOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>

              <div className="flex gap-2">
                <div className="relative">
                  <button 
                    className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                    onClick={() => {
                      const importInput = document.getElementById('import-csv');
                      if (importInput) importInput.click();
                    }}
                  >
                    <Upload size={18} className="mr-1" />
                    Import
                  </button>
                  <input
                    id="import-csv"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={importShipmentsCSV}
                  />
                </div>
                <div className="dropdown relative">
                  <button className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800">
                    <Download size={18} className="mr-1" />
                    Export
                  </button>
                  <div className="dropdown-menu absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={exportShipmentsCSV}
                    >
                      Export as CSV
                    </button>
                    <button 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      onClick={downloadTemplate}
                    >
                      Download Template
                    </button>
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setNewShipment(getEmptyShipment());
                    setIsAddModalOpen(true);
                  }}
                >
                  <Plus size={18} className="mr-1" />
                  Add Shipment
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {isFilterPanelOpen && (
              <div className="card p-4 mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="status-filter" className="form-label">Status</label>
                  <select
                    id="status-filter"
                    className="input"
                    value={filterConfig.status}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, status: e.target.value as ShipmentStatus | 'all' }))}
                  >
                    <option value="all">All Statuses</option>
                    {Object.values(ShipmentStatus).map(status => (
                      <option key={status} value={status}>{formatStatusText(status)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="priority-filter" className="form-label">Priority</label>
                  <select
                    id="priority-filter"
                    className="input"
                    value={filterConfig.priority}
                    onChange={(e) => setFilterConfig(prev => ({ ...prev, priority: e.target.value as Priority | 'all' }))}
                  >
                    <option value="all">All Priorities</option>
                    {Object.values(Priority).map(priority => (
                      <option key={priority} value={priority}>{formatPriorityText(priority)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="date-from" className="form-label">From Date</label>
                  <input
                    id="date-from"
                    type="date"
                    className="input"
                    value={filterConfig.dateRange?.from || ''}
                    onChange={(e) => setFilterConfig(prev => ({
                      ...prev,
                      dateRange: {
                        from: e.target.value,
                        to: prev.dateRange?.to || ''
                      }
                    }))}
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="form-label">To Date</label>
                  <input
                    id="date-to"
                    type="date"
                    className="input"
                    value={filterConfig.dateRange?.to || ''}
                    onChange={(e) => setFilterConfig(prev => ({
                      ...prev,
                      dateRange: {
                        from: prev.dateRange?.from || '',
                        to: e.target.value
                      }
                    }))}
                  />
                </div>
                <div className="sm:col-span-2 md:col-span-4 flex justify-end gap-2">
                  <button
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    onClick={() => setFilterConfig({
                      status: 'all',
                      priority: 'all',
                      searchTerm: '',
                      dateRange: null
                    })}
                  >
                    Reset
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setIsFilterPanelOpen(false)}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {/* Shipments table */}
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead className="bg-gray-50 dark:bg-slate-800">
                    <tr>
                      <th className="table-header px-6 py-3">Tracking #</th>
                      <th 
                        className="table-header px-6 py-3 cursor-pointer" 
                        onClick={() => handleSort('customer')}
                      >
                        <div className="flex items-center">
                          Customer
                          {sortConfig.field === 'customer' && (
                            <ArrowDownUp size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th className="table-header px-6 py-3">Origin</th>
                      <th className="table-header px-6 py-3">Destination</th>
                      <th 
                        className="table-header px-6 py-3 cursor-pointer"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.field === 'status' && (
                            <ArrowDownUp size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header px-6 py-3 cursor-pointer"
                        onClick={() => handleSort('departureDate')}
                      >
                        <div className="flex items-center">
                          Departure
                          {sortConfig.field === 'departureDate' && (
                            <ArrowDownUp size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header px-6 py-3 cursor-pointer"
                        onClick={() => handleSort('estimatedArrival')}
                      >
                        <div className="flex items-center">
                          Arrival
                          {sortConfig.field === 'estimatedArrival' && (
                            <ArrowDownUp size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header px-6 py-3 cursor-pointer"
                        onClick={() => handleSort('priority')}
                      >
                        <div className="flex items-center">
                          Priority
                          {sortConfig.field === 'priority' && (
                            <ArrowDownUp size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="table-header px-6 py-3 cursor-pointer"
                        onClick={() => handleSort('cost')}
                      >
                        <div className="flex items-center">
                          Cost
                          {sortConfig.field === 'cost' && (
                            <ArrowDownUp size={14} className="ml-1" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                    {filteredAndSortedShipments.length > 0 ? (
                      filteredAndSortedShipments.map(shipment => (
                        <tr
                          key={shipment.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                          onClick={() => openDetailModal(shipment)}
                        >
                          <td className="table-cell px-6 py-4">{shipment.trackingNumber}</td>
                          <td className="table-cell px-6 py-4">{shipment.customer}</td>
                          <td className="table-cell px-6 py-4">{shipment.origin}</td>
                          <td className="table-cell px-6 py-4">{shipment.destination}</td>
                          <td className="table-cell px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                              {formatStatusText(shipment.status)}
                            </span>
                          </td>
                          <td className="table-cell px-6 py-4">{format(new Date(shipment.departureDate), 'MMM dd, yyyy')}</td>
                          <td className="table-cell px-6 py-4">{format(new Date(shipment.estimatedArrival), 'MMM dd, yyyy')}</td>
                          <td className="table-cell px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(shipment.priority)}`}>
                              {formatPriorityText(shipment.priority)}
                            </span>
                          </td>
                          <td className="table-cell px-6 py-4">${shipment.cost.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="px-6 py-10 text-center text-gray-500 dark:text-slate-400" colSpan={9}>
                          No shipments found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Settings tab */}
        {activeTab === 'settings' && (
          <div className="card p-6 animate-fade-in">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Settings</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-slate-200">Display Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-slate-200">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400">Switch between light and dark theme</p>
                    </div>
                    <button 
                      className="theme-toggle" 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                      <span className="theme-toggle-thumb"></span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        {isDarkMode ? <Moon size={14} className="text-slate-200" /> : <Sun size={14} className="text-amber-500" />}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-slate-200">Data Management</h3>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-200">Export Data</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Download your shipment data</p>
                    <button 
                      className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                      onClick={exportShipmentsCSV}
                    >
                      <Download size={18} className="mr-2" />
                      Export as CSV
                    </button>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-200">Import Data</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">Upload shipment data from CSV</p>
                    <div className="flex gap-4">
                      <button 
                        className="btn bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                        onClick={() => {
                          const importInput = document.getElementById('settings-import-csv');
                          if (importInput) importInput.click();
                        }}
                      >
                        <Upload size={18} className="mr-2" />
                        Import CSV
                      </button>
                      <input
                        id="settings-import-csv"
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={importShipmentsCSV}
                      />
                      <button 
                        className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                        onClick={downloadTemplate}
                      >
                        Download Template
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-200">Reset Data</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">This will delete all your shipment data and generate new sample data</p>
                    <button 
                      className="btn bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to reset all data? This cannot be undone.')) {
                          setShipments(generateSampleShipments());
                        }
                      }}
                    >
                      Reset to Sample Data
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4 text-gray-800 dark:text-slate-200">About</h3>
                <p className="text-gray-600 dark:text-slate-400">Shipment Tracker v1.0.0</p>
                <p className="text-gray-600 dark:text-slate-400 mt-1">A logistics management application for tracking shipments and deliveries.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Shipment Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddModalOpen(false)}>
          <div 
            className="modal-content max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-shipment-title"
          >
            <div className="modal-header">
              <h3 id="add-shipment-title" className="text-lg font-medium text-gray-900 dark:text-white">Add New Shipment</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="trackingNumber" className="form-label">Tracking Number</label>
                <input
                  id="trackingNumber"
                  type="text"
                  className="input"
                  placeholder="TRK-123456"
                  value={newShipment.trackingNumber || ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, trackingNumber: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="customer" className="form-label">Customer</label>
                <input
                  id="customer"
                  type="text"
                  className="input"
                  placeholder="Customer name"
                  value={newShipment.customer || ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, customer: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="origin" className="form-label">Origin</label>
                <input
                  id="origin"
                  type="text"
                  className="input"
                  placeholder="City, Country"
                  value={newShipment.origin || ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, origin: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="destination" className="form-label">Destination</label>
                <input
                  id="destination"
                  type="text"
                  className="input"
                  placeholder="City, Country"
                  value={newShipment.destination || ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, destination: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  id="status"
                  className="input"
                  value={newShipment.status || ShipmentStatus.PENDING}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, status: e.target.value as ShipmentStatus }))}
                >
                  {Object.values(ShipmentStatus).map(status => (
                    <option key={status} value={status}>{formatStatusText(status)}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="priority" className="form-label">Priority</label>
                <select
                  id="priority"
                  className="input"
                  value={newShipment.priority || Priority.MEDIUM}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, priority: e.target.value as Priority }))}
                >
                  {Object.values(Priority).map(priority => (
                    <option key={priority} value={priority}>{formatPriorityText(priority)}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="departureDate" className="form-label">Departure Date</label>
                <input
                  id="departureDate"
                  type="date"
                  className="input"
                  value={newShipment.departureDate ? new Date(newShipment.departureDate).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, departureDate: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="estimatedArrival" className="form-label">Estimated Arrival</label>
                <input
                  id="estimatedArrival"
                  type="date"
                  className="input"
                  value={newShipment.estimatedArrival ? new Date(newShipment.estimatedArrival).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, estimatedArrival: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="carrier" className="form-label">Carrier</label>
                <input
                  id="carrier"
                  type="text"
                  className="input"
                  placeholder="FedEx, UPS, etc."
                  value={newShipment.carrier || ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, carrier: e.target.value }))}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="cost" className="form-label">Cost ($)</label>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="0.00"
                  value={newShipment.cost || ''}
                  onChange={(e) => setNewShipment(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-base font-medium text-gray-900 dark:text-white">Items</h4>
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  Total Weight: {newShipment.weight?.toFixed(2) || '0.00'} kg
                </div>
              </div>
              
              {/* Item list */}
              <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-3">
                {newShipment.items && newShipment.items.length > 0 ? (
                  <ul className="divide-y divide-gray-200 dark:divide-slate-600">
                    {newShipment.items.map((item, index) => (
                      <li key={item.id} className="py-2 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">
                            {item.quantity} × {item.weight.toFixed(2)} kg = {(item.quantity * item.weight).toFixed(2)} kg
                          </p>
                        </div>
                        <button
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No items added yet</p>
                )}
              </div>
              
              {/* Add item form */}
              <div className="grid grid-cols-1 sm:grid-cols-8 gap-2 items-end">
                <div className="sm:col-span-3 form-group mb-0">
                  <label htmlFor="itemName" className="form-label">Item Name</label>
                  <input
                    id="itemName"
                    type="text"
                    className="input"
                    placeholder="Product name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                
                <div className="sm:col-span-2 form-group mb-0">
                  <label htmlFor="itemQuantity" className="form-label">Quantity</label>
                  <input
                    id="itemQuantity"
                    type="number"
                    min="1"
                    className="input"
                    placeholder="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
                
                <div className="sm:col-span-2 form-group mb-0">
                  <label htmlFor="itemWeight" className="form-label">Weight (kg)</label>
                  <input
                    id="itemWeight"
                    type="number"
                    min="0"
                    step="0.01"
                    className="input"
                    placeholder="0.00"
                    value={newItem.weight || ''}
                    onChange={(e) => setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                
                <div className="sm:col-span-1">
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleAddItem}
                    disabled={!newItem.name || !newItem.quantity || !newItem.weight}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <label htmlFor="notes" className="form-label">Notes</label>
              <textarea
                id="notes"
                rows={3}
                className="input"
                placeholder="Additional information about this shipment"
                value={newShipment.notes || ''}
                onChange={(e) => setNewShipment(prev => ({ ...prev, notes: e.target.value }))}
              ></textarea>
            </div>
            
            <div className="modal-footer">
              <button
                type="button"
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddShipment}
                disabled={!newShipment.customer || !newShipment.origin || !newShipment.destination}
              >
                Add Shipment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Details Modal */}
      {isDetailModalOpen && selectedShipment && (
        <div className="modal-backdrop" onClick={() => {
          if (!isEditMode) {
            setIsDetailModalOpen(false);
            setSelectedShipment(null);
          }
        }}>
          <div 
            className="modal-content max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shipment-detail-title"
          >
            <div className="modal-header">
              <h3 id="shipment-detail-title" className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Shipment' : 'Shipment Details'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
                onClick={() => {
                  if (isEditMode) {
                    setIsEditMode(false);
                  } else {
                    setIsDetailModalOpen(false);
                    setSelectedShipment(null);
                  }
                }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            {!isEditMode ? (
              <div className="mt-4">
                <div className="flex justify-between pb-4 mb-4 border-b border-gray-200 dark:border-slate-700">
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Tracking Number:</p>
                      <p className="text-sm font-medium">{selectedShipment.trackingNumber}</p>
                    </div>
                    <div className="mt-1 flex items-center gap-1">
                      <p className="text-xs text-gray-500 dark:text-slate-400">Created:</p>
                      <p className="text-sm">{format(new Date(selectedShipment.createdAt), 'MMM dd, yyyy')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <button
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"
                      onClick={startEditingShipment}
                    >
                      <Edit size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      className="btn btn-sm bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 flex items-center gap-1"
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this shipment?')) {
                          handleDeleteShipment(selectedShipment.id);
                        }
                      }}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Shipment Information</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Customer</p>
                        <p className="font-medium">{selectedShipment.customer}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Origin</p>
                          <p className="font-medium">{selectedShipment.origin}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Destination</p>
                          <p className="font-medium">{selectedShipment.destination}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Status</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium ${getStatusColor(selectedShipment.status)}`}>
                            {formatStatusText(selectedShipment.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Priority</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 mt-1 rounded-full text-xs font-medium ${getPriorityColor(selectedShipment.priority)}`}>
                            {formatPriorityText(selectedShipment.priority)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Departure Date</p>
                            <p className="font-medium">{format(new Date(selectedShipment.departureDate), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Estimated Arrival</p>
                            <p className="font-medium">{format(new Date(selectedShipment.estimatedArrival), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                      </div>
                      
                      {selectedShipment.actualArrival && (
                        <div className="flex items-center">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Actual Arrival</p>
                            <p className="font-medium">{format(new Date(selectedShipment.actualArrival), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Carrier</p>
                          <p className="font-medium">{selectedShipment.carrier}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Cost</p>
                          <p className="font-medium">${selectedShipment.cost.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right column */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-3">Items & Notes</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-500 dark:text-slate-400">Items ({selectedShipment.items.length})</p>
                          <p className="text-sm text-gray-500 dark:text-slate-400">Total Weight: {selectedShipment.weight.toFixed(2)} kg</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                          {selectedShipment.items.length > 0 ? (
                            <ul className="divide-y divide-gray-200 dark:divide-slate-600">
                              {selectedShipment.items.map((item) => (
                                <li key={item.id} className="py-2">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-slate-400">
                                    {item.quantity} × {item.weight.toFixed(2)} kg = {(item.quantity * item.weight).toFixed(2)} kg
                                  </p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-2">No items</p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">Notes</p>
                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                          {selectedShipment.notes ? (
                            <p className="text-sm">{selectedShipment.notes}</p>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-slate-400 text-center">No notes</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="edit-customer" className="form-label">Customer</label>
                    <input
                      id="edit-customer"
                      type="text"
                      className="input"
                      value={newShipment.customer || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, customer: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-trackingNumber" className="form-label">Tracking Number</label>
                    <input
                      id="edit-trackingNumber"
                      type="text"
                      className="input"
                      value={newShipment.trackingNumber || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, trackingNumber: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-origin" className="form-label">Origin</label>
                    <input
                      id="edit-origin"
                      type="text"
                      className="input"
                      value={newShipment.origin || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, origin: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-destination" className="form-label">Destination</label>
                    <input
                      id="edit-destination"
                      type="text"
                      className="input"
                      value={newShipment.destination || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, destination: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-status" className="form-label">Status</label>
                    <select
                      id="edit-status"
                      className="input"
                      value={newShipment.status || ShipmentStatus.PENDING}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, status: e.target.value as ShipmentStatus }))}
                    >
                      {Object.values(ShipmentStatus).map(status => (
                        <option key={status} value={status}>{formatStatusText(status)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-priority" className="form-label">Priority</label>
                    <select
                      id="edit-priority"
                      className="input"
                      value={newShipment.priority || Priority.MEDIUM}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, priority: e.target.value as Priority }))}
                    >
                      {Object.values(Priority).map(priority => (
                        <option key={priority} value={priority}>{formatPriorityText(priority)}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-departureDate" className="form-label">Departure Date</label>
                    <input
                      id="edit-departureDate"
                      type="date"
                      className="input"
                      value={newShipment.departureDate ? new Date(newShipment.departureDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, departureDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-estimatedArrival" className="form-label">Estimated Arrival</label>
                    <input
                      id="edit-estimatedArrival"
                      type="date"
                      className="input"
                      value={newShipment.estimatedArrival ? new Date(newShipment.estimatedArrival).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, estimatedArrival: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-actualArrival" className="form-label">Actual Arrival (if delivered)</label>
                    <input
                      id="edit-actualArrival"
                      type="date"
                      className="input"
                      value={newShipment.actualArrival ? new Date(newShipment.actualArrival).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, actualArrival: e.target.value || undefined }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-carrier" className="form-label">Carrier</label>
                    <input
                      id="edit-carrier"
                      type="text"
                      className="input"
                      value={newShipment.carrier || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, carrier: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="edit-cost" className="form-label">Cost ($)</label>
                    <input
                      id="edit-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      className="input"
                      value={newShipment.cost || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div className="form-group md:col-span-2">
                    <label htmlFor="edit-notes" className="form-label">Notes</label>
                    <textarea
                      id="edit-notes"
                      rows={3}
                      className="input"
                      value={newShipment.notes || ''}
                      onChange={(e) => setNewShipment(prev => ({ ...prev, notes: e.target.value }))}
                    ></textarea>
                  </div>
                </div>
                
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleEditShipment}
                    disabled={!newShipment.customer || !newShipment.origin || !newShipment.destination}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-8">
        <div className="container-fluid text-center text-gray-500 dark:text-slate-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;