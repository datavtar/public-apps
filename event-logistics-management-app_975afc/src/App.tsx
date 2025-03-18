import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';

interface EventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  status: 'Upcoming' | 'Completed' | 'Planning';
}

const App: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [newEvent, setNewEvent] = useState<EventItem>({
    id: '',
    name: '',
    date: '',
    venue: '',
    description: '',
    status: 'Planning',
  });

    const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
    const [sortKey, setSortKey] = useState<keyof EventItem | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [editEventId, setEditEventId] = useState<string | null>(null);


  useEffect(() => {
    // Load dark mode preference from local storage
     if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
       const initialMode = savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDarkMode(initialMode);
    }
  }, []);

    useEffect(() => {
        // Apply or remove dark class on body based on dark mode state
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);


  // Mock data loading (replace with actual data fetching if needed)
  useEffect(() => {
    setLoading(true);
    setError(null);
    const mockData: EventItem[] = [
      {
        id: '1',
        name: 'Annual School Fest',
        date: '2025-03-15',
        venue: 'School Auditorium',
        description: 'Our annual celebration with performances and awards.',
        status: 'Upcoming',
      },
      {
        id: '2',
        name: 'Science Exhibition',
        date: '2025-04-20',
        venue: 'Science Labs',
        description: 'Students showcase their science projects.',
        status: 'Planning',
      },
      {
         id: '3',
         name: 'Teacher Appreciation Day',
          date: '2024-09-05',
         venue: 'Staff Common Room', 
         description: 'Students and Staff felicitate the teachers', 
         status: 'Completed'
        }
    ];
    setTimeout(() => {
      setEvents(mockData);
      setLoading(false);
    }, 500);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
     if (editEventId) {
       // Update event directly in events state for immediate UI update
          setEvents(prevEvents => 
            prevEvents.map(event => 
                event.id === editEventId
                  ? { ...event, [name]: value } // Update the field
                  : event // Keep other events unchanged
                
            )
          )
    }else {
        setNewEvent((prev) => ({
            ...prev,
            [name]: value,
          }));
    }
  };

  const addEvent = () => {
    if (!newEvent.name || !newEvent.date || !newEvent.venue) {
      setError('Please fill in all required fields.');
      return;
    }

    const id = String(Date.now());
    setEvents([...events, { ...newEvent, id }]);
    setNewEvent({
      id: '',
      name: '',
      date: '',
      venue: '',
      description: '',
      status: 'Planning',
    });
    setError(null);
  };


	const updateEvent = () => {
		if (editEventId) {
      setEditEventId(null);
      setError(null);
    }
	};


  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };


   const filteredEvents = events.filter((event) => {
        const nameMatch = event.name.toLowerCase().includes(searchTerm.toLowerCase());
        const venueMatch = event.venue.toLowerCase().includes(searchTerm.toLowerCase());
        const descriptionMatch = event.description.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = filterStatus === 'All' || event.status === filterStatus;
        return (nameMatch || venueMatch || descriptionMatch) && statusMatch;
    });


    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (!sortKey) return 0;

        const valueA = a[sortKey] || '';
        const valueB = b[sortKey] || '';

        if (sortOrder === 'asc') {
            return valueA.toString().localeCompare(valueB.toString());
        } else {
            return valueB.toString().localeCompare(valueA.toString());
        }
    });

      const handleSort = (key: keyof EventItem) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };

     const startEditing = (id: string) => {
        setEditEventId(id);
        setError(null);
  };


  return (
    <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-100 min-h-screen flex flex-col">
        <div className="theme-transition-all container mx-auto p-4 flex-grow">
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">School Event Logistics</h1>

        <div className="flex items-center space-x-2">
            <span className="text-sm dark:text-slate-300">Light</span>
                 <button 
                    className={`theme-toggle ${isDarkMode ? 'dark' : ''}`}
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    <span className="theme-toggle-thumb"></span>
                    <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>
            <span className="text-sm dark:text-slate-300">Dark</span>
        </div>
       
        </div>

         <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            className="input w-full md:w-1/2 lg:w-1/3 mb-2 md:mb-0 md:mr-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
            <select
                className="input w-full md:w-auto"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="All">All Statuses</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
                <option value="Planning">Planning</option>
            </select>
        </div>

      {error && (
        <div className="alert alert-error mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p>{error}</p>
        </div>
      )}

        <div className="card-responsive mb-6">
        <h2 className="text-base sm:text-lg md:text-xl font-medium mb-4">Add New Event</h2>
        
        <div className="form-group mb-2">
          <label className="form-label" htmlFor="name">Event Name</label>
          <input id="name" name="name" type="text" className="input" value={newEvent.name} onChange={handleInputChange}  role="textbox" aria-label="Event Name"/>
        </div>

        <div className="form-group mb-2">
          <label className="form-label" htmlFor="date">Date</label>
          <input id="date" name="date" type="date" className="input" value={newEvent.date} onChange={handleInputChange} role="textbox" aria-label="Event Date"/>
        </div>

        <div className="form-group mb-2">
          <label className="form-label" htmlFor="venue">Venue</label>
          <input id="venue" name="venue" type="text" className="input" value={newEvent.venue} onChange={handleInputChange} role="textbox" aria-label="Event Venue"/>
        </div>

         <div className="form-group mb-2">
          <label className="form-label" htmlFor="status">Status</label>
          <select id="status" name="status" className="input" value={newEvent.status} onChange={handleInputChange} role="listbox" aria-label="Event Status">
            <option value="Planning">Planning</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="input" value={newEvent.description} onChange={handleInputChange} role="textbox" aria-label="Event Description"/>
        </div>
        
        <button onClick={addEvent} className="btn btn-primary mt-4">Add Event</button>
      </div>


      {loading ? (
         <div className="space-y-3">
            <div className="skeleton-text w-1/2"></div>
            <div className="skeleton-text w-full"></div>
            <div className="skeleton-text w-2/3"></div>
            <div className="flex items-center mt-4 gap-2">
                <div className="skeleton-circle w-10 h-10"></div>
                <div className="space-y-2">
                <div className="skeleton-text w-24 h-3"></div>
                <div className="skeleton-text w-32 h-3"></div>
                </div>
            </div>
         </div>
      ) : (
          <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                 <th className="table-header" onClick={() => handleSort('name')}>Name {sortKey === 'name' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                <th className="table-header" onClick={() => handleSort('date')}>Date {sortKey === 'date' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                <th className="table-header" onClick={() => handleSort('venue')}>Venue {sortKey === 'venue' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                <th className="table-header">Description</th>
                <th className="table-header" onClick={() => handleSort('status')}>Status {sortKey === 'status' && (sortOrder === 'asc' ? '▲' : '▼')}</th>
                 <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event) => (
                <tr key={event.id} className={editEventId === event.id ? styles.editingRow : ''}>
                  <td className="table-cell">{
                    editEventId === event.id ? (
                      <input
                        type="text"
                        name="name"
                        value={event.name}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      event.name
                    )
                  }
                </td>
                  <td className="table-cell">
                    {
                    editEventId === event.id ? (
                      <input
                        type="date"
                        name="date"
                        value={event.date}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      event.date
                    )
                  }                  
                </td>
                  <td className="table-cell">{
                    editEventId === event.id ? (
                      <input
                        type="text"
                        name="venue"
                        value={event.venue}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      event.venue
                    )
                  }</td>
                  <td className="table-cell">{
                     editEventId === event.id ? (
                      <textarea
                        name="description"
                        value={event.description}
                        onChange={handleInputChange}
                        className="input"
                      />
                    ) : (
                      event.description
                    )
                  }</td>
                  <td className="table-cell">
                     {
                    editEventId === event.id ? (
                       <select name="status" className="input" value={event.status} onChange={handleInputChange}>
                            <option value="Planning">Planning</option>
                            <option value="Upcoming">Upcoming</option>
                            <option value="Completed">Completed</option>
                        </select>
                    ) : (
                       <span className={`badge ${event.status === 'Upcoming' ? 'badge-info' : event.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                        {event.status}
                      </span>
                    )
                  }
                </td>
                  <td className="table-cell">
                    {
                      editEventId === event.id ?
                      (<> 
                        <button className="btn btn-sm btn-primary mr-2" onClick={updateEvent} role="button">Save</button>
                        <button className="btn btn-sm bg-gray-200 text-gray-800" onClick={() => setEditEventId(null)} role="button">Cancel</button>
                      </>)
                      : 
                      (<> 
                        <button className="btn btn-sm btn-primary mr-2" onClick={() => startEditing(event.id)} role="button">Edit</button>
                        <button className="btn btn-sm bg-red-500 text-white hover:bg-red-600" onClick={() => deleteEvent(event.id)} role="button">Delete</button>
                      </>)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    
     <footer className="text-center text-gray-600 dark:text-slate-400 py-4 border-t border-gray-200 dark:border-slate-700">
        Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
