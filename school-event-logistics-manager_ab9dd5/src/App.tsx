import React, { useState, useEffect } from 'react';
import styles from './styles/styles.module.css';

interface EventItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  description: string;
  status: 'Planned' | 'Ongoing' | 'Completed';
}

const App: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Form states
  const [eventName, setEventName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [eventVenue, setEventVenue] = useState<string>('');
  const [eventDescription, setEventDescription] = useState<string>('');
  const [editEventId, setEditEventId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

  // For simplicity, we use local storage as our "database"
    useEffect(() => {
        if (typeof window !== 'undefined') {
          const savedMode = localStorage.getItem('darkMode');
          setIsDarkMode(savedMode === 'true' || 
            (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches));
        }

      
    setLoading(true);
    try {
      const savedEvents = localStorage.getItem('events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (err) {
      setError('Failed to load events.');
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (events.length > 0) {
      localStorage.setItem('events', JSON.stringify(events));
    }
  }, [events]);

  const addEvent = () => {
    if (!eventName || !eventDate || !eventVenue) {
      alert('Please fill in all required fields.');
      return;
    }

    const newEvent: EventItem = {
      id: Date.now().toString(),
      name: eventName,
      date: eventDate,
      venue: eventVenue,
      description: eventDescription,
      status: 'Planned',
    };

    setEvents([...events, newEvent]);
    resetForm();
  };

    const handleEdit = (id: string) => {
        const eventToEdit = events.find((event) => event.id === id);
        if (eventToEdit) {
            setEditEventId(id);
            setEventName(eventToEdit.name);
            setEventDate(eventToEdit.date);
            setEventVenue(eventToEdit.venue);
            setEventDescription(eventToEdit.description);
        }
    };

    const updateEvent = () => {
      if (!eventName || !eventDate || !eventVenue) {
          alert('Please fill in all required fields.');
            return;
        }
        if (editEventId) {

            const updatedEvents = events.map((event) =>
                event.id === editEventId
                    ? { ...event, name: eventName, date: eventDate, venue: eventVenue, description: eventDescription }
                    : event
            );
            setEvents(updatedEvents);
            setEditEventId(null);
            resetForm();
        }
    };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
  };

    const changeEventStatus = (id: string, newStatus: 'Planned' | 'Ongoing' | 'Completed') => {
        const updatedEvents = events.map(event => {
            if (event.id === id) {
                return { ...event, status: newStatus };
            }
            return event;
        });
        setEvents(updatedEvents);
    };

  const resetForm = () => {
    setEventName('');
    setEventDate('');
    setEventVenue('');
    setEventDescription('');
  };

    const filteredEvents = events.filter(event => {
        return event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
               event.description.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const sortedEvents = [...filteredEvents].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="bg-gray-100 dark:bg-slate-800 min-h-screen theme-transition-all">
         <div className="container-fluid mx-auto px-4 py-8">

            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">School Event Planner</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm dark:text-slate-300">Light</span>
                    <button
                        className={styles.themeToggle}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        <span className={styles.themeToggleThumb}></span>
                        <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
                    </button>
                    <span className="text-sm dark:text-slate-300">Dark</span>
                </div>
            </div>

            {/* Add/Edit Event Form */}
            <div className="card-responsive mb-6 bg-white dark:bg-gray-700 p-4 md:p-6 rounded-lg shadow">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-white">{editEventId ? 'Edit Event' : 'Add Event'}</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="form-group">
            <label className="form-label" htmlFor="eventName">Event Name:</label>
            <input id="eventName" type="text" className="input" value={eventName} onChange={(e) => setEventName(e.target.value)}  role='textbox' name='eventName'/>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="eventDate">Date:</label>
            <input id="eventDate" type="date" className="input" value={eventDate} onChange={(e) => setEventDate(e.target.value)} role='textbox' name='eventDate'/>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="eventVenue">Venue:</label>
            <input id="eventVenue" type="text" className="input" value={eventVenue} onChange={(e) => setEventVenue(e.target.value)} role='textbox' name='eventVenue'/>
          </div>

          <div className="form-group md:col-span-2">
            <label className="form-label" htmlFor="eventDescription">Description:</label>
            <textarea id="eventDescription" className="input" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} role='textbox' name='eventDescription'/>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 mr-2" onClick={resetForm} role='button' name='cancelButton'>Cancel</button>
          <button className={`btn ${editEventId ? 'btn-primary' : 'bg-green-500 hover:bg-green-600 text-white'}`} onClick={editEventId ? updateEvent : addEvent} role='button' name='submitButton'>
            {editEventId ? 'Update Event' : 'Add Event'}
          </button>
        </div>
      </div>

             {/* Search Input */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search for events..."
                    className="input w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

      {/* Event List */}
      {loading && <div className="text-center">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}

      {!loading && !error && (
       <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Date</th>
                <th className="table-header">Venue</th>
                <th className="table-header">Status</th>
                <th className="table-header">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {sortedEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="table-cell" role='cell' name='eventNameCell'>{event.name}</td>
                    <td className="table-cell" role='cell' name='eventDateCell'>{event.date}</td>
                    <td className="table-cell" role='cell' name='eventVenueCell'>{event.venue}</td>
                    <td className="table-cell" role='cell' name='eventStatusCell'>
                        <span className={`badge ${event.status === 'Planned' ? 'badge-info' : event.status === 'Ongoing' ? 'badge-warning' : 'badge-success'}`}>
                            {event.status}
                        </span>
                    </td>
                  <td className="table-cell" role='cell' name='eventActionsCell'>
                    <select
                        className="mr-2 border rounded p-1 dark:bg-gray-700 dark:text-white"
                        value={event.status}
                        onChange={(e) => changeEventStatus(event.id, e.target.value as 'Planned' | 'Ongoing' | 'Completed')}
                    >
                        <option value="Planned">Planned</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button className="btn btn-sm btn-primary mr-2" onClick={() => handleEdit(event.id)} role='button' name='editButton'>Edit</button>
                    <button className="btn btn-sm bg-red-500 hover:bg-red-700 text-white" onClick={() => deleteEvent(event.id)} role='button' name='deleteButton'>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

       <footer className="text-center text-gray-500 dark:text-gray-400 mt-8 py-4 border-t border-gray-200 dark:border-gray-700">
                Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
            </footer>
    </div>
    </div>
  );
};

export default App;
