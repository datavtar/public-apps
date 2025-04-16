import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { 
  UserPlus, Edit, Trash2, Filter, Search, ArrowUp, ArrowDown, Sun, Moon, X as IconX, Save, 
  Users, Activity, CalendarCheck, Handshake, Ban, Building, Mail, Phone, Edit3, Eye
} from 'lucide-react';
import styles from './styles/styles.module.css';

// --- Types and Interfaces ---
type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Tour Scheduled' | 'Closed Won' | 'Closed Lost';
type LeadSource = 'Website' | 'Referral' | 'Walk-in' | 'Social Media' | 'Event' | 'Other';
type SortField = 'name' | 'status' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

interface Filters {
  status: LeadStatus | '';
  source: LeadSource | '';
}

interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

interface AppState {
  leads: Lead[];
  searchTerm: string;
  filters: Filters;
  sortConfig: SortConfig;
  isModalOpen: boolean;
  currentLead: Lead | null; // For editing
  isDarkMode: boolean;
  activeStatusChartIndex: number;
  activeSourceChartIndex: number;
}

// --- Constants ---
const LEAD_STATUSES: LeadStatus[] = ['New', 'Contacted', 'Interested', 'Tour Scheduled', 'Closed Won', 'Closed Lost'];
const LEAD_SOURCES: LeadSource[] = ['Website', 'Referral', 'Walk-in', 'Social Media', 'Event', 'Other'];
const LOCAL_STORAGE_LEADS_KEY = 'coworkingLeads';
const LOCAL_STORAGE_THEME_KEY = 'darkMode';

const STATUS_COLORS: { [key in LeadStatus]: string } = {
  'New': '#3b82f6', // blue-500
  'Contacted': '#f97316', // orange-500
  'Interested': '#eab308', // yellow-500
  'Tour Scheduled': '#8b5cf6', // violet-500
  'Closed Won': '#22c55e', // green-500
  'Closed Lost': '#ef4444', // red-500
};

const SOURCE_COLORS: { [key in LeadSource]: string } = {
  'Website': '#14b8a6', // teal-500
  'Referral': '#6366f1', // indigo-500
  'Walk-in': '#d946ef', // fuchsia-500
  'Social Media': '#ec4899', // pink-500
  'Event': '#0ea5e9', // sky-500
  'Other': '#6b7280', // gray-500
};

// --- Helper Functions ---
const getInitialLeads = (): Lead[] => {
  try {
    const savedLeads = localStorage.getItem(LOCAL_STORAGE_LEADS_KEY);
    if (savedLeads) {
      return JSON.parse(savedLeads);
    }
  } catch (error) {
    console.error('Error reading leads from local storage:', error);
  }
  // Default sample data if local storage is empty or invalid
  return [
    {
      id: crypto.randomUUID(), name: 'Alice Wonderland', email: 'alice@example.com', phone: '123-456-7890',
      source: 'Website', status: 'New', notes: 'Interested in private office.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(), name: 'Bob The Builder', email: 'bob@example.com', phone: '987-654-3210',
      source: 'Referral', status: 'Contacted', notes: 'Needs flexible desk.', createdAt: new Date(Date.now() - 86400000).toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: crypto.randomUUID(), name: 'Charlie Chaplin', email: 'charlie@example.com', phone: '555-123-4567',
      source: 'Walk-in', status: 'Tour Scheduled', notes: 'Scheduled tour for next Tuesday.', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
  ];
};

const getInitialTheme = (): boolean => {
  try {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch (error) {
    console.error('Error reading theme from local storage:', error);
    return false; // Default to light mode on error
  }
};

// --- Main App Component ---
const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => ({
    leads: getInitialLeads(),
    searchTerm: '',
    filters: { status: '', source: '' },
    sortConfig: { field: 'createdAt', direction: 'desc' },
    isModalOpen: false,
    currentLead: null,
    isDarkMode: getInitialTheme(),
    activeStatusChartIndex: -1,
    activeSourceChartIndex: -1,
  }));

  // --- Effects ---
  // Persist leads to local storage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_LEADS_KEY, JSON.stringify(state.leads));
    } catch (error) {
      console.error('Error saving leads to local storage:', error);
      // Handle potential storage errors (e.g., quota exceeded)
    }
  }, [state.leads]);

  // Apply dark mode class and persist theme
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, 'false');
    }
  }, [state.isDarkMode]);

  // Handle Esc key for modal closing
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && state.isModalOpen) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [state.isModalOpen]); // Re-attach if modal state changes

  // --- Event Handlers & Logic ---
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, searchTerm: event.target.value }));
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;
    setState(prev => ({ ...prev, filters: { ...prev.filters, [name]: value } }));
  };

  const handleSort = (field: SortField) => {
    setState(prev => {
      const direction: SortDirection = prev.sortConfig.field === field && prev.sortConfig.direction === 'asc' ? 'desc' : 'asc';
      return { ...prev, sortConfig: { field, direction } };
    });
  };

  const toggleTheme = () => {
    setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }));
  };

  const openModal = (lead: Lead | null = null) => {
    document.body.classList.add('modal-open');
    setState(prev => ({ ...prev, isModalOpen: true, currentLead: lead }));
  };

  const closeModal = useCallback(() => {
    document.body.classList.remove('modal-open');
    setState(prev => ({ ...prev, isModalOpen: false, currentLead: null }));
  }, []);

  const handleLeadSubmit = (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    setState(prev => {
      let updatedLeads;
      if (prev.currentLead) {
        // Update existing lead
        updatedLeads = prev.leads.map(l =>
          l.id === prev.currentLead?.id ? { ...l, ...leadData, updatedAt: now } : l
        );
      } else {
        // Add new lead
        const newLead: Lead = {
          ...leadData,
          id: crypto.randomUUID(),
          createdAt: now,
          updatedAt: now,
        };
        updatedLeads = [...prev.leads, newLead];
      }
      return { ...prev, leads: updatedLeads };
    });
    closeModal();
  };

  const handleDeleteLead = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      setState(prev => ({
        ...prev,
        leads: prev.leads.filter(lead => lead.id !== id)
      }));
    }
  };

  // --- Derived State / Memoized Values ---
  const filteredAndSortedLeads = useMemo(() => {
    return state.leads
      .filter(lead => {
        const searchTermLower = state.searchTerm.toLowerCase();
        const matchesSearch = !state.searchTerm ||
          lead.name.toLowerCase().includes(searchTermLower) ||
          lead.email.toLowerCase().includes(searchTermLower) ||
          lead.phone.toLowerCase().includes(searchTermLower);

        const matchesStatus = !state.filters.status || lead.status === state.filters.status;
        const matchesSource = !state.filters.source || lead.source === state.filters.source;

        return matchesSearch && matchesStatus && matchesSource;
      })
      .sort((a, b) => {
        const field = state.sortConfig.field;
        const direction = state.sortConfig.direction === 'asc' ? 1 : -1;

        const valueA = a[field];
        const valueB = b[field];

        if (valueA < valueB) return -1 * direction;
        if (valueA > valueB) return 1 * direction;
        return 0;
      });
  }, [state.leads, state.searchTerm, state.filters, state.sortConfig]);

  // --- Chart Data ---
  const statusChartData = useMemo(() => {
    const counts = LEAD_STATUSES.reduce((acc, status) => {
      acc[status] = 0;
      return acc;
    }, {} as { [key in LeadStatus]: number });

    state.leads.forEach(lead => {
      if (counts[lead.status] !== undefined) {
          counts[lead.status]++;
      }
    });

    return LEAD_STATUSES.map(status => ({ name: status, value: counts[status] }));
  }, [state.leads]);

  const sourceChartData = useMemo(() => {
    const counts = LEAD_SOURCES.reduce((acc, source) => {
      acc[source] = 0;
      return acc;
    }, {} as { [key in LeadSource]: number });

    state.leads.forEach(lead => {
       if (counts[lead.source] !== undefined) {
          counts[lead.source]++;
       }
    });

    return LEAD_SOURCES.map(source => ({ name: source, value: counts[source] }));
  }, [state.leads]);

  // --- Pie Chart Active Segment Rendering ---
  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
      <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xs sm:text-sm font-semibold">
          {payload.name}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="dark:fill-slate-300 text-xs">{`${value} Lead${value !== 1 ? 's' : ''}`}</text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="dark:fill-slate-400 text-xs">
          {`(Rate ${(percent * 100).toFixed(2)}%)`}
        </text>
      </g>
    );
  };

  const onPieEnter = useCallback((_: any, index: number, chartType: 'status' | 'source') => {
    if (chartType === 'status') {
      setState(prev => ({ ...prev, activeStatusChartIndex: index }));
    } else {
      setState(prev => ({ ...prev, activeSourceChartIndex: index }));
    }
  }, []);

  // --- Render --- 
  return (
    <div className={`min-h-screen flex flex-col theme-transition-all ${state.isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-[var(--z-sticky)] theme-transition-bg">
        <div className="container-wide mx-auto px-4 py-3 flex-between">
          <h1 className="text-xl sm:text-2xl font-bold text-primary-600 dark:text-primary-400 flex items-center gap-2">
            <Building size={24} /> Coworking CRM
          </h1>
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => openModal()}
              className="btn btn-primary btn-sm sm:btn-responsive flex items-center gap-1 sm:gap-2"
              aria-label="Add New Lead"
              name="add-lead-button"
            >
              <UserPlus size={16} />
              <span className="hidden sm:inline">Add Lead</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 theme-transition-bg"
              aria-label={state.isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              name="theme-toggle-button"
            >
              {state.isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow bg-gray-50 dark:bg-slate-900 p-4 sm:p-6 lg:p-8 theme-transition-bg">
        <div className="container-wide mx-auto">

          {/* Dashboard/Stats Section */}
          <section aria-labelledby="dashboard-title" className="mb-6 sm:mb-8">
            <h2 id="dashboard-title" className="text-lg sm:text-xl font-semibold mb-4 dark:text-slate-200">Dashboard Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Leads Card */}
              <div className="stat-card theme-transition">
                <div className="flex-between">
                  <span className="stat-title">Total Leads</span>
                  <Users size={20} className="text-gray-400" />
                </div>
                <div className="stat-value">{state.leads.length}</div>
              </div>

              {/* Leads by Status Chart */}
              <div className="stat-card theme-transition col-span-1 sm:col-span-2 lg:col-span-2 min-h-[250px] sm:min-h-[300px]">
                <h3 className="stat-title mb-2">Leads by Status</h3>
                 {state.leads.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          activeIndex={state.activeStatusChartIndex}
                          activeShape={renderActiveShape}
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          dataKey="value"
                          onMouseEnter={(data, index) => onPieEnter(data, index, 'status')}
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-status-${index}`} fill={STATUS_COLORS[entry.name as LeadStatus] ?? '#cccccc'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: state.isDarkMode ? '#334155' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }} itemStyle={{ color: state.isDarkMode ? '#e2e8f0' : '#1f2937'}}/>
                      </PieChart>
                    </ResponsiveContainer>
                 ) : (
                    <div className="flex-center h-full text-gray-500 dark:text-slate-400">No lead data available for status chart.</div>
                 )}
              </div>
               {/* Leads by Source Chart */}
               <div className="stat-card theme-transition min-h-[250px] sm:min-h-[300px]">
                <h3 className="stat-title mb-2">Leads by Source</h3>
                 {state.leads.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            activeIndex={state.activeSourceChartIndex}
                            activeShape={renderActiveShape}
                            data={sourceChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            dataKey="value"
                            onMouseEnter={(data, index) => onPieEnter(data, index, 'source')}
                          >
                          {sourceChartData.map((entry, index) => (
                            <Cell key={`cell-source-${index}`} fill={SOURCE_COLORS[entry.name as LeadSource] ?? '#cccccc'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: state.isDarkMode ? '#334155' : '#fff', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }} itemStyle={{ color: state.isDarkMode ? '#e2e8f0' : '#1f2937'}}/>
                      </PieChart>
                    </ResponsiveContainer>
                 ) : (
                   <div className="flex-center h-full text-gray-500 dark:text-slate-400">No lead data available for source chart.</div>
                 )}
              </div>
            </div>
          </section>

          {/* Leads Table Section */}
          <section aria-labelledby="leads-table-title">
            <div className="card theme-transition">
              <h2 id="leads-table-title" className="text-lg sm:text-xl font-semibold mb-4 dark:text-slate-200">Manage Leads</h2>

              {/* Filters and Search */}
              <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label htmlFor="search" className="sr-only">Search</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="search"
                      name="search"
                      className="input pl-10 input-responsive"
                      placeholder="Search by name, email, phone..."
                      value={state.searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
                  <select
                    id="statusFilter"
                    name="status"
                    className="input input-responsive appearance-none"
                    value={state.filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    {LEAD_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="sourceFilter" className="sr-only">Filter by Source</label>
                  <select
                    id="sourceFilter"
                    name="source"
                    className="input input-responsive appearance-none"
                    value={state.filters.source}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Sources</option>
                    {LEAD_SOURCES.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                 <button
                    onClick={() => setState(prev => ({ ...prev, searchTerm: '', filters: { status: '', source: '' } }))}
                    className="btn bg-gray-200 dark:bg-slate-600 dark:text-slate-200 text-gray-700 hover:bg-gray-300 dark:hover:bg-slate-500 btn-sm sm:btn-responsive flex items-center justify-center gap-2 self-start mt-1 sm:mt-0 h-9 sm:h-10 md:h-auto"
                    aria-label="Clear Filters and Search"
                  >
                    <Filter size={16} /> Clear
                  </button>
              </div>

              {/* Leads Table */}
              <div className="table-container theme-transition">
                <table className="table theme-transition">
                  <thead className="table-header theme-transition">
                    <tr>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6">
                        <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100">
                          Name
                          {state.sortConfig.field === 'name' && (
                            state.sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                        </button>
                      </th>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6 hidden md:table-cell">Email</th>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6 hidden lg:table-cell">Phone</th>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6 hidden lg:table-cell">Source</th>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6">
                         <button onClick={() => handleSort('status')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100">
                           Status
                           {state.sortConfig.field === 'status' && (
                            state.sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                         </button>
                      </th>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6 hidden sm:table-cell">
                         <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-slate-100">
                          Date Added
                          {state.sortConfig.field === 'createdAt' && (
                            state.sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                          )}
                         </button>
                      </th>
                      <th scope="col" className="table-cell px-4 py-3 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700 theme-transition-bg">
                    {filteredAndSortedLeads.length > 0 ? (
                      filteredAndSortedLeads.map(lead => (
                        <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 theme-transition-bg">
                          <td className="table-cell px-4 py-3 sm:px-6 font-medium text-gray-900 dark:text-white whitespace-nowrap">{lead.name}</td>
                          <td className="table-cell px-4 py-3 sm:px-6 text-gray-500 dark:text-slate-400 hidden md:table-cell whitespace-nowrap">{lead.email}</td>
                          <td className="table-cell px-4 py-3 sm:px-6 text-gray-500 dark:text-slate-400 hidden lg:table-cell whitespace-nowrap">{lead.phone}</td>
                          <td className="table-cell px-4 py-3 sm:px-6 hidden lg:table-cell">
                             <span
                                className={`badge text-xs`} 
                                style={ { backgroundColor: `${SOURCE_COLORS[lead.source]}30`, color: state.isDarkMode ? `${SOURCE_COLORS[lead.source]}c0` : SOURCE_COLORS[lead.source] }}
                              >
                                  {lead.source}
                              </span>
                          </td>
                          <td className="table-cell px-4 py-3 sm:px-6">
                            <span
                              className={`badge text-xs`}
                              style={{ backgroundColor: `${STATUS_COLORS[lead.status]}30`, color: state.isDarkMode ? `${STATUS_COLORS[lead.status]}c0` : STATUS_COLORS[lead.status] }}
                            >
                              {lead.status}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-3 sm:px-6 text-gray-500 dark:text-slate-400 hidden sm:table-cell whitespace-nowrap">
                             {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                          <td className="table-cell px-4 py-3 sm:px-6 text-sm font-medium whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal(lead)}
                                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 p-1 rounded hover:bg-primary-100 dark:hover:bg-slate-600"
                                aria-label={`Edit lead ${lead.name}`}
                                name={`edit-lead-${lead.id}`}
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 p-1 rounded hover:bg-red-100 dark:hover:bg-slate-600"
                                aria-label={`Delete lead ${lead.name}`}
                                name={`delete-lead-${lead.id}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-500 dark:text-slate-400">
                          No leads found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-slate-800 py-4 text-center text-sm text-gray-600 dark:text-slate-400 theme-transition-bg">
        Copyright © {new Date().getFullYear()} Datavtar Private Limited. All rights reserved.
      </footer>

      {/* Modal for Add/Edit Lead */}
      {state.isModalOpen && (
        <div
          className="modal-backdrop theme-transition-all"
          onClick={closeModal} // Close on backdrop click
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-modal-title"
        >
          <div
            className="modal-content theme-transition-all w-full max-w-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <LeadForm
              lead={state.currentLead}
              onSubmit={handleLeadSubmit}
              onCancel={closeModal}
              isDarkMode={state.isDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// --- Lead Form Component (within App.tsx) ---
interface LeadFormProps {
  lead: Lead | null;
  onSubmit: (leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isDarkMode: boolean;
}

const LeadForm: React.FC<LeadFormProps> = ({ lead, onSubmit, onCancel, isDarkMode }) => {
  const [formData, setFormData] = useState<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>({
    name: lead?.name ?? '',
    email: lead?.email ?? '',
    phone: lead?.phone ?? '',
    source: lead?.source ?? 'Website',
    status: lead?.status ?? 'New',
    notes: lead?.notes ?? '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email address is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    // Add more validation as needed (e.g., phone format)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="modal-header">
        <h3 id="lead-modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
          {lead ? 'Edit Lead' : 'Add New Lead'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-600"
          aria-label="Close modal"
          name="close-modal-button"
        >
          <IconX size={20} />
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Name Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="name">Full Name</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={`input ${errors.name ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
            value={formData.name}
            onChange={handleChange}
            aria-describedby={errors.name ? "name-error" : undefined}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p id="name-error" className="form-error">{errors.name}</p>}
        </div>

        {/* Email & Phone (side-by-side on larger screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`input ${errors.email ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={formData.email}
              onChange={handleChange}
              aria-describedby={errors.email ? "email-error" : undefined}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p id="email-error" className="form-error">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className={`input ${errors.phone ? 'border-red-500 dark:border-red-400 focus:border-red-500 focus:ring-red-500' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && <p id="phone-error" className="form-error">{errors.phone}</p>}
          </div>
        </div>

        {/* Source & Status (side-by-side on larger screens) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label" htmlFor="source">Lead Source</label>
            <select
              id="source"
              name="source"
              className="input appearance-none"
              value={formData.source}
              onChange={handleChange}
            >
              {LEAD_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="status">Lead Status</label>
            <select
              id="status"
              name="status"
              className="input appearance-none"
              value={formData.status}
              onChange={handleChange}
            >
              {LEAD_STATUSES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes Field */}
        <div className="form-group">
          <label className="form-label" htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="input"
            value={formData.notes}
            onChange={handleChange}
          ></textarea>
        </div>
      </div>

      <div className="modal-footer">
        <button
          type="button"
          onClick={onCancel}
          className="btn bg-gray-200 dark:bg-slate-600 dark:text-slate-200 text-gray-700 hover:bg-gray-300 dark:hover:bg-slate-500 theme-transition-bg"
          name="cancel-modal-button"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary flex items-center gap-2"
          name="save-lead-button"
        >
          <Save size={16}/> {lead ? 'Save Changes' : 'Add Lead'}
        </button>
      </div>
    </form>
  );
};

export default App;
