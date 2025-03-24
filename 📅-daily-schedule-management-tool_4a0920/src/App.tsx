import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, PlusCircle, Edit, Trash2, CheckCircle, XCircle, RotateCcw, Sun, Moon, Search } from 'lucide-react';
import { format, addDays, startOfWeek, isSameDay, isToday, isPast, parseISO } from 'date-fns';


interface EventItem {
  id: string;
  title: string;
  date: string; // ISO string
  type: 'meeting' | 'task' | 'routine';
  description?: string;
}



const App: React.FC = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [newEvent, setNewEvent] = useState<EventItem>({
        id: '',
        title: '',
        date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
        type: 'meeting',
        description: '',
    });
    const [isAdding, setIsAdding] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

      const toggleDarkMode = () => {
          setIsDarkMode(!isDarkMode);
        };


    useEffect(() => {
        const storedEvents = localStorage.getItem('events');
        if (storedEvents) {
            setEvents(JSON.parse(storedEvents));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);

    const weekDates = [];
    let startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    for (let i = 0; i < 7; i++) {
        weekDates.push(addDays(startDate, i));
    }

     const filteredEvents = events.filter((event) => {
        const eventDate = parseISO(event.date);
        return (
          isSameDay(eventDate, selectedDate) &&
            event.title.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });

      filteredEvents.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );


    const handleAddEvent = () => {
        if (newEvent.title.trim() && newEvent.date) {
            if (isEditing && newEvent.id) {
                // Update existing event
                setEvents(events.map(event => event.id === newEvent.id ? newEvent : event));
                setIsEditing(false);
            } else {
                // Add new event
                const newId = Date.now().toString();
                setEvents([...events, { ...newEvent, id: newId }]);
            }

            setNewEvent({
                id: '',
                title: '',
                date: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
                type: 'meeting',
                description: '',
            });
            setIsAdding(false);
        }
    };

    const handleEditEvent = (event: EventItem) => {
        setNewEvent(event);
        setIsAdding(true);
        setIsEditing(true);
    };

    const handleDeleteEvent = (id: string) => {
        setEvents(events.filter(event => event.id !== id));
    };

    const handleDateChange = (date: Date) => {
      setSelectedDate(date);
      setNewEvent(prev => ({
          ...prev,
          date: format(date, "yyyy-MM-dd'T'HH:mm"),
        }));
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-slate-100">
        <div className="container-fluid mx-auto p-4">
          <div className="flex justify-between items-center mb-4">

              <h1 className="text-2xl font-bold">Daily Calendar</h1>



            <div className="flex items-center space-x-2">
                <span className="text-sm dark:text-slate-300">Light</span>
                    <button
                        className="theme-toggle relative inline-flex items-center w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={toggleDarkMode}
                        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                        role="switch"
                        name="themeToggle"
                      >
                        <span
                          className={`
                            inline-block w-4 h-4 rounded-full bg-white shadow-sm transform transition-transform
                            ${isDarkMode ? 'translate-x-5' : 'translate-x-1'}
                          `}
                        ></span>
                    </button>
                    <span className="text-sm dark:text-slate-300">Dark</span>
              </div>

          </div>

          <div className="flex items-center justify-between mb-4">
           <div className="flex items-center">
                <button
                onClick={() => setCurrentDate(new Date())}
                className="btn bg-primary-500 text-white hover:bg-primary-600 mr-2"
                >
                Today
                </button>


              </div>



            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <input
                type="text"
                placeholder="Search events..."
                className="input pl-8 pr-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm((e.target as HTMLInputElement).value)}
                />
            </div>
              </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
                {weekDates.map(date => (
                    <div
                        key={date.toISOString()}
                        className={`p-2 text-center rounded-lg cursor-pointer transition-colors duration-200 ${isSameDay(date, selectedDate) ? 'bg-primary-500 text-white' : isToday(date) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                         onClick={() => handleDateChange(date)}
                    >
                        <div className="text-xs font-medium">{format(date, 'EEE')}</div>
                        <div className={`text-lg ${isPast(date) && !isToday(date) ? 'text-gray-400 dark:text-gray-500' : ''}`}>{format(date, 'd')}</div>
                    </div>
                ))}
            </div>


            <div className="flex justify-between items-center mb-4">
                 <h2 className="text-xl font-semibold">Events for {format(selectedDate, 'PPP')}</h2>

              <button
                onClick={() => {
                  setIsAdding(true);
                  setIsEditing(false);
                    setNewEvent({
                        id: '',
                        title: '',
                        date: format(selectedDate, "yyyy-MM-dd'T'HH:mm"),
                        type: 'meeting',
                        description: '',
                    });
                }}
                className="btn bg-primary-500 text-white hover:bg-primary-600"
            >
                <PlusCircle className="h-4 w-4 mr-2" /> Add Event
            </button>
           </div>

          <div className="space-y-4">
                {filteredEvents.length === 0 && <p className="text-gray-500 dark:text-slate-400">No events for this day.</p>}

                {filteredEvents.map((event) => (
                <div key={event.id} className="card p-4 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-slate-400">
                            {format(parseISO(event.date), 'p')}
                            {event.type && (
                            <span className="ml-2 badge badge-info capitalize">{event.type}</span>
                            )}
                         </p>

                         {event.description && (
                        <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{event.description}</p>
                        )}
                     </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleEditEvent(event)} className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600">
                            <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="btn btn-sm bg-red-500 text-white hover:bg-red-600">
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                ))}
          </div>



          {isAdding && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
              <div className="modal-content bg-white dark:bg-slate-700 p-6 rounded-lg shadow-lg w-full md:w-1/2 lg:w-1/3">
                <div className="modal-header">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{isEditing ? 'Edit Event' : 'Add Event'}</h3>
                  <button className="text-gray-400 hover:text-gray-500" onClick={() => setIsAdding(false)}>
                   <XCircle className="h-6 w-6"/>
                </button>
                </div>
                <div className="mt-4 space-y-4">
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="input"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: (e.target as HTMLInputElement).value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Date and Time</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: (e.target as HTMLInputElement).value })}
                    />
                  </div>
                  <div className="form-group">
                        <label className="form-label">Type</label>
                        <select
                        className="input"
                        value={newEvent.type}
                        onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as 'meeting' | 'task' | 'routine' })}
                        >
                        <option value="meeting">Meeting</option>
                        <option value="task">Task</option>
                        <option value="routine">Routine</option>
                        </select>
                    </div>
                  <div className="form-group">
                    <label className="form-label">Description (Optional)</label>
                    <textarea
                      className="input"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: (e.target as HTMLTextAreaElement).value })}
                    />
                  </div>
                </div>
                <div className="modal-footer flex justify-end space-x-2 mt-4">
                    <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={() => setIsAdding(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={handleAddEvent}>Save</button>
                </div>
              </div>
            </div>
          )}

            <footer className="text-center p-4 mt-8 text-gray-500 dark:text-slate-400">
                Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
            </footer>

        </div>
        </div>
    );
};

export default App;
