import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Edit, Trash2, Search, Filter, XCircle, ChevronDown, Loader2, Moon, Sun } from 'lucide-react';

interface Shipment {
  id: string;
  destination: string;
  status: string;
  deliveryDate: string;
  notes?: string;
}

const App: React.FC = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [filteredShipments, setFilteredShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [newShipment, setNewShipment] = useState<Shipment>({ id: '', destination: '', status: 'Pending', deliveryDate: '', notes: '' });
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    // Simulate fetching data
    const timeoutId = setTimeout(() => {
      const mockData: Shipment[] = [
        { id: '1', destination: 'New York', status: 'Delivered', deliveryDate: '2024-03-15', notes: 'Delivered on time' },
        { id: '2', destination: 'Los Angeles', status: 'In Transit', deliveryDate: '2024-03-20', notes: '' },
        { id: '3', destination: 'Chicago', status: 'Pending', deliveryDate: '2024-03-22', notes: 'Awaiting confirmation' },
        { id: '4', destination: 'Houston', status: 'Delivered', deliveryDate: '2024-03-10', notes: '' },
        { id: '5', destination: 'Phoenix', status: 'In Transit', deliveryDate: '2024-03-18', notes: 'Slight delay expected' },
      ];
      setShipments(mockData);
      setFilteredShipments(mockData);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let result = shipments;

    if (searchTerm) {
      result = result.filter(shipment =>
        shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus) {
      result = result.filter(shipment => shipment.status === filterStatus);
    }

    if (sortOrder) {
        result = [...result].sort((a, b) => {
            const dateA = new Date(a.deliveryDate);
            const dateB = new Date(b.deliveryDate);
            return sortOrder === 'asc' ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
        });
    }

    setFilteredShipments(result);
  }, [searchTerm, filterStatus, shipments, sortOrder]);

  const handleAddShipment = () => {
    if (newShipment.destination && newShipment.deliveryDate) {
      setShipments([...shipments, { ...newShipment, id: Date.now().toString() }]);
      setNewShipment({ id: '', destination: '', status: 'Pending', deliveryDate: '', notes: '' });
      setIsAdding(false);
    } else {
      setError('Please fill in all required fields.');
    }
  };

  const handleEditShipment = () => {
    if (newShipment.destination && newShipment.deliveryDate && isEditing) {
      const updatedShipments = shipments.map(shipment =>
        shipment.id === isEditing ? newShipment : shipment
      );
      setShipments(updatedShipments);
      setNewShipment({ id: '', destination: '', status: 'Pending', deliveryDate: '', notes: '' });
      setIsEditing(null);
      setError(null);
    } else {
      setError('Please fill in all required fields.');
    }
  };

  const handleDeleteShipment = (id: string) => {
    setShipments(shipments.filter(shipment => shipment.id !== id));
  };

    const statusOptions = ['Pending', 'In Transit', 'Delivered'];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900 theme-transition-all">

    {/* Theme Toggler */}  
      <div className="container mx-auto p-4 flex justify-end">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          className="theme-toggle p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-slate-900 focus:ring-primary-500 dark:focus:ring-primary-400 transition-all"
        >
            {isDarkMode ? <Sun className="h-6 w-6 text-yellow-500" /> : <Moon className="h-6 w-6 text-gray-700" />}
        </button>
      </div>

      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 text-center">Shipment Monitoring</h1>

        {/* Add Shipment Form */}
        {isAdding && (
          <div className="card-responsive mb-4">
              <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-slate-200">Add Shipment</h2>
              <div className="space-y-2">
                {error && <div className="alert alert-error"><XCircle className='h-5 w-5 inline-block mr-1'/>{error}</div>}
              <div className="flex flex-col sm:flex-row gap-2">
                  
                  <div className="form-group">
                    <label htmlFor="destination" className="form-label">Destination</label>
                    <input
                      id="destination"
                      type="text"
                      value={newShipment.destination}
                      onChange={(e) => setNewShipment({ ...newShipment, destination: (e.target as HTMLInputElement).value })}
                      className="input w-full"
                      placeholder="Destination"
                      role="textbox"
                      name="destination"
                    />
                  </div>

                <div className="form-group">
                  <label htmlFor="deliveryDate" className="form-label">Delivery Date</label>
                  <input
                    id="deliveryDate"
                    type="date"
                    value={newShipment.deliveryDate}
                    onChange={(e) => setNewShipment({ ...newShipment, deliveryDate: (e.target as HTMLInputElement).value })}
                    className="input w-full"
                    role="textbox"
                    name="deliveryDate"
                  />
                  </div>
              </div>

              <div className="form-group">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                    id='status'
                    value={newShipment.status}
                    onChange={(e) => setNewShipment({ ...newShipment, status: (e.target as HTMLSelectElement).value })}
                    className="input w-full"
                    name="status"
                    role="combobox"
                >
                    {statusOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                </div>

              

              <div className="form-group">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  id="notes"
                  value={newShipment.notes}
                  onChange={(e) => setNewShipment({ ...newShipment, notes: (e.target as HTMLTextAreaElement).value })}
                  className="input w-full"
                  placeholder="Notes (Optional)"
                  rows={3}
                  role="textbox"
                  name="notes"
                />
              </div>
            </div>
              <div className="mt-4 flex gap-2">
                <button onClick={handleAddShipment} className="btn btn-primary w-full sm:w-auto">Add</button>
                <button onClick={() => { setIsAdding(false); setError(null); }} className="btn bg-gray-200 text-gray-800 w-full sm:w-auto">Cancel</button>
              </div>
          </div>
        )}

        {/* Edit Shipment Form */}
        {isEditing && (
        <div className="card-responsive mb-4">
            <h2 className="text-lg font-semibold mb-2 text-gray-700 dark:text-slate-200">Edit Shipment</h2>
            <div className="space-y-2">
                {error && <div className="alert alert-error"><XCircle className='h-5 w-5 inline-block mr-1'/>{error}</div>}
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="form-group">
                <label htmlFor="edit-destination" className="form-label">Destination</label>
                <input
                    id="edit-destination"
                    type="text"
                    value={newShipment.destination}
                    onChange={(e) => setNewShipment({ ...newShipment, destination: (e.target as HTMLInputElement).value })}
                    className="input w-full"
                    placeholder="Destination"
                    role="textbox"
                    name="edit-destination"
                />
                </div>

                <div className="form-group">
                <label htmlFor="edit-deliveryDate" className="form-label">Delivery Date</label>
                <input
                    id="edit-deliveryDate"
                    type="date"
                    value={newShipment.deliveryDate}
                    onChange={(e) => setNewShipment({ ...newShipment, deliveryDate: (e.target as HTMLInputElement).value })}
                    className="input w-full"
                    role="textbox"
                    name="edit-deliveryDate"
                />
                </div>
            </div>

            <div className="form-group">
              <label htmlFor="edit-status" className="form-label">Status</label>
              <select
                id='edit-status'
                value={newShipment.status}
                onChange={(e) => setNewShipment({ ...newShipment, status: (e.target as HTMLSelectElement).value })}
                className="input w-full"
                name="edit-status"
                role="combobox"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            

            <div className="form-group">
                <label htmlFor="edit-notes" className="form-label">Notes</label>
                <textarea
                id="edit-notes"
                value={newShipment.notes}
                onChange={(e) => setNewShipment({ ...newShipment, notes: (e.target as HTMLTextAreaElement).value })}
                className="input w-full"
                placeholder="Notes (Optional)"
                rows={3}
                role="textbox"
                name="edit-notes"
                />
            </div>
            </div>
            <div className="mt-4 flex gap-2">
            <button onClick={handleEditShipment} className="btn btn-primary w-full sm:w-auto">Save</button>
            <button onClick={() => { setIsEditing(null); setNewShipment({ id: '', destination: '', status: 'Pending', deliveryDate: '', notes: '' }); setError(null); }} className="btn bg-gray-200 text-gray-800 w-full sm:w-auto">Cancel</button>
            </div>
        </div>
        )}

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-4">
            <div className="relative w-full md:w-1/2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <input
                type="text"
                placeholder="Search by destination or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                className="input pl-10 w-full"
                role="searchbox"
                name="search"
                />
            </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus((e.target as HTMLSelectElement).value)}
              className="input w-40"
              name="filterStatus"
              role="combobox"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')} className="btn-responsive">
                <ChevronDown className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
        {loading ? (
            <div className="flex justify-center items-center h-24">
            <Loader2 className="animate-spin h-8 w-8 text-primary-500" />
            </div>
        ) : error ? (
            <div className="alert alert-error">Error: {error}</div>
        ) : (
            <table className="table">
            <thead>
                <tr>
                <th className="table-header">Destination</th>
                <th className="table-header">Delivery Date</th>
                <th className="table-header">Status</th>
                <th className="table-header">Notes</th>
                <th className="table-header">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                {filteredShipments.map((shipment) => (
                <tr key={shipment.id} className='hover:bg-gray-50 dark:hover:bg-slate-700'>
                    <td className="table-cell">{shipment.destination}</td>
                    <td className="table-cell">{format(new Date(shipment.deliveryDate), 'PP')}</td>
                    <td className="table-cell">
                    <span className={`badge ${shipment.status === 'Delivered' ? 'badge-success' : shipment.status === 'In Transit' ? 'badge-info' : 'badge-warning'}`}>
                        {shipment.status}
                    </span>
                    </td>
                    <td className="table-cell">{shipment.notes || '-'}</td>
                    <td className="table-cell">
                    <div className="flex gap-2">
                        <button
                        onClick={() => {
                            setIsEditing(shipment.id);
                            setNewShipment(shipment);
                        }}
                        className="btn btn-sm btn-primary"
                        role="button"
                        name={`edit-${shipment.id}`}
                        >
                        <Edit className="h-4 w-4" />
                        </button>
                        <button
                        onClick={() => handleDeleteShipment(shipment.id)}
                        className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                        role="button"
                        name={`delete-${shipment.id}`}
                        >
                        <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        )}
        </div>
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="btn btn-primary mt-4 w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" /> Add Shipment
          </button>
        )}
      </div>

        {/* Footer */}  
        <footer className="text-center text-gray-500 dark:text-slate-400 p-4 mt-8 border-t border-gray-200 dark:border-slate-700">
            Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
    </div>
  );
};

export default App;
