import React, { useState, useEffect } from 'react';
import { User, UserPlus, UserRound, LogOut, Moon, Sun, Search, ChevronDown, Plus, Edit, Trash2, X, Check } from 'lucide-react';
import styles from './styles/styles.module.css';

// Define the types for our application
interface Duck {
  id: string;
  name: string;
  breed: string;
  age: number;
  color: string;
  location: string;
  description: string;
  lastSeen: string;
  isFavorite: boolean;
}

interface FilterOptions {
  breed: string;
  color: string;
  ageMin: number;
  ageMax: number;
  location: string;
}

type SortField = 'name' | 'age' | 'breed' | 'lastSeen';
type SortDirection = 'asc' | 'desc';

const App: React.FC = () => {
  // State management
  const [ducks, setDucks] = useState<Duck[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingDuck, setEditingDuck] = useState<Duck | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    breed: '',
    color: '',
    ageMin: 0,
    ageMax: 30,
    location: ''
  });

  // Initial duck data
  const initialDucks: Duck[] = [
    {
      id: '1',
      name: 'Quackers',
      breed: 'Mallard',
      age: 3,
      color: 'Green',
      location: 'Central Park',
      description: 'Friendly duck that likes to be fed bread crumbs.',
      lastSeen: '2023-10-15',
      isFavorite: true
    },
    {
      id: '2',
      name: 'Daffy',
      breed: 'American Pekin',
      age: 2,
      color: 'White',
      location: 'Lake Michigan',
      description: 'Energetic duck with a distinctive quack.',
      lastSeen: '2023-11-01',
      isFavorite: false
    },
    {
      id: '3',
      name: 'Waddles',
      breed: 'Rouen',
      age: 5,
      color: 'Brown',
      location: 'Local Pond',
      description: 'Calm and collected, often seen leading other ducks.',
      lastSeen: '2023-11-10',
      isFavorite: true
    },
    {
      id: '4',
      name: 'Bill',
      breed: 'Wood Duck',
      age: 1,
      color: 'Multicolored',
      location: 'Willow River',
      description: 'Young and playful duck with beautiful plumage.',
      lastSeen: '2023-11-15',
      isFavorite: false
    },
    {
      id: '5',
      name: 'Feathers',
      breed: 'Mandarin',
      age: 4,
      color: 'Orange/Blue',
      location: 'Botanical Gardens',
      description: 'Exotic looking duck that attracts a lot of attention.',
      lastSeen: '2023-11-05',
      isFavorite: true
    }
  ];

  // Form state for adding/editing ducks
  const [formState, setFormState] = useState<Omit<Duck, 'id' | 'isFavorite'>>({ 
    name: '',
    breed: '',
    age: 0,
    color: '',
    location: '',
    description: '',
    lastSeen: new Date().toISOString().split('T')[0]
  });

  // Load ducks from localStorage on initial render
  useEffect(() => {
    const savedDucks = localStorage.getItem('ducks');
    if (savedDucks) {
      setDucks(JSON.parse(savedDucks));
    } else {
      setDucks(initialDucks);
      localStorage.setItem('ducks', JSON.stringify(initialDucks));
    }

    // Check for dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = savedDarkMode === 'true' || (savedDarkMode === null && prefersDarkMode);
    
    setDarkMode(shouldUseDarkMode);
    if (shouldUseDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Update localStorage whenever ducks change
  useEffect(() => {
    localStorage.setItem('ducks', JSON.stringify(ducks));
  }, [ducks]);

  // Effect for handling dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAddModal(false);
        setEditingDuck(null);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Reset form when modal is closed
  useEffect(() => {
    if (!showAddModal && !editingDuck) {
      setFormState({
        name: '',
        breed: '',
        age: 0,
        color: '',
        location: '',
        description: '',
        lastSeen: new Date().toISOString().split('T')[0]
      });
    }
  }, [showAddModal, editingDuck]);

  // Filter and sort ducks based on search query, filters, and sort options
  const filteredAndSortedDucks = ducks
    .filter(duck => {
      const matchesSearch = (
        duck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        duck.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
        duck.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        duck.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesFilters = (
        (filterOptions.breed === '' || duck.breed.toLowerCase().includes(filterOptions.breed.toLowerCase())) &&
        (filterOptions.color === '' || duck.color.toLowerCase().includes(filterOptions.color.toLowerCase())) &&
        (duck.age >= filterOptions.ageMin && duck.age <= filterOptions.ageMax) &&
        (filterOptions.location === '' || duck.location.toLowerCase().includes(filterOptions.location.toLowerCase()))
      );

      return matchesSearch && matchesFilters;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'age':
          comparison = a.age - b.age;
          break;
        case 'breed':
          comparison = a.breed.localeCompare(b.breed);
          break;
        case 'lastSeen':
          comparison = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime();
          break;
        default:
          comparison = 0;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Unique breeds and colors for filters
  const uniqueBreeds = Array.from(new Set(ducks.map(duck => duck.breed)));
  const uniqueColors = Array.from(new Set(ducks.map(duck => duck.color)));
  const uniqueLocations = Array.from(new Set(ducks.map(duck => duck.location)));

  // Handle adding a new duck
  const handleAddDuck = () => {
    const newDuck: Duck = {
      ...formState,
      id: Date.now().toString(),
      isFavorite: false
    };

    setDucks([...ducks, newDuck]);
    setShowAddModal(false);
    resetForm();
  };

  // Handle updating an existing duck
  const handleUpdateDuck = () => {
    if (!editingDuck) return;

    const updatedDucks = ducks.map(duck => 
      duck.id === editingDuck.id ? 
        {...duck, ...formState} : 
        duck
    );

    setDucks(updatedDucks);
    setEditingDuck(null);
    resetForm();
  };

  // Handle deleting a duck
  const handleDeleteDuck = (id: string) => {
    const updatedDucks = ducks.filter(duck => duck.id !== id);
    setDucks(updatedDucks);
  };

  // Handle toggling favorite status
  const handleToggleFavorite = (id: string) => {
    const updatedDucks = ducks.map(duck => 
      duck.id === id ? 
        {...duck, isFavorite: !duck.isFavorite} : 
        duck
    );

    setDucks(updatedDucks);
  };

  // Reset form state
  const resetForm = () => {
    setFormState({
      name: '',
      breed: '',
      age: 0,
      color: '',
      location: '',
      description: '',
      lastSeen: new Date().toISOString().split('T')[0]
    });
  };

  // Edit a duck
  const startEditing = (duck: Duck) => {
    setEditingDuck(duck);
    setFormState({
      name: duck.name,
      breed: duck.breed,
      age: duck.age,
      color: duck.color,
      location: duck.location,
      description: duck.description,
      lastSeen: duck.lastSeen
    });
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'age') {
      // Ensure age is a number
      setFormState({
        ...formState,
        [name]: parseInt(value) || 0
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ageMin' || name === 'ageMax') {
      setFilterOptions({
        ...filterOptions,
        [name]: parseInt(value) || 0
      });
    } else {
      setFilterOptions({
        ...filterOptions,
        [name]: value
      });
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilterOptions({
      breed: '',
      color: '',
      ageMin: 0,
      ageMax: 30,
      location: ''
    });
  };

  // Toggle sort direction or change sort field
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow theme-transition">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <UserRound className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900 dark:text-white">Duck Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 theme-transition"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? 
                  <Sun className="h-5 w-5 text-yellow-500" /> : 
                  <Moon className="h-5 w-5 text-gray-600" />
                }
              </button>
              <button className="btn btn-primary flex items-center">
                <LogOut className="h-4 w-4 mr-1" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-4 mb-6 theme-transition">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search ducks by name, breed, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <button 
                className="btn flex items-center justify-center" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <span>Filters</span>
                <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              <button 
                className="btn btn-primary flex items-center justify-center" 
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span>Add Duck</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 theme-transition">
              <div className="form-group">
                <label className="form-label" htmlFor="breed-filter">Breed</label>
                <select
                  id="breed-filter"
                  name="breed"
                  className="input"
                  value={filterOptions.breed}
                  onChange={handleFilterChange}
                >
                  <option value="">All Breeds</option>
                  {uniqueBreeds.map(breed => (
                    <option key={breed} value={breed}>{breed}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="color-filter">Color</label>
                <select
                  id="color-filter"
                  name="color"
                  className="input"
                  value={filterOptions.color}
                  onChange={handleFilterChange}
                >
                  <option value="">All Colors</option>
                  {uniqueColors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location-filter">Location</label>
                <select
                  id="location-filter"
                  name="location"
                  className="input"
                  value={filterOptions.location}
                  onChange={handleFilterChange}
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="age-min-filter">Min Age</label>
                <input
                  id="age-min-filter"
                  name="ageMin"
                  type="number"
                  className="input"
                  min="0"
                  max="30"
                  value={filterOptions.ageMin}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="age-max-filter">Max Age</label>
                <input
                  id="age-max-filter"
                  name="ageMax"
                  type="number"
                  className="input"
                  min="0"
                  max="30"
                  value={filterOptions.ageMax}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-5 flex justify-end">
                <button 
                  className="btn" 
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Duck List */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden theme-transition">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead>
                <tr>
                  <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      <span>Name</span>
                      {sortField === 'name' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('breed')}>
                    <div className="flex items-center">
                      <span>Breed</span>
                      {sortField === 'breed' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('age')}>
                    <div className="flex items-center">
                      <span>Age</span>
                      {sortField === 'age' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="table-header px-6 py-3">
                    <span>Color</span>
                  </th>
                  <th className="table-header px-6 py-3">
                    <span>Location</span>
                  </th>
                  <th className="table-header px-6 py-3 cursor-pointer" onClick={() => handleSort('lastSeen')}>
                    <div className="flex items-center">
                      <span>Last Seen</span>
                      {sortField === 'lastSeen' && (
                        <span className="ml-1">{sortDirection === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                  <th className="table-header px-6 py-3">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                {filteredAndSortedDucks.length > 0 ? (
                  filteredAndSortedDucks.map(duck => (
                    <tr key={duck.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition">
                      <td className="table-cell px-6 py-4">
                        <div className="flex items-center">
                          <span className={`mr-2 ${duck.isFavorite ? styles.favoriteIcon : ''}`} onClick={() => handleToggleFavorite(duck.id)}>🦆</span>
                          <span className="font-medium">{duck.name}</span>
                        </div>
                      </td>
                      <td className="table-cell px-6 py-4">{duck.breed}</td>
                      <td className="table-cell px-6 py-4">{duck.age} years</td>
                      <td className="table-cell px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">
                          {duck.color}
                        </span>
                      </td>
                      <td className="table-cell px-6 py-4">{duck.location}</td>
                      <td className="table-cell px-6 py-4">{new Date(duck.lastSeen).toLocaleDateString()}</td>
                      <td className="table-cell px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            onClick={() => startEditing(duck)}
                            aria-label="Edit duck"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            onClick={() => handleDeleteDuck(duck.id)}
                            aria-label="Delete duck"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="table-cell px-6 py-10 text-center text-gray-500 dark:text-slate-400">
                      No ducks found matching your criteria. Try adjusting your filters or search term.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Duck Detail View */}
        {filteredAndSortedDucks.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedDucks.slice(0, 3).map(duck => (
              <div key={`detail-${duck.id}`} className="card">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className={`mr-2 text-xl ${duck.isFavorite ? styles.favoriteIcon : ''}`} onClick={() => handleToggleFavorite(duck.id)}>🦆</span>
                    {duck.name}
                  </h3>
                  <span className="badge badge-info">{duck.breed}</span>
                </div>
                <p className="mt-2 text-gray-600 dark:text-slate-300">{duck.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="badge bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">
                    Age: {duck.age} years
                  </div>
                  <div className="badge bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">
                    Color: {duck.color}
                  </div>
                  <div className="badge bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300">
                    Location: {duck.location}
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-slate-400">
                  Last seen: {new Date(duck.lastSeen).toLocaleDateString()}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                    onClick={() => startEditing(duck)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                  <button 
                    className="btn btn-sm bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
                    onClick={() => handleDeleteDuck(duck.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Duck Modal */}
      {(showAddModal || editingDuck) && (
        <div 
          className="modal-backdrop theme-transition"
          onClick={() => {
            setShowAddModal(false);
            setEditingDuck(null);
          }}
        >
          <div 
            className="modal-content max-w-lg theme-transition"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="duck-form-title"
          >
            <div className="modal-header">
              <h2 id="duck-form-title" className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingDuck ? 'Edit Duck' : 'Add New Duck'}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingDuck(null);
                }}
                aria-label="Close modal"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              editingDuck ? handleUpdateDuck() : handleAddDuck();
            }}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    className="input"
                    value={formState.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="breed">Breed</label>
                    <input
                      id="breed"
                      name="breed"
                      type="text"
                      className="input"
                      value={formState.breed}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="age">Age (years)</label>
                    <input
                      id="age"
                      name="age"
                      type="number"
                      className="input"
                      min="0"
                      max="30"
                      value={formState.age}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="color">Color</label>
                    <input
                      id="color"
                      name="color"
                      type="text"
                      className="input"
                      value={formState.color}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="location">Location</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      className="input"
                      value={formState.location}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="input h-24"
                    value={formState.description}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="lastSeen">Last Seen Date</label>
                  <input
                    id="lastSeen"
                    name="lastSeen"
                    type="date"
                    className="input"
                    value={formState.lastSeen}
                    onChange={handleInputChange}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingDuck(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {editingDuck ? 'Update Duck' : 'Add Duck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-6 theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-slate-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;