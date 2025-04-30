import React, { useState, useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import {
  Truck,
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  MapPin,
  X,
  FileText,
  Download,
  Upload,
  ArrowUp,
  ArrowDown,
  Moon,
  Sun,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowLeftRight,
  ChevronRight
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

// Type definitions
type ShipmentStatus = 'In Transit' | 'Delivered' | 'Delayed' | 'Processing';

interface Shipment {
  id: string;
  trackingNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  origin: {
    address: string;
    coordinates: [number, number]; // [latitude, longitude]
  };
  destination: {
    address: string;
    coordinates: [number, number]; // [latitude, longitude]
  };
  currentLocation?: {
    coordinates: [number, number]; // [latitude, longitude]
    updatedAt: string;
  };
  status: ShipmentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: {
    name: string;
    quantity: number;
    weight: number; // in kg
  }[];
  notes?: string;
  createdAt: string;
  carrier: string;
}

interface ShipmentFilterOptions {
  status: ShipmentStatus | 'All';
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
  sortBy: keyof Pick<Shipment, 'createdAt' | 'estimatedDelivery'> | 'customer.name';
  sortOrder: 'asc' | 'desc';
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

const DEFAULT_LOCATION: [number, number] = [37.7749, -122.4194]; // San Francisco

const STATUS_COLORS = {
  'In Transit': 'bg-indigo-500',
  'Delivered': 'bg-emerald-500',
  'Delayed': 'bg-rose-500',
  'Processing': 'bg-amber-500'
};

const STATUS_ICONS = {
  'In Transit': <Truck className="h-4 w-4" />,
  'Delivered': <CheckCircle className="h-4 w-4" />,
  'Delayed': <AlertCircle className="h-4 w-4" />,
  'Processing': <Clock className="h-4 w-4" />
};

const App: React.FC = () => {
  // State for dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // States for shipment management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(DEFAULT_LOCATION);
  const [filterOptions, setFilterOptions] = useState<ShipmentFilterOptions>({
    status: 'All',
    dateRange: {
      start: '',
      end: ''
    },
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'map' | 'list' | 'analytics'>('map');
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({
    id: '',
    trackingNumber: '',
    customer: {
      name: '',
      email: '',
      phone: ''
    },
    origin: {
      address: '',
      coordinates: [0, 0]
    },
    destination: {
      address: '',
      coordinates: [0, 0]
    },
    status: 'Processing',
    estimatedDelivery: '',
    items: [{ name: '', quantity: 1, weight: 0 }],
    carrier: '',
    notes: ''
  });

  // Add ref to handle modal close on Escape key
  const modalRef = useRef<HTMLDivElement>(null);

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

  // Load shipments from local storage
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      setShipments(JSON.parse(savedShipments));
    } else {
      // Load sample data if no shipments exist
      setShipments(generateSampleShipments());
    }
  }, []);

  // Save shipments to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('shipments', JSON.stringify(shipments));
  }, [shipments]);

  // Handle escape key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAllModals();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Function to close all modals
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsFilterModalOpen(false);
    setIsDetailsModalOpen(false);
    document.body.classList.remove('modal-open');
  };

  // Function to generate random coordinates near a center point
  const getRandomCoordinates = (center: [number, number], radiusInKm: number): [number, number] => {
    const radiusInDeg = radiusInKm / 111; // 1 degree is approximately 111 km
    const [lat, lng] = center;
    const randomLat = lat + (Math.random() * 2 - 1) * radiusInDeg;
    const randomLng = lng + (Math.random() * 2 - 1) * radiusInDeg;
    return [randomLat, randomLng];
  };

  // Generate sample shipments for demo purposes
  const generateSampleShipments = (): Shipment[] => {
    const locations = [
      { name: "San Francisco", coordinates: [37.7749, -122.4194] },
      { name: "Los Angeles", coordinates: [34.0522, -118.2437] },
      { name: "New York", coordinates: [40.7128, -74.0060] },
      { name: "Chicago", coordinates: [41.8781, -87.6298] },
      { name: "Houston", coordinates: [29.7604, -95.3698] },
      { name: "Phoenix", coordinates: [33.4484, -112.0740] }
    ];

    const carriers = ["FastShip", "ExpressLogistics", "QuickCargo", "SecureFreight", "GlobalTransport"];
    const statuses: ShipmentStatus[] = ["In Transit", "Delivered", "Delayed", "Processing"];

    const sampleShipments = Array.from({ length: 25 }, (_, index) => {
      const originIdx = Math.floor(Math.random() * locations.length);
      let destIdx = Math.floor(Math.random() * locations.length);
      
      // Ensure dest and origin are different
      while (destIdx === originIdx) {
        destIdx = Math.floor(Math.random() * locations.length);
      }

      const origin = locations[originIdx];
      const destination = locations[destIdx];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      // Current location will be somewhere between origin and destination for in-transit shipments
      const currentLocation = status === 'In Transit' 
        ? [
            origin.coordinates[0] + (destination.coordinates[0] - origin.coordinates[0]) * Math.random(),
            origin.coordinates[1] + (destination.coordinates[1] - origin.coordinates[1]) * Math.random() 
          ] as [number, number]
        : status === 'Delivered' 
          ? destination.coordinates as [number, number] 
          : origin.coordinates as [number, number];

      // Generate dates for the shipment
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 10)); // 0-10 days ago
      
      const estDeliveryDate = new Date(createdDate);
      estDeliveryDate.setDate(createdDate.getDate() + 3 + Math.floor(Math.random() * 7)); // 3-10 days from created
      
      let actualDeliveryDate;
      if (status === 'Delivered') {
        actualDeliveryDate = new Date(estDeliveryDate);
        // 50% chance of early delivery, 25% on-time, 25% late
        const deliveryOffset = Math.random() < 0.5 ? -1 : Math.random() < 0.67 ? 0 : 1;
        actualDeliveryDate.setDate(estDeliveryDate.getDate() + deliveryOffset);
      }

      return {
        id: `SHIP-${1000 + index}`,
        trackingNumber: `TRK${100000 + Math.floor(Math.random() * 900000)}`,
        customer: {
          name: `Customer ${index + 1}`,
          email: `customer${index + 1}@example.com`,
          phone: `+1-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
        },
        origin: {
          address: `${Math.floor(Math.random() * 1000) + 100} Main St, ${origin.name}`,
          coordinates: origin.coordinates as [number, number]
        },
        destination: {
          address: `${Math.floor(Math.random() * 1000) + 100} Market St, ${destination.name}`,
          coordinates: destination.coordinates as [number, number]
        },
        currentLocation: {
          coordinates: currentLocation,
          updatedAt: new Date().toISOString()
        },
        status,
        estimatedDelivery: estDeliveryDate.toISOString(),
        actualDelivery: status === 'Delivered' ? actualDeliveryDate?.toISOString() : undefined,
        items: [
          {
            name: `Product ${index + 1}`,
            quantity: Math.floor(Math.random() * 5) + 1,
            weight: parseFloat((Math.random() * 20 + 1).toFixed(2))
          }
        ],
        notes: Math.random() > 0.7 ? `Notes for shipment ${index + 1}` : undefined,
        createdAt: createdDate.toISOString(),
        carrier: carriers[Math.floor(Math.random() * carriers.length)]
      };
    });

    return sampleShipments;
  };

  // Filter and sort shipments
  const filteredShipments = shipments.filter(shipment => {
    // Filter by status
    if (filterOptions.status !== 'All' && shipment.status !== filterOptions.status) {
      return false;
    }

    // Filter by date range
    if (filterOptions.dateRange.start && new Date(shipment.createdAt) < new Date(filterOptions.dateRange.start)) {
      return false;
    }
    
    if (filterOptions.dateRange.end) {
      const endDate = new Date(filterOptions.dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      if (new Date(shipment.createdAt) > endDate) {
        return false;
      }
    }

    // Filter by search term
    const searchLower = filterOptions.search.toLowerCase();
    if (
      searchLower &&
      !shipment.trackingNumber.toLowerCase().includes(searchLower) &&
      !shipment.customer.name.toLowerCase().includes(searchLower) &&
      !shipment.id.toLowerCase().includes(searchLower) &&
      !shipment.origin.address.toLowerCase().includes(searchLower) &&
      !shipment.destination.address.toLowerCase().includes(searchLower)
    ) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Handle sorting by nested properties
    const getSortValue = (shipment: Shipment, key: string) => {
      if (key === 'customer.name') {
        return shipment.customer.name;
      }
      return shipment[key as keyof Shipment] as string;
    };

    const valueA = getSortValue(a, filterOptions.sortBy);
    const valueB = getSortValue(b, filterOptions.sortBy);

    if (filterOptions.sortOrder === 'asc') {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0;
    }
  });

  const handleCreateShipment = () => {
    setIsEditMode(false);
    setNewShipment({
      id: `SHIP-${1000 + shipments.length}`,
      trackingNumber: `TRK${100000 + Math.floor(Math.random() * 900000)}`,
      customer: {
        name: '',
        email: '',
        phone: ''
      },
      origin: {
        address: '',
        coordinates: DEFAULT_LOCATION
      },
      destination: {
        address: '',
        coordinates: DEFAULT_LOCATION
      },
      status: 'Processing',
      estimatedDelivery: new Date().toISOString().split('T')[0],
      items: [{ name: '', quantity: 1, weight: 0 }],
      carrier: '',
      notes: ''
    });
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleEditShipment = (shipment: Shipment) => {
    setIsEditMode(true);
    setNewShipment({ ...shipment });
    setIsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleSaveShipment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (
      !newShipment.customer?.name ||
      !newShipment.origin?.address ||
      !newShipment.destination?.address ||
      !newShipment.estimatedDelivery ||
      !newShipment.carrier ||
      !newShipment.trackingNumber
    ) {
      alert('Please fill in all required fields');
      return;
    }

    // Create a complete shipment object
    const completeShipment: Shipment = {
      ...(newShipment as Shipment),
      createdAt: isEditMode ? (newShipment.createdAt as string) : new Date().toISOString(),
      currentLocation: newShipment.currentLocation || {
        coordinates: newShipment.origin?.coordinates || DEFAULT_LOCATION,
        updatedAt: new Date().toISOString()
      }
    };

    if (isEditMode) {
      setShipments(shipments.map(ship => ship.id === completeShipment.id ? completeShipment : ship));
    } else {
      setShipments([...shipments, completeShipment]);
    }

    closeAllModals();
  };

  const handleDeleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(shipment => shipment.id !== id));
    }
  };

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsDetailsModalOpen(true);
    document.body.classList.add('modal-open');
  };

  const handleTabChange = (tab: 'map' | 'list' | 'analytics') => {
    setActiveTab(tab);
  };

  const handleMapClick = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    if (shipment.currentLocation) {
      setMapCenter(shipment.currentLocation.coordinates);
    }
  };

  const handleResetFilters = () => {
    setFilterOptions({
      status: 'All',
      dateRange: {
        start: '',
        end: ''
      },
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setIsFilterModalOpen(false);
  };

  const handleSortChange = (field: ShipmentFilterOptions['sortBy']) => {
    setFilterOptions(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'desc' ? 'asc' : 'desc'
    }));
  };

  // Calculate statistics for the analytics tab
  const calculateAnalytics = () => {
    const statusCounts = {
      'In Transit': 0,
      'Delivered': 0,
      'Delayed': 0,
      'Processing': 0
    };

    const carrierShipments: Record<string, number> = {};

    shipments.forEach(shipment => {
      statusCounts[shipment.status]++;
      
      // Count by carrier
      if (carrierShipments[shipment.carrier]) {
        carrierShipments[shipment.carrier]++;
      } else {
        carrierShipments[shipment.carrier] = 1;
      }
    });

    const statusData = Object.keys(statusCounts).map(status => ({
      name: status,
      value: statusCounts[status as ShipmentStatus]
    }));

    const carrierData = Object.keys(carrierShipments).map(carrier => ({
      name: carrier,
      shipments: carrierShipments[carrier]
    }));

    return { statusData, carrierData };
  };

  const analytics = calculateAnalytics();

  // Function to format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Export shipments as CSV
  const exportToCSV = () => {
    const headers = [
      'ID', 'Tracking Number', 'Customer Name', 'Customer Email', 'Customer Phone',
      'Origin Address', 'Origin Lat', 'Origin Lng',
      'Destination Address', 'Destination Lat', 'Destination Lng',
      'Status', 'Estimated Delivery', 'Actual Delivery', 'Carrier',
      'Created At', 'Notes'
    ];

    const rows = shipments.map(shipment => [
      shipment.id,
      shipment.trackingNumber,
      shipment.customer.name,
      shipment.customer.email,
      shipment.customer.phone,
      shipment.origin.address,
      shipment.origin.coordinates[0],
      shipment.origin.coordinates[1],
      shipment.destination.address,
      shipment.destination.coordinates[0],
      shipment.destination.coordinates[1],
      shipment.status,
      formatDate(shipment.estimatedDelivery),
      shipment.actualDelivery ? formatDate(shipment.actualDelivery) : '',
      shipment.carrier,
      formatDate(shipment.createdAt),
      shipment.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Handle commas in cell values by enclosing in quotes
        return typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
          ? `"${cell.replace(/"/g, '""')}"`
          : cell;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shipments.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Component to recenter map on active shipment
  const MapUpdater = () => {
    const map = useMap();
    
    useEffect(() => {
      map.setView(mapCenter, map.getZoom());
    }, [mapCenter, map]);
    
    return null;
  };

  // Template for import
  const getCSVTemplate = () => {
    const headers = [
      'Customer Name', 'Customer Email', 'Customer Phone',
      'Origin Address', 'Origin Lat', 'Origin Lng',
      'Destination Address', 'Destination Lat', 'Destination Lng',
      'Status', 'Estimated Delivery', 'Carrier', 'Notes'
    ];

    // Sample row
    const sampleRow = [
      'John Doe', 'john@example.com', '+1-555-123-4567',
      '123 Main St, San Francisco', '37.7749', '-122.4194',
      '456 Market St, Los Angeles', '34.0522', '-118.2437',
      'Processing', '2023-12-31', 'FastShip', 'Handle with care'
    ];

    const csvContent = [
      headers.join(','),
      sampleRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shipments_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-container min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-[var(--z-sticky)]">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center space-x-3">
              <div className={`${styles.logoContainer} bg-gradient-to-r from-indigo-500 to-violet-500 rounded-lg p-2 text-white`}>
                <Truck className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Shipment Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className={`${styles.themeToggle}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className={`${styles.themeToggleThumb}`}>
                  {isDarkMode ? 
                    <Moon className="h-3 w-3 text-slate-200" /> : 
                    <Sun className="h-3 w-3 text-amber-500" />
                  }
                </span>
              </button>
              <button 
                className={`${styles.button} flex-center gap-2`}
                onClick={handleCreateShipment}
              >
                <Plus className="h-4 w-4" />
                <span>New Shipment</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm sticky top-16 z-[var(--z-sticky)]">
        <div className="container-fluid">
          <div className="flex border-b dark:border-slate-700">
            <button 
              className={`py-4 px-6 font-medium flex items-center gap-2 ${activeTab === 'map' ? `${styles.activeTab}` : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
              onClick={() => handleTabChange('map')}
            >
              <MapPin className="h-4 w-4" />
              <span>Map View</span>
            </button>
            <button 
              className={`py-4 px-6 font-medium flex items-center gap-2 ${activeTab === 'list' ? `${styles.activeTab}` : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
              onClick={() => handleTabChange('list')}
            >
              <Package className="h-4 w-4" />
              <span>List View</span>
            </button>
            <button 
              className={`py-4 px-6 font-medium flex items-center gap-2 ${activeTab === 'analytics' ? `${styles.activeTab}` : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'}`}
              onClick={() => handleTabChange('analytics')}
            >
              <FileText className="h-4 w-4" />
              <span>Analytics</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className={`${styles.input} pl-10`}
              placeholder="Search by ID, tracking, customer..."
              value={filterOptions.search}
              onChange={(e) => setFilterOptions({...filterOptions, search: e.target.value})}
            />
          </div>
          <div className="flex gap-3">
            <button 
              className={`${styles.buttonOutline} flex-center gap-2`}
              onClick={() => {
                setIsFilterModalOpen(true);
                document.body.classList.add('modal-open');
              }}
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
            <div className="dropdown relative">
              <button 
                className={`${styles.buttonOutline} flex-center gap-2`}
                onClick={exportToCSV}
              >
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
            <button 
              className={`${styles.buttonOutline} flex-center gap-2`}
              onClick={getCSVTemplate}
            >
              <Download className="h-4 w-4" />
              <span className="responsive-hide">Template</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'map' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
            {/* Map */}
            <div className="md:col-span-2 relative rounded-lg overflow-hidden shadow-md h-full">
              <MapContainer 
                center={mapCenter} 
                zoom={5} 
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {shipments.map((shipment) => (
                  shipment.currentLocation && (
                    <Marker 
                      key={shipment.id} 
                      position={shipment.currentLocation.coordinates}
                      eventHandlers={{
                        click: () => handleMapClick(shipment),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-medium">{shipment.customer.name}</h3>
                          <p className="text-sm">ID: {shipment.id}</p>
                          <p className="text-sm">Status: {shipment.status}</p>
                          <button 
                            className={`${styles.textLink} text-sm mt-2 hover:underline`}
                            onClick={() => handleViewDetails(shipment)}
                          >
                            View Details
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
                <MapUpdater />
              </MapContainer>
            </div>

            {/* Shipment List (Smaller version for map view) */}
            <div className="h-full overflow-auto">
              <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md h-full">
                <div className="p-4 border-b dark:border-slate-700">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Recent Shipments</h2>
                </div>
                <div className="p-0">
                  <ul className="divide-y divide-gray-200 dark:divide-slate-700 overflow-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                    {filteredShipments.slice(0, 10).map((shipment) => (
                      <li key={shipment.id} className={`${styles.shipmentItem} p-4 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer`} onClick={() => handleMapClick(shipment)}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">{shipment.customer.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">{shipment.id} | {shipment.trackingNumber}</p>
                            <div className="flex items-center mt-1">
                              <span className={`flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[shipment.status]} bg-opacity-10 text-${STATUS_COLORS[shipment.status].split('-')[1]}-800 dark:text-${STATUS_COLORS[shipment.status].split('-')[1]}-200`}>
                                {STATUS_ICONS[shipment.status]}
                                <span className="ml-1">{shipment.status}</span>
                              </span>
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500 dark:text-slate-400">
                            <p>Delivery: {formatDate(shipment.estimatedDelivery)}</p>
                            <ChevronRight className="h-4 w-4 mt-1 ml-auto" />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {filteredShipments.length === 0 && (
                    <div className="p-4 text-center text-gray-500 dark:text-slate-400">
                      No shipments found.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('id')}>
                      <div className="flex items-center gap-1">
                        ID
                        {filterOptions.sortBy === 'id' && (
                          filterOptions.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                      Tracking
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('customer.name')}>
                      <div className="flex items-center gap-1">
                        Customer
                        {filterOptions.sortBy === 'customer.name' && (
                          filterOptions.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                      Origin
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                      Destination
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('estimatedDelivery')}>
                      <div className="flex items-center gap-1">
                        Est. Delivery
                        {filterOptions.sortBy === 'estimatedDelivery' && (
                          filterOptions.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('createdAt')}>
                      <div className="flex items-center gap-1">
                        Created
                        {filterOptions.sortBy === 'createdAt' && (
                          filterOptions.sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {shipment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {shipment.customer.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        <div className="truncate max-w-xs" title={shipment.origin.address}>
                          {shipment.origin.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        <div className="truncate max-w-xs" title={shipment.destination.address}>
                          {shipment.destination.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[shipment.status]} bg-opacity-10 text-${STATUS_COLORS[shipment.status].split('-')[1]}-800 dark:text-${STATUS_COLORS[shipment.status].split('-')[1]}-200`}>
                          {STATUS_ICONS[shipment.status]}
                          <span className="ml-1">{shipment.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(shipment.estimatedDelivery)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
                        {formatDate(shipment.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            className={`${styles.actionButton} text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300`}
                            onClick={() => handleViewDetails(shipment)}
                          >
                            View
                          </button>
                          <button
                            className={`${styles.actionButton} text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300`}
                            onClick={() => handleEditShipment(shipment)}
                          >
                            Edit
                          </button>
                          <button
                            className={`${styles.actionButton} text-rose-600 hover:text-rose-900 dark:text-rose-400 dark:hover:text-rose-300`}
                            onClick={() => handleDeleteShipment(shipment.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredShipments.length === 0 && (
                <div className="p-6 text-center text-gray-500 dark:text-slate-400">
                  No shipments found matching your criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Distribution */}
            <div className={`${styles.card}`}>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Status Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} shipments`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Carrier Distribution */}
            <div className={`${styles.card}`}>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipments by Carrier</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={analytics.carrierData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="shipments" fill="#6366f1" name="Shipments" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="md:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`${styles.statCard}`}>
                  <div className="stat-title">Total Shipments</div>
                  <div className="stat-value">{shipments.length}</div>
                </div>
                <div className={`${styles.statCard}`}>
                  <div className="stat-title">In Transit</div>
                  <div className="stat-value">{analytics.statusData.find(item => item.name === 'In Transit')?.value || 0}</div>
                </div>
                <div className={`${styles.statCard}`}>
                  <div className="stat-title">Delivered</div>
                  <div className="stat-value">{analytics.statusData.find(item => item.name === 'Delivered')?.value || 0}</div>
                </div>
                <div className={`${styles.statCard}`}>
                  <div className="stat-title">Delayed</div>
                  <div className="stat-value">{analytics.statusData.find(item => item.name === 'Delayed')?.value || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 py-6 shadow-inner mt-auto">
        <div className="container-fluid">
          <p className="text-center text-gray-500 dark:text-slate-400 text-sm">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div 
            className={`${styles.modalContent}`}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filter Shipments</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
                onClick={closeAllModals}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="form-label">Status</label>
                <select 
                  className={`${styles.input}`}
                  value={filterOptions.status}
                  onChange={(e) => setFilterOptions({...filterOptions, status: e.target.value as ShipmentStatus | 'All'})}
                >
                  <option value="All">All Statuses</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Delayed">Delayed</option>
                  <option value="Processing">Processing</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Start Date</label>
                  <input 
                    type="date" 
                    className={`${styles.input}`}
                    value={filterOptions.dateRange.start}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions, 
                      dateRange: {...filterOptions.dateRange, start: e.target.value}
                    })}
                  />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input 
                    type="date" 
                    className={`${styles.input}`}
                    value={filterOptions.dateRange.end}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions, 
                      dateRange: {...filterOptions.dateRange, end: e.target.value}
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Sort By</label>
                <div className="flex items-center gap-2">
                  <select 
                    className={`${styles.input}`}
                    value={filterOptions.sortBy}
                    onChange={(e) => setFilterOptions({
                      ...filterOptions, 
                      sortBy: e.target.value as ShipmentFilterOptions['sortBy']
                    })}
                  >
                    <option value="createdAt">Created Date</option>
                    <option value="estimatedDelivery">Estimated Delivery</option>
                    <option value="customer.name">Customer Name</option>
                  </select>

                  <button 
                    className={`${styles.buttonOutline} flex-center`}
                    onClick={() => setFilterOptions({
                      ...filterOptions, 
                      sortOrder: filterOptions.sortOrder === 'asc' ? 'desc' : 'asc'
                    })}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                    <span className="ml-1">{filterOptions.sortOrder === 'asc' ? 'Ascending' : 'Descending'}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className={`${styles.buttonSecondary}`}
                onClick={handleResetFilters}
              >
                Reset
              </button>
              <button 
                className={`${styles.button}`}
                onClick={() => setIsFilterModalOpen(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shipment Form Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div 
            className={`${styles.modalContent} max-w-2xl`}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Shipment' : 'Create New Shipment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
                onClick={closeAllModals}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveShipment}>
              <div className="mt-4 max-h-[70vh] overflow-y-auto p-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Basic Info */}
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">Basic Information</h4>
                  </div>

                  <div>
                    <label className="form-label">Tracking Number</label>
                    <input 
                      type="text" 
                      className={`${styles.input}`}
                      placeholder="Enter tracking number" 
                      value={newShipment.trackingNumber || ''}
                      onChange={(e) => setNewShipment({...newShipment, trackingNumber: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Carrier</label>
                    <input 
                      type="text" 
                      className={`${styles.input}`}
                      placeholder="Enter carrier name" 
                      value={newShipment.carrier || ''}
                      onChange={(e) => setNewShipment({...newShipment, carrier: e.target.value})}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Status</label>
                    <select 
                      className={`${styles.input}`}
                      value={newShipment.status || 'Processing'}
                      onChange={(e) => setNewShipment({...newShipment, status: e.target.value as ShipmentStatus})}
                      required
                    >
                      <option value="Processing">Processing</option>
                      <option value="In Transit">In Transit</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Delayed">Delayed</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Estimated Delivery Date</label>
                    <input 
                      type="date" 
                      className={`${styles.input}`}
                      value={newShipment.estimatedDelivery ? new Date(newShipment.estimatedDelivery).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewShipment({...newShipment, estimatedDelivery: new Date(e.target.value).toISOString()})}
                      required
                    />
                  </div>

                  {/* Customer Info */}
                  <div className="md:col-span-2 pt-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">Customer Information</h4>
                  </div>

                  <div>
                    <label className="form-label">Customer Name</label>
                    <input 
                      type="text" 
                      className={`${styles.input}`}
                      placeholder="Enter customer name" 
                      value={newShipment.customer?.name || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        customer: {...newShipment.customer, name: e.target.value}
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Customer Email</label>
                    <input 
                      type="email" 
                      className={`${styles.input}`}
                      placeholder="Enter customer email" 
                      value={newShipment.customer?.email || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        customer: {...newShipment.customer, email: e.target.value}
                      })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Customer Phone</label>
                    <input 
                      type="tel" 
                      className={`${styles.input}`}
                      placeholder="Enter customer phone" 
                      value={newShipment.customer?.phone || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        customer: {...newShipment.customer, phone: e.target.value}
                      })}
                    />
                  </div>

                  {/* Origin Info */}
                  <div className="md:col-span-2 pt-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">Origin</h4>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Origin Address</label>
                    <input 
                      type="text" 
                      className={`${styles.input}`}
                      placeholder="Enter origin address" 
                      value={newShipment.origin?.address || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        origin: {...newShipment.origin, address: e.target.value}
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Origin Latitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      className={`${styles.input}`}
                      placeholder="Enter latitude" 
                      value={newShipment.origin?.coordinates?.[0] || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        origin: {
                          ...newShipment.origin,
                          coordinates: [parseFloat(e.target.value), newShipment.origin?.coordinates?.[1] || 0]
                        }
                      })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Origin Longitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      className={`${styles.input}`}
                      placeholder="Enter longitude" 
                      value={newShipment.origin?.coordinates?.[1] || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        origin: {
                          ...newShipment.origin,
                          coordinates: [newShipment.origin?.coordinates?.[0] || 0, parseFloat(e.target.value)]
                        }
                      })}
                    />
                  </div>

                  {/* Destination Info */}
                  <div className="md:col-span-2 pt-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">Destination</h4>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Destination Address</label>
                    <input 
                      type="text" 
                      className={`${styles.input}`}
                      placeholder="Enter destination address" 
                      value={newShipment.destination?.address || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        destination: {...newShipment.destination, address: e.target.value}
                      })}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Destination Latitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      className={`${styles.input}`}
                      placeholder="Enter latitude" 
                      value={newShipment.destination?.coordinates?.[0] || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        destination: {
                          ...newShipment.destination,
                          coordinates: [parseFloat(e.target.value), newShipment.destination?.coordinates?.[1] || 0]
                        }
                      })}
                    />
                  </div>

                  <div>
                    <label className="form-label">Destination Longitude</label>
                    <input 
                      type="number" 
                      step="0.000001"
                      className={`${styles.input}`}
                      placeholder="Enter longitude" 
                      value={newShipment.destination?.coordinates?.[1] || ''}
                      onChange={(e) => setNewShipment({
                        ...newShipment, 
                        destination: {
                          ...newShipment.destination,
                          coordinates: [newShipment.destination?.coordinates?.[0] || 0, parseFloat(e.target.value)]
                        }
                      })}
                    />
                  </div>

                  {/* Additional Info */}
                  <div className="md:col-span-2 pt-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">Additional Information</h4>
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label">Notes</label>
                    <textarea 
                      className={`${styles.input}`}
                      rows={3}
                      placeholder="Enter any additional notes" 
                      value={newShipment.notes || ''}
                      onChange={(e) => setNewShipment({...newShipment, notes: e.target.value})}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button"
                  className={`${styles.buttonSecondary}`}
                  onClick={closeAllModals}
                >
                  Cancel
                </button>
                <button type="submit" className={`${styles.button}`}>
                  {isEditMode ? 'Update Shipment' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Details Modal */}
      {isDetailsModalOpen && selectedShipment && (
        <div className="modal-backdrop" onClick={closeAllModals}>
          <div 
            className={`${styles.modalContent} max-w-2xl`}
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipment Details</h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300" 
                onClick={closeAllModals}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 max-h-[70vh] overflow-y-auto p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Shipment Information</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">ID</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.id}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Tracking Number</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.trackingNumber}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Carrier</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.carrier}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedShipment.status]} bg-opacity-10 text-${STATUS_COLORS[selectedShipment.status].split('-')[1]}-800 dark:text-${STATUS_COLORS[selectedShipment.status].split('-')[1]}-200`}>
                          {STATUS_ICONS[selectedShipment.status]}
                          <span className="ml-1">{selectedShipment.status}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Created At</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(selectedShipment.createdAt)}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Estimated Delivery</span>
                        <span className="text-gray-900 dark:text-white">{formatDate(selectedShipment.estimatedDelivery)}</span>
                      </div>
                      {selectedShipment.actualDelivery && (
                        <div>
                          <span className="text-xs text-gray-500 dark:text-slate-400 block">Actual Delivery</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(selectedShipment.actualDelivery)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Customer Information</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Name</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.customer.name}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Email</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.customer.email}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Phone</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.customer.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Origin</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Address</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.origin.address}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Coordinates</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedShipment.origin.coordinates[0].toFixed(6)}, {selectedShipment.origin.coordinates[1].toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Destination</h4>
                    <div className="mt-2 space-y-2">
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Address</span>
                        <span className="text-gray-900 dark:text-white">{selectedShipment.destination.address}</span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 block">Coordinates</span>
                        <span className="text-gray-900 dark:text-white">
                          {selectedShipment.destination.coordinates[0].toFixed(6)}, {selectedShipment.destination.coordinates[1].toFixed(6)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedShipment.currentLocation && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Current Location</h4>
                      <div className="mt-2 space-y-2">
                        <div>
                          <span className="text-xs text-gray-500 dark:text-slate-400 block">Coordinates</span>
                          <span className="text-gray-900 dark:text-white">
                            {selectedShipment.currentLocation.coordinates[0].toFixed(6)}, {selectedShipment.currentLocation.coordinates[1].toFixed(6)}
                          </span>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 dark:text-slate-400 block">Last Updated</span>
                          <span className="text-gray-900 dark:text-white">
                            {new Date(selectedShipment.currentLocation.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Full Width Items */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Items</h4>
                  <div className="mt-2">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Quantity</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                        {selectedShipment.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.quantity}</td>
                            <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">{item.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {selectedShipment.notes && (
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase">Notes</h4>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                      <p className="text-gray-900 dark:text-white">{selectedShipment.notes}</p>
                    </div>
                  </div>
                )}

                {/* Mini Map with Current Location */}
                {selectedShipment.currentLocation && (
                  <div className="md:col-span-2 mt-2">
                    <h4 className="text-sm font-medium text-gray-500 dark:text-slate-400 uppercase mb-2">Current Location</h4>
                    <div className="h-60 rounded-md overflow-hidden border border-gray-200 dark:border-slate-700">
                      <MapContainer 
                        center={selectedShipment.currentLocation.coordinates} 
                        zoom={6} 
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                      >
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {/* Origin Marker */}
                        <Marker position={selectedShipment.origin.coordinates}>
                          <Popup>Origin: {selectedShipment.origin.address}</Popup>
                        </Marker>
                        {/* Destination Marker */}
                        <Marker position={selectedShipment.destination.coordinates}>
                          <Popup>Destination: {selectedShipment.destination.address}</Popup>
                        </Marker>
                        {/* Current Location Marker */}
                        <Marker position={selectedShipment.currentLocation.coordinates}>
                          <Popup>
                            Current Location<br />
                            Updated: {new Date(selectedShipment.currentLocation.updatedAt).toLocaleString()}
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className={`${styles.buttonSecondary}`}
                onClick={closeAllModals}
              >
                Close
              </button>
              <button 
                className={`${styles.button}`}
                onClick={() => {
                  closeAllModals();
                  handleEditShipment(selectedShipment);
                }}
              >
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
