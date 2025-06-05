import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import {
  Truck, Users, Route, Package, BarChart3, Settings, Plus, Edit, Trash2,
  Filter, Search, Download, Upload, MapPin, Clock, AlertCircle, CheckCircle,
  XCircle, Fuel, Calendar, Phone, Mail, FileText, Eye, Navigation,
  TrendingUp, TrendingDown, DollarSign, Activity, Map, LogOut, Menu, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import styles from './styles/styles.module.css';

interface Vehicle {
  id: string;
  plateNumber: string;
  type: 'truck' | 'van' | 'trailer';
  capacity: number;
  fuelType: 'diesel' | 'petrol' | 'electric';
  status: 'active' | 'maintenance' | 'inactive';
  currentLocation: string;
  lastMaintenance: string;
  nextMaintenance: string;
  driverId?: string;
  mileage: number;
  fuelEfficiency: number;
}

interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  email: string;
  experience: number;
  rating: number;
  status: 'available' | 'assigned' | 'on-leave';
  currentVehicle?: string;
  totalDeliveries: number;
  joinDate: string;
}

interface RouteInterface { // Renamed to avoid conflict with lucide-react Route icon
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  status: 'active' | 'inactive';
  waypoints: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  tollCost: number;
}

interface Shipment {
  id: string;
  trackingNumber: string;
  sender: string;
  receiver: string;
  origin: string;
  destination: string;
  weight: number;
  value: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  vehicleId?: string;
  driverId?: string;
  routeId?: string;
  createdDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  priority: 'low' | 'medium' | 'high';
}

type TabType = 'dashboard' | 'fleet' | 'drivers' | 'routes' | 'shipments' | 'settings';

// Props for the EntityModal component
interface EntityModalProps {
  show: boolean;
  modalType: 'add' | 'edit';
  modalEntity: 'vehicle' | 'driver' | 'route' | 'shipment';
  selectedItem: Vehicle | Driver | RouteInterface | Shipment | null | any; // Using 'any' for wider compatibility from original
  onClose: () => void;
  onSave: (formData: any) => void;
  // vehicles: Vehicle[]; // Example if needed for dropdowns, not currently used in forms
  // drivers: Driver[];   // Example if needed for dropdowns, not currently used in forms
}

// The EntityModal component
const EntityModal: React.FC<EntityModalProps> = ({
  show,
  modalType,
  modalEntity,
  selectedItem,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (show) {
      // Initialize formData based on selectedItem for 'edit' or provide defaults for 'add'
      if (modalType === 'edit' && selectedItem) {
        setFormData({ ...selectedItem });
      } else if (modalType === 'add') {
        let defaultData: any = {};
        switch (modalEntity) {
          case 'vehicle':
            defaultData = { type: 'truck', fuelType: 'diesel', status: 'active', capacity: 0, mileage: 0, fuelEfficiency: 0 };
            break;
          case 'driver':
            defaultData = { status: 'available', experience: 0, rating: 0, totalDeliveries: 0 };
            break;
          case 'route':
            defaultData = { difficulty: 'medium', status: 'active', distance: 0, estimatedTime: 0, tollCost: 0, waypoints: [] };
            break;
          case 'shipment':
            defaultData = { priority: 'medium', status: 'pending', weight: 0, value: 0 };
            break;
        }
        setFormData(defaultData); 
      } else {
        // Fallback, or if selectedItem is null for edit (though should not happen if logic is correct)
        setFormData({});
      }
    } else {
      setFormData({}); // Clear form data when modal is not shown
    }
  }, [show, modalType, modalEntity, selectedItem]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const renderFormFields = () => {
      switch (modalEntity) {
        case 'vehicle':
          return (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Plate Number</label>
                <input
                  type="text"
                  value={formData.plateNumber || ''}
                  onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select
                    value={formData.type || 'truck'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="input"
                  >
                    <option value="truck">Truck</option>
                    <option value="van">Van</option>
                    <option value="trailer">Trailer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Capacity (kg)</label>
                  <input
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <select
                    value={formData.fuelType || 'diesel'}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="input"
                  >
                    <option value="diesel">Diesel</option>
                    <option value="petrol">Petrol</option>
                    <option value="electric">Electric</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Current Location</label>
                <input
                  type="text"
                  value={formData.currentLocation || ''}
                  onChange={(e) => handleInputChange('currentLocation', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Mileage</label>
                  <input
                    type="number"
                    value={formData.mileage || ''}
                    onChange={(e) => handleInputChange('mileage', parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fuel Efficiency (km/l)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.fuelEfficiency || ''}
                    onChange={(e) => handleInputChange('fuelEfficiency', parseFloat(e.target.value) || 0)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          );

        case 'driver':
          return (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">License Number</label>
                  <input
                    type="text"
                    value={formData.licenseNumber || ''}
                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input
                    type="number"
                    value={formData.experience || ''}
                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating || ''}
                    onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'available'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="input"
                  >
                    <option value="available">Available</option>
                    <option value="assigned">Assigned</option>
                    <option value="on-leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
          );

        case 'route':
          return (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Route Name</label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input
                    type="text"
                    value={formData.origin || ''}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    value={formData.destination || ''}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Distance (km)</label>
                  <input
                    type="number"
                    value={formData.distance || ''}
                    onChange={(e) => handleInputChange('distance', parseInt(e.target.value) || 0)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Time (hrs)</label>
                  <input
                    type="number"
                    value={formData.estimatedTime || ''}
                    onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value) || 0)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    value={formData.difficulty || 'medium'}
                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                    className="input"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Waypoints (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(formData.waypoints) ? formData.waypoints.join(', ') : (formData.waypoints || '')}
                  onChange={(e) => handleInputChange('waypoints', e.target.value.split(',').map((w: string) => w.trim()).filter(w => w))}
                  className="input"
                  placeholder="City1, City2, City3"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Toll Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.tollCost || ''}
                    onChange={(e) => handleInputChange('tollCost', parseInt(e.target.value) || 0)}
                    className="input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'active'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="input"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          );

        case 'shipment':
          return (
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">Tracking Number</label>
                <input
                  type="text"
                  value={formData.trackingNumber || ''}
                  onChange={(e) => handleInputChange('trackingNumber', e.target.value)}
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Sender</label>
                  <input
                    type="text"
                    value={formData.sender || ''}
                    onChange={(e) => handleInputChange('sender', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Receiver</label>
                  <input
                    type="text"
                    value={formData.receiver || ''}
                    onChange={(e) => handleInputChange('receiver', e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input
                    type="text"
                    value={formData.origin || ''}
                    onChange={(e) => handleInputChange('origin', e.target.value)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input
                    type="text"
                    value={formData.destination || ''}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    value={formData.weight || ''}
                    onChange={(e) => handleInputChange('weight', parseInt(e.target.value) || 0)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Value (₹)</label>
                  <input
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => handleInputChange('value', parseInt(e.target.value) || 0)}
                    className="input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Priority</label>
                  <select
                    value={formData.priority || 'medium'}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="input"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    value={formData.status || 'pending'}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="input"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-transit">In Transit</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Expected Delivery</label>
                  <input
                    type="date"
                    value={formData.expectedDelivery || ''}
                    onChange={(e) => handleInputChange('expectedDelivery', e.target.value)}
                    className="input"
                    required
                  />
                </div>
              </div>
            </div>
          );

        default:
          return null;
      }
  };

  if (!show) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {modalType === 'add' ? 'Add' : 'Edit'} {modalEntity}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4">
            {renderFormFields()}
          </div>
          
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              {modalType === 'add' ? 'Add' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);
  
  // States
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<RouteInterface[]>([]); // Changed Route to RouteInterface
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'add' | 'edit'>('add');
  const [modalEntity, setModalEntity] = useState<'vehicle' | 'driver' | 'route' | 'shipment'>('vehicle');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showTourInfo, setShowTourInfo] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedVehicles = localStorage.getItem('transport_vehicles');
    const savedDrivers = localStorage.getItem('transport_drivers');
    const savedRoutes = localStorage.getItem('transport_routes');
    const savedShipments = localStorage.getItem('transport_shipments');
    const savedDarkMode = localStorage.getItem('transport_darkMode');

    if (savedVehicles) setVehicles(JSON.parse(savedVehicles));
    if (savedDrivers) setDrivers(JSON.parse(savedDrivers));
    if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
    if (savedShipments) setShipments(JSON.parse(savedShipments));
    if (savedDarkMode) setIsDarkMode(JSON.parse(savedDarkMode));

    // Initialize with sample data if empty
    if (!savedVehicles) {
      const sampleVehicles: Vehicle[] = [
        {
          id: '1',
          plateNumber: 'TRK-001',
          type: 'truck',
          capacity: 5000,
          fuelType: 'diesel',
          status: 'active',
          currentLocation: 'Mumbai',
          lastMaintenance: '2025-05-15',
          nextMaintenance: '2025-07-15',
          driverId: '1',
          mileage: 45000,
          fuelEfficiency: 8.5
        },
        {
          id: '2',
          plateNumber: 'VAN-002',
          type: 'van',
          capacity: 1500,
          fuelType: 'petrol',
          status: 'active',
          currentLocation: 'Delhi',
          lastMaintenance: '2025-04-20',
          nextMaintenance: '2025-06-20',
          driverId: '2',
          mileage: 32000,
          fuelEfficiency: 12.0
        }
      ];
      setVehicles(sampleVehicles);
      localStorage.setItem('transport_vehicles', JSON.stringify(sampleVehicles));
    }

    if (!savedDrivers) {
      const sampleDrivers: Driver[] = [
        {
          id: '1',
          name: 'Rajesh Kumar',
          licenseNumber: 'DL-001',
          phone: '+91-9876543210',
          email: 'rajesh@transport.com',
          experience: 8,
          rating: 4.7,
          status: 'assigned',
          currentVehicle: '1',
          totalDeliveries: 245,
          joinDate: '2020-03-15'
        },
        {
          id: '2',
          name: 'Amit Singh',
          licenseNumber: 'DL-002',
          phone: '+91-9876543211',
          email: 'amit@transport.com',
          experience: 5,
          rating: 4.5,
          status: 'assigned',
          currentVehicle: '2',
          totalDeliveries: 156,
          joinDate: '2022-01-10'
        }
      ];
      setDrivers(sampleDrivers);
      localStorage.setItem('transport_drivers', JSON.stringify(sampleDrivers));
    }

    if (!savedRoutes) {
      const sampleRoutes: RouteInterface[] = [
        {
          id: '1',
          name: 'Mumbai-Delhi Express',
          origin: 'Mumbai',
          destination: 'Delhi',
          distance: 1400,
          estimatedTime: 24,
          status: 'active',
          waypoints: ['Pune', 'Nashik', 'Indore', 'Bhopal'],
          difficulty: 'medium',
          tollCost: 2500
        },
        {
          id: '2',
          name: 'Delhi-Bangalore Route',
          origin: 'Delhi',
          destination: 'Bangalore',
          distance: 2150,
          estimatedTime: 36,
          status: 'active',
          waypoints: ['Jaipur', 'Udaipur', 'Ahmedabad', 'Mumbai', 'Pune'],
          difficulty: 'hard',
          tollCost: 3200
        }
      ];
      setRoutes(sampleRoutes);
      localStorage.setItem('transport_routes', JSON.stringify(sampleRoutes));
    }

    if (!savedShipments) {
      const sampleShipments: Shipment[] = [
        {
          id: '1',
          trackingNumber: 'TRK20250001',
          sender: 'ABC Electronics',
          receiver: 'XYZ Retailers',
          origin: 'Mumbai',
          destination: 'Delhi',
          weight: 500,
          value: 50000,
          status: 'in-transit',
          vehicleId: '1',
          driverId: '1',
          routeId: '1',
          createdDate: '2025-06-03',
          expectedDelivery: '2025-06-07',
          priority: 'high'
        },
        {
          id: '2',
          trackingNumber: 'TRK20250002',
          sender: 'Fashion House',
          receiver: 'Style Store',
          origin: 'Delhi',
          destination: 'Bangalore',
          weight: 200,
          value: 25000,
          status: 'pending',
          priority: 'medium',
          createdDate: '2025-06-04',
          expectedDelivery: '2025-06-08'
        }
      ];
      setShipments(sampleShipments);
      localStorage.setItem('transport_shipments', JSON.stringify(sampleShipments));
    }
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('transport_darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowModal(false);
        setShowConfirmDialog(false);
        setShowImportModal(false);
        setShowAiModal(false);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('transport_vehicles', JSON.stringify(vehicles));
  }, [vehicles]);

  useEffect(() => {
    localStorage.setItem('transport_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('transport_routes', JSON.stringify(routes));
  }, [routes]);

  useEffect(() => {
    localStorage.setItem('transport_shipments', JSON.stringify(shipments));
  }, [shipments]);

  // AI Functions
  const handleAiAnalysis = () => {
    if (!aiPrompt.trim()) {
      setAiError('Please provide a prompt for AI analysis.');
      return;
    }

    setAiResult(null);
    setAiError(null);

    try {
      aiLayerRef.current?.sendToAI(aiPrompt);
    } catch (error) {
      setAiError('Failed to process AI request');
    }
  };

  const handleRouteOptimization = () => {
    const routeData = routes.map(r => `Route: ${r.name}, Distance: ${r.distance}km, Difficulty: ${r.difficulty}, Toll: ₹${r.tollCost}`).join('; ');
    const prompt = `Analyze these transport routes and suggest optimizations for cost and time efficiency. Return JSON with keys "recommendations", "cost_savings", "time_savings". Routes: ${routeData}`;
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to process route optimization');
    }
  };

  const handleShipmentAnalysis = () => {
    const shipmentData = shipments.map(s => `Tracking: ${s.trackingNumber}, Status: ${s.status}, Weight: ${s.weight}kg, Value: ₹${s.value}, Priority: ${s.priority}`).join('; ');
    const prompt = `Analyze these shipments and provide insights on delivery performance and potential issues. Return JSON with keys "performance_summary", "risk_analysis", "recommendations". Shipments: ${shipmentData}`;
    
    setAiResult(null);
    setAiError(null);
    
    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setAiError('Failed to process shipment analysis');
    }
  };

  // CRUD Functions
  const handleAdd = (entity: 'vehicle' | 'driver' | 'route' | 'shipment') => {
    setModalEntity(entity);
    setModalType('add');
    setSelectedItem(null);
    setShowModal(true);
  };

  const handleEdit = (entity: 'vehicle' | 'driver' | 'route' | 'shipment', item: any) => {
    setModalEntity(entity);
    setModalType('edit');
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = (entity: 'vehicle' | 'driver' | 'route' | 'shipment', id: string) => {
    setConfirmMessage(`Are you sure you want to delete this ${entity}?`);
    setConfirmAction(() => () => {
      switch (entity) {
        case 'vehicle':
          setVehicles(prev => prev.filter(v => v.id !== id));
          break;
        case 'driver':
          setDrivers(prev => prev.filter(d => d.id !== id));
          break;
        case 'route':
          setRoutes(prev => prev.filter(r => r.id !== id));
          break;
        case 'shipment':
          setShipments(prev => prev.filter(s => s.id !== id));
          break;
      }
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  const handleSave = (formData: any) => {
    const id = modalType === 'add' ? Date.now().toString() : selectedItem.id;
    const newItem = { ...selectedItem, ...formData, id }; // Ensure selectedItem fields are preserved if not in formData

    switch (modalEntity) {
      case 'vehicle':
        if (modalType === 'add') {
          setVehicles(prev => [...prev, newItem as Vehicle]);
        } else {
          setVehicles(prev => prev.map(v => v.id === id ? newItem as Vehicle : v));
        }
        break;
      case 'driver':
        if (modalType === 'add') {
          setDrivers(prev => [...prev, newItem as Driver]);
        } else {
          setDrivers(prev => prev.map(d => d.id === id ? newItem as Driver : d));
        }
        break;
      case 'route':
        if (modalType === 'add') {
          setRoutes(prev => [...prev, newItem as RouteInterface]);
        } else {
          setRoutes(prev => prev.map(r => r.id === id ? newItem as RouteInterface : r));
        }
        break;
      case 'shipment':
        if (modalType === 'add') {
          setShipments(prev => [...prev, newItem as Shipment]);
        } else {
          setShipments(prev => prev.map(s => s.id === id ? newItem as Shipment : s));
        }
        break;
    }
    setShowModal(false);
  };

  // Import/Export Functions
  const downloadTemplate = (type: string) => {
    let headers: string[] = [];
    let sampleData: string[] = [];

    switch (type) {
      case 'vehicles':
        headers = ['plateNumber', 'type', 'capacity', 'fuelType', 'status', 'currentLocation', 'lastMaintenance', 'nextMaintenance', 'mileage', 'fuelEfficiency'];
        sampleData = ['TRK-003', 'truck', '6000', 'diesel', 'active', 'Chennai', '2025-05-01', '2025-07-01', '25000', '9.2'];
        break;
      case 'drivers':
        headers = ['name', 'licenseNumber', 'phone', 'email', 'experience', 'rating', 'status', 'totalDeliveries', 'joinDate'];
        sampleData = ['John Doe', 'DL-003', '+91-9876543212', 'john@transport.com', '6', '4.6', 'available', '98', '2023-01-15'];
        break;
      case 'routes':
        headers = ['name', 'origin', 'destination', 'distance', 'estimatedTime', 'status', 'waypoints', 'difficulty', 'tollCost'];
        sampleData = ['Chennai-Kolkata', 'Chennai', 'Kolkata', '1650', '28', 'active', 'Vijayawada,Visakhapatnam,Bhubaneswar', 'medium', '2800'];
        break;
      case 'shipments':
        headers = ['trackingNumber', 'sender', 'receiver', 'origin', 'destination', 'weight', 'value', 'status', 'priority', 'createdDate', 'expectedDelivery'];
        sampleData = ['TRK20250003', 'Supplier ABC', 'Customer XYZ', 'Chennai', 'Kolkata', '750', '75000', 'pending', 'high', '2025-06-05', '2025-06-09'];
        break;
    }

    const csvContent = [headers.join(','), sampleData.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = (type: string) => {
    let data: any[] = [];
    let filename = '';

    switch (type) {
      case 'vehicles':
        data = vehicles;
        filename = 'vehicles_export.csv';
        break;
      case 'drivers':
        data = drivers;
        filename = 'drivers_export.csv';
        break;
      case 'routes':
        data = routes;
        filename = 'routes_export.csv';
        break;
      case 'shipments':
        data = shipments;
        filename = 'shipments_export.csv';
        break;
      case 'all':
        const allData = {
          'Export Date': new Date().toLocaleString(),
          'Total Vehicles': vehicles.length,
          'Total Drivers': drivers.length,
          'Total Routes': routes.length,
          'Total Shipments': shipments.length,
          'Active Vehicles': vehicles.filter(v => v.status === 'active').length,
          'Available Drivers': drivers.filter(d => d.status === 'available').length,
          'In-Transit Shipments': shipments.filter(s => s.status === 'in-transit').length
        };
        const csvContentAll = Object.entries(allData).map(([key, value]) => `${key},${value}`).join('\n');
        const blobAll = new Blob([csvContentAll], { type: 'text/csv' });
        const urlAll = URL.createObjectURL(blobAll);
        const aAll = document.createElement('a');
        aAll.href = urlAll;
        aAll.download = 'transport_summary.csv';
        aAll.click();
        URL.revokeObjectURL(urlAll);
        return;
    }

    if (data.length === 0) {
      setAiError(`No ${type} data to export`); // Consider using a different state for non-AI errors
      return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    
    data.forEach(item => {
      const values = headers.map(header => {
        const value = item[header];
        if (Array.isArray(value)) return `"${value.join(';')}"`; // Handle array waypoints
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importFile) {
      setAiError('Please select a file to import'); // Consider using a different state for non-AI errors
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          setAiError('Invalid CSV format');
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const importedData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj: any = {};
          headers.forEach((header, index) => {
            if (header === 'waypoints') {
                obj[header] = values[index] ? values[index].split(';').map(w => w.trim()) : [];
            } else if (['capacity', 'mileage', 'experience', 'rating', 'totalDeliveries', 'distance', 'estimatedTime', 'tollCost', 'weight', 'value'].includes(header)) {
                obj[header] = parseFloat(values[index]) || 0;
            } else {
                obj[header] = values[index] || '';
            }
          });
          obj.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
          return obj;
        });

        // Determine entity type based on headers
        if (headers.includes('plateNumber') && headers.includes('capacity')) {
          setVehicles(prev => [...prev, ...importedData as Vehicle[]]);
        } else if (headers.includes('licenseNumber') && headers.includes('experience')) {
          setDrivers(prev => [...prev, ...importedData as Driver[]]);
        } else if (headers.includes('origin') && headers.includes('destination') && headers.includes('distance')) {
          setRoutes(prev => [...prev, ...importedData as RouteInterface[]]);
        } else if (headers.includes('trackingNumber') && headers.includes('sender')) {
          setShipments(prev => [...prev, ...importedData as Shipment[]]);
        } else {
          setAiError('Unable to determine data type from CSV headers');
          return;
        }

        setShowImportModal(false);
        setImportFile(null);
      } catch (error) {
        setAiError('Failed to parse CSV file');
      }
    };
    reader.readAsText(importFile);
  };

  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all data? This action cannot be undone.');
    setConfirmAction(() => () => {
      setVehicles([]);
      setDrivers([]);
      setRoutes([]);
      setShipments([]);
      localStorage.removeItem('transport_vehicles');
      localStorage.removeItem('transport_drivers');
      localStorage.removeItem('transport_routes');
      localStorage.removeItem('transport_shipments');
      setShowConfirmDialog(false);
    });
    setShowConfirmDialog(true);
  };

  // Dashboard calculations
  const totalVehicles = vehicles.length;
  const activeVehiclesCount = vehicles.filter(v => v.status === 'active').length;
  const totalDrivers = drivers.length;
  const availableDriversCount = drivers.filter(d => d.status === 'available').length;
  const totalShipments = shipments.length;
  const inTransitShipmentsCount = shipments.filter(s => s.status === 'in-transit').length;
  const totalRevenue = shipments.reduce((sum, s) => sum + s.value, 0);

  // Chart data
  const vehicleStatusData = [
    { name: 'Active', value: vehicles.filter(v => v.status === 'active').length, color: '#10b981' },
    { name: 'Maintenance', value: vehicles.filter(v => v.status === 'maintenance').length, color: '#f59e0b' },
    { name: 'Inactive', value: vehicles.filter(v => v.status === 'inactive').length, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const shipmentStatusChartData = [
    { name: 'Pending', value: shipments.filter(s => s.status === 'pending').length },
    { name: 'In Transit', value: shipments.filter(s => s.status === 'in-transit').length },
    { name: 'Delivered', value: shipments.filter(s => s.status === 'delivered').length },
    { name: 'Cancelled', value: shipments.filter(s => s.status === 'cancelled').length }
  ].filter(d => d.value > 0);

  const monthlyRevenueData = [
    { month: 'Jan', revenue: 450000 },
    { month: 'Feb', revenue: 520000 },
    { month: 'Mar', revenue: 480000 },
    { month: 'Apr', revenue: 610000 },
    { month: 'May', revenue: 580000 },
    { month: 'Jun', revenue: 650000 }
  ];

  // Filter functions
  const getFilteredData = (data: any[], entityType: string) => {
    let filtered = data;

    if (searchTerm) {
      filtered = filtered.filter(item => {
        const searchFields = entityType === 'vehicles' ? ['plateNumber', 'currentLocation'] :
                           entityType === 'drivers' ? ['name', 'email', 'phone'] :
                           entityType === 'routes' ? ['name', 'origin', 'destination'] :
                           ['trackingNumber', 'sender', 'receiver'];
        
        return searchFields.some(field => 
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    const statusClasses: Record<string, string> = {
      active: 'badge badge-success',
      inactive: 'badge badge-error',
      maintenance: 'badge badge-warning',
      available: 'badge badge-success',
      assigned: 'badge badge-info',
      'on-leave': 'badge badge-warning',
      pending: 'badge badge-warning',
      'in-transit': 'badge badge-info',
      delivered: 'badge badge-success',
      cancelled: 'badge badge-error'
    };
    
    return statusClasses[status] || 'badge';
  };

  const renderDashboard = () => (
    <div className="space-y-6" id="welcome_fallback">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Transport Dashboard
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            Welcome back, {currentUser?.first_name}! Here's your transport overview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleRouteOptimization}
            className="btn btn-primary btn-sm flex items-center gap-2"
            disabled={aiLoading}
            id="route-optimization-btn"
          >
            <Navigation className="w-4 h-4" />
            {aiLoading ? 'Optimizing...' : 'Optimize Routes'}
          </button>
          <button
            onClick={handleShipmentAnalysis}
            className="btn bg-purple-600 text-white hover:bg-purple-700 btn-sm flex items-center gap-2"
            disabled={aiLoading}
            id="shipment-analysis-btn"
          >
            <BarChart3 className="w-4 h-4" />
            {aiLoading ? 'Analyzing...' : 'Analyze Shipments'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Vehicles</div>
              <div className="stat-value">{totalVehicles}</div>
              <div className="stat-desc">{activeVehiclesCount} active</div>
            </div>
            <Truck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Drivers</div>
              <div className="stat-value">{totalDrivers}</div>
              <div className="stat-desc">{availableDriversCount} available</div>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Shipments</div>
              <div className="stat-value">{totalShipments}</div>
              <div className="stat-desc">{inTransitShipmentsCount} in transit</div>
            </div>
            <Package className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value">₹{(totalRevenue / 100000).toFixed(1)}L</div>
              <div className="stat-desc flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                +12% this month
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card" id="vehicle-status-chart">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Vehicle Status</h3>
          {vehicleStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={vehicleStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-slate-400 text-center py-10">No vehicle data for chart.</p>}
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shipment Status</h3>
          {shipmentStatusChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={shipmentStatusChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-gray-500 dark:text-slate-400 text-center py-10">No shipment data for chart.</p>}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyRevenueData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Results */}
      {(aiResult || aiError) && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Analysis Results</h3>
          {aiError && (
            <div className="alert alert-error">
              <AlertCircle className="w-5 h-5" />
              <p>{aiError.toString()}</p>
            </div>
          )}
          {aiResult && (
            <div className="alert alert-success">
              <CheckCircle className="w-5 h-5" />
              <div className="whitespace-pre-wrap">{aiResult}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderDataTable = (tabType: TabType) => {
    let data: any[] = [];
    let columns: string[] = [];
    let displayData: any[] = [];
    let entityForCrud: 'vehicle' | 'driver' | 'route' | 'shipment' = 'vehicle'; // default

    switch (tabType) {
      case 'fleet':
        data = vehicles;
        columns = ['Plate Number', 'Type', 'Capacity', 'Status', 'Location', 'Driver', 'Actions'];
        displayData = getFilteredData(vehicles, 'vehicles');
        entityForCrud = 'vehicle';
        break;
      case 'drivers':
        data = drivers;
        columns = ['Name', 'License', 'Phone', 'Experience', 'Rating', 'Status', 'Vehicle', 'Actions'];
        displayData = getFilteredData(drivers, 'drivers');
        entityForCrud = 'driver';
        break;
      case 'routes':
        data = routes;
        columns = ['Name', 'Origin', 'Destination', 'Distance', 'Time', 'Status', 'Actions'];
        displayData = getFilteredData(routes, 'routes');
        entityForCrud = 'route';
        break;
      case 'shipments':
        data = shipments;
        columns = ['Tracking', 'Sender', 'Receiver', 'Status', 'Priority', 'Weight', 'Value', 'Actions'];
        displayData = getFilteredData(shipments, 'shipments');
        entityForCrud = 'shipment';
        break;
    }

    const getUniqueStatuses = () => {
      if (!data || data.length === 0) return [];
      const statuses = data.map(item => item.status);
      return [...new Set(statuses)];
    };

    return (
      <div className="space-y-6" id="generation_issue_fallback">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white capitalize">
              {tabType} Management
            </h1>
            <p className="text-gray-600 dark:text-slate-400 mt-1">
              Manage your {tabType} efficiently
            </p>
          </div>
          <button
            onClick={() => handleAdd(entityForCrud)}
            className="btn btn-primary flex items-center gap-2"
            id={`add-${tabType}-btn`}
          >
            <Plus className="w-4 h-4" />
            Add {entityForCrud}
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${tabType}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
                id={`search-${tabType}`}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-auto"
              id={`filter-${tabType}`}
            >
              <option value="all">All Status</option>
              {getUniqueStatuses().map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
              id={`import-${tabType}-btn`}
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={() => exportData(tabType as string)} // Cast because exportData expects specific strings
              className="btn bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
              id={`export-${tabType}-btn`}
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="card p-0 overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  {columns.map(column => (
                    <th key={column} className="table-header px-6 py-3">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {displayData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {tabType === 'fleet' && (
                      <>
                        <td className="table-cell font-medium">{item.plateNumber}</td>
                        <td className="table-cell capitalize">{item.type}</td>
                        <td className="table-cell">{item.capacity} kg</td>
                        <td className="table-cell">
                          <span className={getStatusBadge(item.status)}>{item.status}</span>
                        </td>
                        <td className="table-cell">{item.currentLocation}</td>
                        <td className="table-cell">
                          {item.driverId ? drivers.find(d => d.id === item.driverId)?.name || 'Unassigned' : 'Unassigned'}
                        </td>
                      </>
                    )}
                    {tabType === 'drivers' && (
                      <>
                        <td className="table-cell font-medium">{item.name}</td>
                        <td className="table-cell">{item.licenseNumber}</td>
                        <td className="table-cell">{item.phone}</td>
                        <td className="table-cell">{item.experience} years</td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <span>{item.rating}</span>
                            <span className="text-yellow-400">★</span>
                          </div>
                        </td>
                        <td className="table-cell">
                          <span className={getStatusBadge(item.status)}>{item.status}</span>
                        </td>
                        <td className="table-cell">
                          {item.currentVehicle ? vehicles.find(v => v.id === item.currentVehicle)?.plateNumber || 'None' : 'None'}
                        </td>
                      </>
                    )}
                    {tabType === 'routes' && (
                      <>
                        <td className="table-cell font-medium">{item.name}</td>
                        <td className="table-cell">{item.origin}</td>
                        <td className="table-cell">{item.destination}</td>
                        <td className="table-cell">{item.distance} km</td>
                        <td className="table-cell">{item.estimatedTime} hrs</td>
                        <td className="table-cell">
                          <span className={getStatusBadge(item.status)}>{item.status}</span>
                        </td>
                      </>
                    )}
                    {tabType === 'shipments' && (
                      <>
                        <td className="table-cell font-medium">{item.trackingNumber}</td>
                        <td className="table-cell">{item.sender}</td>
                        <td className="table-cell">{item.receiver}</td>
                        <td className="table-cell">
                          <span className={getStatusBadge(item.status)}>{item.status}</span>
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${ item.priority === 'high' ? 'badge-error' : item.priority === 'medium' ? 'badge-warning' : 'badge-info' }`}>{item.priority}</span>
                        </td>
                        <td className="table-cell">{item.weight} kg</td>
                        <td className="table-cell">₹{item.value.toLocaleString()}</td>
                      </>
                    )}
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(entityForCrud, item)}
                          className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(entityForCrud, item.id)}
                          className="btn btn-sm bg-red-600 text-white hover:bg-red-700"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayData.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                No {tabType} found
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="space-y-6" id="settings-page">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Manage your application settings and data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Theme Settings */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appearance</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">Dark Mode</label>
                <p className="text-xs text-gray-500 dark:text-slate-400">Toggle between light and dark theme</p>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`theme-toggle ${isDarkMode ? 'bg-blue-600' : 'bg-gray-200'}`}
                id="theme-toggle"
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Data Management</h3>
          <div className="space-y-3">
            <button
              onClick={() => exportData('all')}
              className="btn bg-green-600 text-white hover:bg-green-700 w-full flex items-center gap-2"
              id="export-all-btn"
            >
              <Download className="w-4 h-4" />
              Export All Data
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn bg-blue-600 text-white hover:bg-blue-700 w-full flex items-center gap-2"
              id="import-data-btn"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </button>
            <button
              onClick={clearAllData}
              className="btn bg-red-600 text-white hover:bg-red-700 w-full flex items-center gap-2"
              id="clear-all-btn"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Download Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => downloadTemplate('vehicles')}
              className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Vehicles
            </button>
            <button
              onClick={() => downloadTemplate('drivers')}
              className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Drivers
            </button>
            <button
              onClick={() => downloadTemplate('routes')}
              className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Routes
            </button>
            <button
              onClick={() => downloadTemplate('shipments')}
              className="btn bg-gray-600 text-white hover:bg-gray-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Shipments
            </button>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">AI Assistant</h3>
          <div className="space-y-4">
            <button
              onClick={() => setShowAiModal(true)}
              className="btn bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
              id="ai-assistant-btn"
            >
              <Activity className="w-4 h-4" />
              Open AI Assistant
            </button>
            <div className="text-sm text-gray-500 dark:text-slate-400">
              Get insights about your transport operations, route optimization suggestions, and shipment analysis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderConfirmDialog = () => {
    if (!showConfirmDialog) return null;

    return (
      <div className="modal-backdrop">
        <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Action</h3>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600 dark:text-slate-400">{confirmMessage}</p>
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
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
    );
  };

  const renderImportModal = () => {
    if (!showImportModal) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowImportModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Import Data</h3>
            <button
              onClick={() => setShowImportModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="alert alert-info">
              <FileText className="w-5 h-5" />
              <p>Upload a CSV file to import data. Make sure to download the template first for the correct format.</p>
            </div>
            
            <div className="form-group">
              <label className="form-label">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="input"
              />
            </div>
            
            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="w-5 h-5" />
                <p>{aiError}</p>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => setShowImportModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!importFile}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAiModal = () => {
    if (!showAiModal) return null;

    return (
      <div className="modal-backdrop" onClick={() => setShowAiModal(false)}>
        <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Assistant</h3>
            <button
              onClick={() => setShowAiModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="form-group">
              <label className="form-label">Ask AI about your transport operations</label>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g., Analyze my fleet efficiency, suggest cost optimizations, or review delivery performance..."
                className="input min-h-[100px] resize-y"
                rows={4}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAiPrompt('Analyze my fleet utilization and suggest improvements for better efficiency.')}
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Fleet Analysis
              </button>
              <button
                onClick={() => setAiPrompt('Review my shipment data and identify potential delivery delays or issues.')}
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Shipment Review
              </button>
              <button
                onClick={() => setAiPrompt('Suggest cost optimization strategies for my transport operations.')}
                className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Cost Optimization
              </button>
            </div>
            
            {aiLoading && (
              <div className="alert alert-info">
                <Activity className="w-5 h-5 animate-spin" />
                <p>AI is analyzing your data...</p>
              </div>
            )}
            
            {aiError && (
              <div className="alert alert-error">
                <AlertCircle className="w-5 h-5" />
                <p>{aiError.toString()}</p>
              </div>
            )}
            
            {aiResult && (
              <div className="alert alert-success">
                <CheckCircle className="w-5 h-5" />
                <div className="whitespace-pre-wrap">{aiResult}</div>
              </div>
            )}
          </div>
          
          <div className="modal-footer">
            <button
              onClick={() => setShowAiModal(false)}
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
            <button
              onClick={handleAiAnalysis}
              disabled={!aiPrompt.trim() || aiLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {aiLoading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'fleet', label: 'Fleet', icon: Truck },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'shipments', label: 'Shipments', icon: Package },
    { id: 'settings', label: 'Settings', icon: Settings }
  ] as const;

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition ${styles.placeholderClass}`}>
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        onResult={(result) => setAiResult(result)}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setAiLoading(loading)}
      />
      
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-40 theme-transition">
        <div className="container-fluid">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  TransportMS
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="hidden sm:block text-sm text-gray-600 dark:text-slate-400">
                Welcome, {currentUser?.first_name}
              </span>
              <button
                onClick={() => setShowTourInfo(!showTourInfo)}
                className="btn btn-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                id="tour-info-btn"
              >
                ?
              </button>
              <button
                onClick={logout}
                className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800 flex items-center gap-2"
                id="logout-btn"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 transition-transform duration-300 ease-in-out theme-transition`}>
          <nav className="p-4 space-y-2 mt-16 md:mt-0" id="main-navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${ activeTab === item.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700' }`}
                  id={`nav-${item.id}`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'fleet' && renderDataTable('fleet')}
          {activeTab === 'drivers' && renderDataTable('drivers')}
          {activeTab === 'routes' && renderDataTable('routes')}
          {activeTab === 'shipments' && renderDataTable('shipments')}
          {activeTab === 'settings' && renderSettings()}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 theme-transition">
        <div className="container-fluid">
          <div className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Tour Info */}
      {showTourInfo && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium">Guided Tour Available!</h4>
            <button
              onClick={() => setShowTourInfo(false)}
              className="text-blue-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-blue-100">
            This application includes an automated guided tour to help you get started. The tour will highlight key features and functionality.
          </p>
        </div>
      )}

      {/* Modals */}
      <EntityModal 
        show={showModal} 
        modalType={modalType} 
        modalEntity={modalEntity} 
        selectedItem={selectedItem} 
        onClose={() => setShowModal(false)} 
        onSave={handleSave} 
      />
      {renderConfirmDialog()}
      {renderImportModal()}
      {renderAiModal()}
    </div>
  );
};

export default App;
