import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import {
  Truck,
  Package,
  Search,
  Plus,
  Edit,
  Trash2,
  Filter,
  MapPin,
  Calendar,
  User,
  CheckCircle,
  Clock,
  X,
  ChevronDown,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { format, parseISO, isValid, addDays } from 'date-fns';
import 'leaflet/dist/leaflet.css';
import styles from './styles/styles.module.css';

// Define marker icon to fix the missing icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Type definitions
type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'delayed';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface Shipment {
  id: string;
  trackingId: string;
  customerName: string;
  origin: Location;
  destination: Location;
  currentLocation?: Location;
  status: ShipmentStatus;
  estimatedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  items: Array<{
    name: string;
    quantity: number;
    weight?: number;
  }>;
}

interface FilterOptions {
  status: ShipmentStatus | 'all';
  customerName: string;
  dateFrom: string;
  dateTo: string;
  trackingId: string;
}

const App: React.FC = () => {
  // State management
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20, 0]);
  const [mapZoom, setMapZoom] = useState<number>(2);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    customerName: '',
    dateFrom: '',
    dateTo: '',
    trackingId: ''
  });
  const [activeTab, setActiveTab] = useState<'all' | 'map'>('all');
  const modalRef = useRef<HTMLDivElement>(null);

  // Initialize with sample data or load from localStorage
  useEffect(() => {
    const savedShipments = localStorage.getItem('shipments');
    if (savedShipments) {
      try {
        setShipments(JSON.parse(savedShipments));
      } catch (e) {
        console.error('Error parsing shipments from localStorage:', e);
        generateSampleData();
      }
    } else {
      generateSampleData();
    }
  }, []);

  // Save shipments to localStorage whenever they change
  useEffect(() => {
    if (shipments.length > 0) {
      localStorage.setItem('shipments', JSON.stringify(shipments));
    }
  }, [shipments]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
        setIsFilterModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, []);

  // Handle click outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
        setIsFilterModalOpen(false);
      }
    };

    if (isModalOpen || isFilterModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, isFilterModalOpen]);

  // Generate sample shipments data
  const generateSampleData = () => {
    const sampleShipments: Shipment[] = [];
    const cities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
      { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
      { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
      { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
      { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
      { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
      { name: 'Seattle', lat: 47.6062, lng: -122.3321 },
      { name: 'Denver', lat: 39.7392, lng: -104.9903 },
      { name: 'Boston', lat: 42.3601, lng: -71.0589 },
      { name: 'Miami', lat: 25.7617, lng: -80.1918 },
      { name: 'Atlanta', lat: 33.7490, lng: -84.3880 }
    ];

    const statuses: ShipmentStatus[] = ['pending', 'in_transit', 'delivered', 'delayed'];
    const customerNames = [
      'Acme Corp', 'Globex Industries', 'Stark Enterprises', 'Wayne Enterprises',
      'Umbrella Corporation', 'Oscorp Industries', 'Soylent Corp', 'Cyberdyne Systems',
      'Massive Dynamic', 'Tyrell Corporation', 'Weyland-Yutani', 'Initech',
      'Nakatomi Trading Corp', 'Gekko & Co', 'Dunder Mifflin'
    ];

    const items = [
      { name: 'Electronics', quantity: 5, weight: 10.5 },
      { name: 'Clothing', quantity: 20, weight: 5.0 },
      { name: 'Books', quantity: 10, weight: 15.2 },
      { name: 'Food', quantity: 30, weight: 25.5 },
      { name: 'Furniture', quantity: 2, weight: 50.0 },
      { name: 'Toys', quantity: 15, weight: 7.5 }
    ];

    for (let i = 0; i < 30; i++) {
      const originIndex = Math.floor(Math.random() * cities.length);
      let destinationIndex = Math.floor(Math.random() * cities.length);
      while (destinationIndex === originIndex) {
        destinationIndex = Math.floor(Math.random() * cities.length);
      }

      const origin = cities[originIndex];
      const destination = cities[destinationIndex];
      
      // Choose a random point between origin and destination for current location
      const progress = Math.random(); // 0-1 representing progress of shipment
      const currentLat = origin.lat + (destination.lat - origin.lat) * progress;
      const currentLng = origin.lng + (destination.lng - origin.lng) * progress;
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      
      // Create dates
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000);
      const estimatedDelivery = new Date(createdAt.getTime() + Math.floor(2 + Math.random() * 5) * 24 * 60 * 60 * 1000);
      
      // Only set actualDelivery for delivered shipments
      let actualDelivery;
      if (status === 'delivered') {
        actualDelivery = new Date(estimatedDelivery.getTime() - Math.floor(Math.random() * 2) * 24 * 60 * 60 * 1000);
      }

      // Pick 1-3 random items for the shipment
      const numItems = 1 + Math.floor(Math.random() * 3);
      const shipmentItems = [];
      for (let j = 0; j < numItems; j++) {
        const item = items[Math.floor(Math.random() * items.length)];
        shipmentItems.push({
          name: item.name,
          quantity: 1 + Math.floor(Math.random() * item.quantity),
          weight: item.weight ? parseFloat((Math.random() * item.weight).toFixed(1)) : undefined
        });
      }

      sampleShipments.push({
        id: `ship-${i + 1}`,
        trackingId: `TRK${100000 + Math.floor(Math.random() * 900000)}`,
        customerName,
        origin: {
          lat: origin.lat,
          lng: origin.lng,
          address: `${origin.name}, USA`
        },
        destination: {
          lat: destination.lat,
          lng: destination.lng,
          address: `${destination.name}, USA`
        },
        currentLocation: {
          lat: currentLat,
          lng: currentLng,
          address: `En route to ${destination.name}`
        },
        status,
        estimatedDelivery: estimatedDelivery.toISOString(),
        actualDelivery: actualDelivery ? actualDelivery.toISOString() : undefined,
        createdAt: createdAt.toISOString(),
        updatedAt: new Date(createdAt.getTime() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000).toISOString(),
        notes: Math.random() > 0.7 ? `Special handling required for shipment #${i + 1}` : undefined,
        items: shipmentItems
      });
    }

    setShipments(sampleShipments);
    localStorage.setItem('shipments', JSON.stringify(sampleShipments));
  };

  // Filter shipments based on search term and filters
  const filteredShipments = shipments.filter(shipment => {
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      shipment.trackingId.toLowerCase().includes(searchTermLower) ||
      shipment.customerName.toLowerCase().includes(searchTermLower) ||
      shipment.origin.address.toLowerCase().includes(searchTermLower) ||
      shipment.destination.address.toLowerCase().includes(searchTermLower)
    );

    if (!matchesSearch) return false;

    // Status filter
    if (filters.status !== 'all' && shipment.status !== filters.status) return false;

    // Customer name filter
    if (filters.customerName && !shipment.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) return false;

    // Tracking ID filter
    if (filters.trackingId && !shipment.trackingId.toLowerCase().includes(filters.trackingId.toLowerCase())) return false;

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      const estimatedDate = new Date(shipment.estimatedDelivery);
      if (isValid(fromDate) && isValid(estimatedDate) && estimatedDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      const estimatedDate = new Date(shipment.estimatedDelivery);
      if (isValid(toDate) && isValid(estimatedDate) && estimatedDate > toDate) return false;
    }

    return true;
  });

  // Function to open modal for adding a new shipment
  const handleAddShipment = () => {
    const today = new Date();
    const estimatedDelivery = addDays(today, 3);
    
    setSelectedShipment({
      id: '',
      trackingId: `TRK${100000 + Math.floor(Math.random() * 900000)}`,
      customerName: '',
      origin: {
        lat: 0,
        lng: 0,
        address: ''
      },
      destination: {
        lat: 0,
        lng: 0,
        address: ''
      },
      status: 'pending',
      estimatedDelivery: estimatedDelivery.toISOString(),
      createdAt: today.toISOString(),
      updatedAt: today.toISOString(),
      items: [{ name: '', quantity: 1 }]
    });
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  // Function to edit an existing shipment
  const handleEditShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  // Function to delete a shipment
  const handleDeleteShipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      setShipments(shipments.filter(shipment => shipment.id !== id));
    }
  };

  // Function to view a shipment on the map
  const handleViewOnMap = (shipment: Shipment) => {
    if (shipment.currentLocation) {
      setMapCenter([shipment.currentLocation.lat, shipment.currentLocation.lng]);
      setMapZoom(10);
      setActiveTab('map');
    }
  };

  // Handle form submission
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedShipment) return;

    const now = new Date().toISOString();
    const newShipment = {
      ...selectedShipment,
      id: isEditMode ? selectedShipment.id : `ship-${Date.now()}`,
      updatedAt: now,
      createdAt: isEditMode ? selectedShipment.createdAt : now
    };

    if (isEditMode) {
      setShipments(shipments.map(s => s.id === selectedShipment.id ? newShipment : s));
    } else {
      setShipments([...shipments, newShipment]);
    }

    setIsModalOpen(false);
    setSelectedShipment(null);
  };

  // Handle input changes for the shipment form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, field: string, nested?: string, itemIndex?: number, itemField?: string) => {
    if (!selectedShipment) return;

    let updatedShipment = { ...selectedShipment };

    if (nested && itemIndex !== undefined && itemField) {
      // Handle nested item field update
      const updatedItems = [...updatedShipment.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        [itemField]: field === 'quantity' || field === 'weight' 
          ? parseFloat(e.target.value) || 0 
          : e.target.value
      };
      updatedShipment.items = updatedItems;
    } else if (nested) {
      // Handle nested location fields
      updatedShipment = {
        ...updatedShipment,
        [nested]: {
          ...updatedShipment[nested as keyof Shipment] as any,
          [field]: field === 'lat' || field === 'lng'
            ? parseFloat(e.target.value) || 0
            : e.target.value
        }
      };
    } else {
      // Handle direct fields
      updatedShipment = {
        ...updatedShipment,
        [field]: e.target.value
      };
    }

    setSelectedShipment(updatedShipment);
  };

  // Add an item to the shipment
  const handleAddItem = () => {
    if (!selectedShipment) return;

    const updatedShipment = {
      ...selectedShipment,
      items: [...selectedShipment.items, { name: '', quantity: 1 }]
    };

    setSelectedShipment(updatedShipment);
  };

  // Remove an item from the shipment
  const handleRemoveItem = (index: number) => {
    if (!selectedShipment) return;

    const updatedItems = [...selectedShipment.items];
    updatedItems.splice(index, 1);

    setSelectedShipment({
      ...selectedShipment,
      items: updatedItems
    });
  };

  // Apply filters to the shipment list
  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFilterModalOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      customerName: '',
      dateFrom: '',
      dateTo: '',
      trackingId: ''
    });
    setIsFilterModalOpen(false);
  };

  // Function to get CSS class for status badge
  const getStatusBadgeClass = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending': return 'badge badge-warning';
      case 'in_transit': return 'badge badge-info';
      case 'delivered': return 'badge badge-success';
      case 'delayed': return 'badge badge-error';
      default: return 'badge';
    }
  };

  // Function to get human-readable status text
  const getStatusText = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'in_transit': return 'In Transit';
      case 'delivered': return 'Delivered';
      case 'delayed': return 'Delayed';
      default: return 'Unknown';
    }
  };

  // Export shipments to CSV
  const exportToCsv = () => {
    const headers = ['Tracking ID', 'Customer Name', 'Origin', 'Destination', 'Status', 'Estimated Delivery', 'Actual Delivery'];
    
    const rows = filteredShipments.map(shipment => [
      shipment.trackingId,
      shipment.customerName,
      shipment.origin.address,
      shipment.destination.address,
      getStatusText(shipment.status),
      format(parseISO(shipment.estimatedDelivery), 'yyyy-MM-dd'),
      shipment.actualDelivery ? format(parseISO(shipment.actualDelivery), 'yyyy-MM-dd') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shipments_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate a template CSV for importing
  const downloadTemplate = () => {
    const headers = ['Tracking ID', 'Customer Name', 'Origin Address', 'Origin Lat', 'Origin Lng', 
                    'Destination Address', 'Destination Lat', 'Destination Lng', 'Status', 
                    'Estimated Delivery (YYYY-MM-DD)', 'Items (Format: Name,Quantity,Weight|Name,Quantity,Weight)'];
    
    const sampleData = [
      'TRK123456,Acme Corp,New York USA,40.7128,-74.0060,Los Angeles USA,34.0522,-118.2437,pending,2023-12-31,Electronics,5,10.5|Books,10,15.2'
    ];

    const csvContent = [
      headers.join(','),
      sampleData
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'shipments_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import shipments from CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');
        
        const newShipments: Shipment[] = [];
        
        // Start from index 1 to skip headers
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          
          const data = lines[i].split(',');
          if (data.length < 10) continue; // Ensure we have minimum required fields
          
          const trackingId = data[0].trim();
          const customerName = data[1].trim();
          const originAddress = data[2].trim();
          const originLat = parseFloat(data[3].trim());
          const originLng = parseFloat(data[4].trim());
          const destAddress = data[5].trim();
          const destLat = parseFloat(data[6].trim());
          const destLng = parseFloat(data[7].trim());
          const status = data[8].trim() as ShipmentStatus;
          const estimatedDelivery = new Date(data[9].trim()).toISOString();
          
          // Parse items
          const itemsData = data.slice(10).join(',');
          const itemsSplit = itemsData.split('|');
          const items = itemsSplit.map(item => {
            const [name, quantity, weight] = item.split(',');
            return {
              name: name.trim(),
              quantity: parseInt(quantity.trim(), 10) || 1,
              weight: weight ? parseFloat(weight.trim()) : undefined
            };
          });
          
          // Create new shipment
          const now = new Date().toISOString();
          const newShipment: Shipment = {
            id: `ship-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            trackingId,
            customerName,
            origin: {
              lat: originLat,
              lng: originLng,
              address: originAddress
            },
            destination: {
              lat: destLat,
              lng: destLng,
              address: destAddress
            },
            currentLocation: {
              lat: originLat + (destLat - originLat) * 0.3, // Assume 30% of the way
              lng: originLng + (destLng - originLng) * 0.3,
              address: `En route to ${destAddress}`
            },
            status,
            estimatedDelivery,
            createdAt: now,
            updatedAt: now,
            items: items.length > 0 ? items : [{ name: 'Unspecified', quantity: 1 }]
          };
          
          newShipments.push(newShipment);
        }
        
        if (newShipments.length > 0) {
          setShipments([...shipments, ...newShipments]);
          alert(`Successfully imported ${newShipments.length} shipments`);
        } else {
          alert('No valid shipment data found in the file');
        }
      } catch (error) {
        console.error('Error parsing CSV file:', error);
        alert('Error parsing the CSV file. Please check the format and try again.');
      }
      
      // Reset file input
      e.target.value = '';
    };
    
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-2">
              <Truck className="text-primary-600 dark:text-primary-400" size={24} />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Tracker</h1>
            </div>
            <div className="flex gap-2">
              <button 
                className="btn btn-sm btn-primary flex items-center gap-1"
                onClick={handleAddShipment}
                aria-label="Add shipment"
              >
                <Plus size={16} />
                <span className="responsive-hide">Add Shipment</span>
              </button>
              <div className="relative">
                <input 
                  type="file" 
                  id="csvUpload" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <button 
                  className="btn btn-sm bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 flex items-center gap-1"
                  onClick={() => document.getElementById('csvUpload')?.click()}
                  aria-label="Import CSV"
                >
                  <Upload size={16} />
                  <span className="responsive-hide">Import</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container-fluid py-6">
        {/* Search and filter bar */}
        <div className="flex-between flex-wrap gap-2 mb-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search shipments..."
              className="input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button 
              className="btn btn-sm bg-white border border-gray-300 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 flex items-center gap-1"
              onClick={() => setIsFilterModalOpen(true)}
              aria-label="Filter shipments"
            >
              <Filter size={16} />
              <span>Filters</span>
              {Object.values(filters).some(val => val !== '' && val !== 'all') && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary-500 rounded-full">
                  !
                </span>
              )}
            </button>
            <button 
              className="btn btn-sm bg-white border border-gray-300 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 flex items-center gap-1"
              onClick={exportToCsv}
              aria-label="Export to CSV"
            >
              <Download size={16} />
              <span className="responsive-hide">Export</span>
            </button>
            <button 
              className="btn btn-sm bg-white border border-gray-300 text-gray-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 flex items-center gap-1"
              onClick={downloadTemplate}
              aria-label="Download template"
            >
              <FileText size={16} />
              <span className="responsive-hide">Template</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-700 mb-4">
          <nav className="-mb-px flex">
            <button
              className={`${activeTab === 'all' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'} flex items-center gap-1 py-2 px-4 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('all')}
            >
              <Package size={16} />
              <span>All Shipments</span>
            </button>
            <button
              className={`${activeTab === 'map' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-300'} flex items-center gap-1 py-2 px-4 border-b-2 font-medium text-sm`}
              onClick={() => setActiveTab('map')}
            >
              <MapPin size={16} />
              <span>Map View</span>
            </button>
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'all' ? (
          <div className="overflow-hidden bg-white dark:bg-slate-800 shadow rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Tracking ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Route</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Delivery Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredShipments.length > 0 ? (
                    filteredShipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {shipment.trackingId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                          {shipment.customerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                          <div className="flex flex-col">
                            <span>From: {shipment.origin.address}</span>
                            <span>To: {shipment.destination.address}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadgeClass(shipment.status)}>
                            {getStatusText(shipment.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-300">
                          {isValid(parseISO(shipment.estimatedDelivery)) 
                            ? format(parseISO(shipment.estimatedDelivery), 'MMM dd, yyyy')
                            : 'Invalid date'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                              onClick={() => handleViewOnMap(shipment)}
                              aria-label="View on map"
                            >
                              <MapPin size={16} />
                            </button>
                            <button
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                              onClick={() => handleEditShipment(shipment)}
                              aria-label="Edit shipment"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              onClick={() => handleDeleteShipment(shipment.id)}
                              aria-label="Delete shipment"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-slate-300">
                        No shipments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 shadow rounded-lg p-0 overflow-hidden">
            <div className={styles.mapContainer}>
              <MapContainer 
                center={mapCenter} 
                zoom={mapZoom} 
                className={styles.map}
                zoomControl={false} // We'll add custom positioned zoom control
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {filteredShipments.map((shipment) => (
                  shipment.currentLocation && (
                    <Marker 
                      key={shipment.id} 
                      position={[shipment.currentLocation.lat, shipment.currentLocation.lng]}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-medium text-gray-900">{shipment.trackingId}</h3>
                          <p className="text-sm text-gray-600">{shipment.customerName}</p>
                          <div className="mt-2 text-xs text-gray-500">
                            <p>From: {shipment.origin.address}</p>
                            <p>To: {shipment.destination.address}</p>
                          </div>
                          <div className="mt-2">
                            <span className={getStatusBadgeClass(shipment.status)}>
                              {getStatusText(shipment.status)}
                            </span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Shipment Stats */}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4">
          <div className="stat-card">
            <div className="flex-between">
              <div className="stat-title">Total Shipments</div>
              <Package className="text-primary-500" size={20} />
            </div>
            <div className="stat-value">{shipments.length}</div>
          </div>
          
          <div className="stat-card">
            <div className="flex-between">
              <div className="stat-title">In Transit</div>
              <Truck className="text-blue-500" size={20} />
            </div>
            <div className="stat-value">
              {shipments.filter(s => s.status === 'in_transit').length}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex-between">
              <div className="stat-title">Delivered</div>
              <CheckCircle className="text-green-500" size={20} />
            </div>
            <div className="stat-value">
              {shipments.filter(s => s.status === 'delivered').length}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="flex-between">
              <div className="stat-title">Delayed</div>
              <Clock className="text-red-500" size={20} />
            </div>
            <div className="stat-value">
              {shipments.filter(s => s.status === 'delayed').length}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 py-4 border-t border-gray-200 dark:border-slate-700">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-slate-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Shipment Form Modal */}
      {isModalOpen && selectedShipment && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef}
            className="modal-content max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditMode ? 'Edit Shipment' : 'Add New Shipment'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic Info */}
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="trackingId">Tracking ID</label>
                  <input
                    id="trackingId"
                    type="text"
                    className="input"
                    value={selectedShipment.trackingId}
                    onChange={(e) => handleInputChange(e, 'trackingId')}
                    required
                  />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="customerName">Customer Name</label>
                  <input
                    id="customerName"
                    type="text"
                    className="input"
                    value={selectedShipment.customerName}
                    onChange={(e) => handleInputChange(e, 'customerName')}
                    required
                  />
                </div>
                
                {/* Origin */}
                <div className="form-group md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <MapPin size={16} />
                    Origin Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <label className="form-label" htmlFor="originAddress">Address</label>
                      <input
                        id="originAddress"
                        type="text"
                        className="input"
                        value={selectedShipment.origin.address}
                        onChange={(e) => handleInputChange(e, 'address', 'origin')}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="originLat">Latitude</label>
                      <input
                        id="originLat"
                        type="number"
                        step="0.000001"
                        className="input"
                        value={selectedShipment.origin.lat}
                        onChange={(e) => handleInputChange(e, 'lat', 'origin')}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="originLng">Longitude</label>
                      <input
                        id="originLng"
                        type="number"
                        step="0.000001"
                        className="input"
                        value={selectedShipment.origin.lng}
                        onChange={(e) => handleInputChange(e, 'lng', 'origin')}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Destination */}
                <div className="form-group md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2 flex items-center gap-1">
                    <MapPin size={16} />
                    Destination Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-3">
                      <label className="form-label" htmlFor="destinationAddress">Address</label>
                      <input
                        id="destinationAddress"
                        type="text"
                        className="input"
                        value={selectedShipment.destination.address}
                        onChange={(e) => handleInputChange(e, 'address', 'destination')}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="destinationLat">Latitude</label>
                      <input
                        id="destinationLat"
                        type="number"
                        step="0.000001"
                        className="input"
                        value={selectedShipment.destination.lat}
                        onChange={(e) => handleInputChange(e, 'lat', 'destination')}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label" htmlFor="destinationLng">Longitude</label>
                      <input
                        id="destinationLng"
                        type="number"
                        step="0.000001"
                        className="input"
                        value={selectedShipment.destination.lng}
                        onChange={(e) => handleInputChange(e, 'lng', 'destination')}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                {/* Current Location & Status */}
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    className="input"
                    value={selectedShipment.status}
                    onChange={(e) => handleInputChange(e, 'status')}
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="estimatedDelivery">Estimated Delivery</label>
                  <input
                    id="estimatedDelivery"
                    type="date"
                    className="input"
                    value={isValid(parseISO(selectedShipment.estimatedDelivery)) 
                      ? format(parseISO(selectedShipment.estimatedDelivery), 'yyyy-MM-dd')
                      : ''}
                    onChange={(e) => {
                      const date = e.target.value ? new Date(e.target.value) : new Date();
                      handleInputChange({ target: { value: date.toISOString() } } as any, 'estimatedDelivery');
                    }}
                    required
                  />
                </div>
                
                {/* Shipment Items */}
                <div className="form-group md:col-span-2">
                  <div className="flex-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-1">
                      <Package size={16} />
                      Shipment Items
                    </h4>
                    <button
                      type="button"
                      className="text-primary-600 text-sm flex items-center gap-1"
                      onClick={handleAddItem}
                    >
                      <Plus size={16} />
                      Add Item
                    </button>
                  </div>
                  
                  {selectedShipment.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md mb-2">
                      <div className="flex-between mb-2">
                        <h5 className="text-sm font-medium">Item #{index + 1}</h5>
                        {selectedShipment.items.length > 1 && (
                          <button
                            type="button"
                            className="text-red-600 text-sm"
                            onClick={() => handleRemoveItem(index)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-1">
                          <label className="form-label text-xs" htmlFor={`item-${index}-name`}>Name</label>
                          <input
                            id={`item-${index}-name`}
                            type="text"
                            className="input"
                            value={item.name}
                            onChange={(e) => handleInputChange(e, 'items', undefined, index, 'name')}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label text-xs" htmlFor={`item-${index}-quantity`}>Quantity</label>
                          <input
                            id={`item-${index}-quantity`}
                            type="number"
                            min="1"
                            className="input"
                            value={item.quantity}
                            onChange={(e) => handleInputChange(e, 'quantity', undefined, index, 'quantity')}
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label text-xs" htmlFor={`item-${index}-weight`}>Weight (kg)</label>
                          <input
                            id={`item-${index}-weight`}
                            type="number"
                            step="0.1"
                            min="0"
                            className="input"
                            value={item.weight || ''}
                            onChange={(e) => handleInputChange(e, 'weight', undefined, index, 'weight')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Notes */}
                <div className="form-group md:col-span-2">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="input min-h-[80px]"
                    value={selectedShipment.notes || ''}
                    onChange={(e) => handleInputChange(e, 'notes')}
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {isEditMode ? 'Update Shipment' : 'Add Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="modal-backdrop">
          <div 
            ref={modalRef} 
            className="modal-content max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Filter Shipments
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => setIsFilterModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={applyFilters} className="mt-4">
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="filterStatus">Status</label>
                  <select
                    id="filterStatus"
                    className="input"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value as ShipmentStatus | 'all'})}
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="delayed">Delayed</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="filterCustomer">Customer Name</label>
                  <input
                    id="filterCustomer"
                    type="text"
                    className="input"
                    placeholder="Enter customer name"
                    value={filters.customerName}
                    onChange={(e) => setFilters({...filters, customerName: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="filterTrackingId">Tracking ID</label>
                  <input
                    id="filterTrackingId"
                    type="text"
                    className="input"
                    placeholder="Enter tracking ID"
                    value={filters.trackingId}
                    onChange={(e) => setFilters({...filters, trackingId: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="form-label" htmlFor="filterDateFrom">Date From</label>
                    <input
                      id="filterDateFrom"
                      type="date"
                      className="input"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="filterDateTo">Date To</label>
                    <input
                      id="filterDateTo"
                      type="date"
                      className="input"
                      value={filters.dateTo}
                      onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-600"
                  onClick={resetFilters}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Apply Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
