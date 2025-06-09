import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Calendar, 
  Github, 
  Clock, 
  Bell, 
  Settings, 
  Plus, 
  Trash2, 
  Edit, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  Moon,
  Sun,
  User,
  LogOut,
  Target,
  TrendingUp
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Types and Interfaces
interface GitHubTask {
  id: string;
  url: string;
  title: string;
  description: string;
  labels: string[];
  milestone: string;
  assignee: string;
  createdDate: string;
  updatedDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
  taskType: 'bug' | 'feature' | 'enhancement' | 'documentation' | 'review' | 'other';
}

interface CalendarEvent {
  id: string;
  taskId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reminders: number[];
  location: string;
  color: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  googleCalendarLink?: string;
}

interface WorkSettings {
  workStartTime: string;
  workEndTime: string;
  timezone: string;
  defaultTaskDuration: number;
  defaultReminders: number[];
  workDays: string[];
  breakDuration: number;
  theme: 'light' | 'dark';
}

interface TaskTemplate {
  id: string;
  name: string;
  taskType: string;
  defaultDuration: number;
  defaultReminders: number[];
  color: string;
  description: string;
}

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // Main state
  const [activeTab, setActiveTab] = useState<'scheduler' | 'calendar' | 'analytics' | 'settings'>('scheduler');
  const [githubUrl, setGithubUrl] = useState<string>('');
  const [extractedTask, setExtractedTask] = useState<GitHubTask | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [workSettings, setWorkSettings] = useState<WorkSettings>({
    workStartTime: '09:00',
    workEndTime: '17:00',
    timezone: 'UTC',
    defaultTaskDuration: 2,
    defaultReminders: [15, 60],
    workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    breakDuration: 15,
    theme: 'light'
  });

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [showEventForm, setShowEventForm] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState<string>('');
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '11:00',
    reminders: [15],
    location: '',
    color: '#3B82F6',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data when state changes
  useEffect(() => {
    saveData();
  }, [calendarEvents, taskTemplates, workSettings]);

  // Apply theme
  useEffect(() => {
    if (workSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [workSettings.theme]);

  const loadData = () => {
    try {
      const savedEvents = localStorage.getItem('githubScheduler_events');
      const savedTemplates = localStorage.getItem('githubScheduler_templates');
      const savedSettings = localStorage.getItem('githubScheduler_settings');

      if (savedEvents) {
        setCalendarEvents(JSON.parse(savedEvents));
      }

      if (savedTemplates) {
        setTaskTemplates(JSON.parse(savedTemplates));
      } else {
        // Set default templates
        const defaultTemplates: TaskTemplate[] = [
          {
            id: '1',
            name: 'Bug Fix',
            taskType: 'bug',
            defaultDuration: 2,
            defaultReminders: [15, 60],
            color: '#EF4444',
            description: 'Time allocated for bug fixing and testing'
          },
          {
            id: '2',
            name: 'Feature Development',
            taskType: 'feature',
            defaultDuration: 4,
            defaultReminders: [30, 120],
            color: '#10B981',
            description: 'Development of new features'
          },
          {
            id: '3',
            name: 'Code Review',
            taskType: 'review',
            defaultDuration: 1,
            defaultReminders: [15],
            color: '#8B5CF6',
            description: 'Review and feedback on code changes'
          }
        ];
        setTaskTemplates(defaultTemplates);
      }

      if (savedSettings) {
        setWorkSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = () => {
    try {
      localStorage.setItem('githubScheduler_events', JSON.stringify(calendarEvents));
      localStorage.setItem('githubScheduler_templates', JSON.stringify(taskTemplates));
      localStorage.setItem('githubScheduler_settings', JSON.stringify(workSettings));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const validateGitHubUrl = (url: string): boolean => {
    const githubPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/(issues|pull)\/\d+$/;
    return githubPattern.test(url);
  };

  const extractGitHubContent = async () => {
    if (!githubUrl.trim()) {
      setError('Please enter a GitHub URL');
      return;
    }

    if (!validateGitHubUrl(githubUrl)) {
      setError('Please enter a valid GitHub issue or pull request URL');
      return;
    }

    setError(null);
    setResult(null);

    const prompt = `Analyze this GitHub URL and extract task information. Return JSON with the following fields:
    {
      "title": "extracted title",
      "description": "extracted description or summary",
      "labels": ["array", "of", "labels"],
      "milestone": "milestone name if any",
      "assignee": "assignee name if any",
      "priority": "low|medium|high|urgent based on labels or content",
      "estimatedHours": number (estimate based on complexity),
      "taskType": "bug|feature|enhancement|documentation|review|other based on content and labels"
    }

    GitHub URL: ${githubUrl}`;

    try {
      aiLayerRef.current?.sendToAI(prompt);
    } catch (error) {
      setError('Failed to process GitHub URL');
    }
  };

  const handleAIResult = (aiResult: string) => {
    try {
      const parsed = JSON.parse(aiResult);
      const task: GitHubTask = {
        id: Date.now().toString(),
        url: githubUrl,
        title: parsed.title || 'Untitled Task',
        description: parsed.description || '',
        labels: parsed.labels || [],
        milestone: parsed.milestone || '',
        assignee: parsed.assignee || '',
        createdDate: new Date().toISOString(),
        updatedDate: new Date().toISOString(),
        priority: parsed.priority || 'medium',
        estimatedHours: parsed.estimatedHours || 2,
        taskType: parsed.taskType || 'other'
      };

      setExtractedTask(task);
      
      // Pre-fill event form with extracted data
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + (task.estimatedHours * 60 * 60 * 1000));
      
      setEventForm({
        title: task.title,
        description: task.description,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        startTime: workSettings.workStartTime,
        endTime: new Date(new Date(`2000-01-01T${workSettings.workStartTime}`).getTime() + (task.estimatedHours * 60 * 60 * 1000)).toTimeString().slice(0, 5),
        reminders: workSettings.defaultReminders,
        location: 'Development Environment',
        color: getTaskTypeColor(task.taskType),
        priority: task.priority
      });

      setShowEventForm(true);
      setResult('Task extracted successfully!');
    } catch (error) {
      setError('Failed to parse AI response. Please try again.');
    }
  };

  const getTaskTypeColor = (taskType: string): string => {
    const colors: { [key: string]: string } = {
      bug: '#EF4444',
      feature: '#10B981',
      enhancement: '#F59E0B',
      documentation: '#6B7280',
      review: '#8B5CF6',
      other: '#3B82F6'
    };
    return colors[taskType] || '#3B82F6';
  };

  const createCalendarEvent = () => {
    if (!eventForm.title.trim()) {
      setError('Event title is required');
      return;
    }

    const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime}`);
    const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime}`);

    if (endDateTime <= startDateTime) {
      setError('End time must be after start time');
      return;
    }

    const newEvent: CalendarEvent = {
      id: editingEvent?.id || Date.now().toString(),
      taskId: extractedTask?.id || '',
      title: eventForm.title,
      description: eventForm.description,
      startDate: eventForm.startDate,
      endDate: eventForm.endDate,
      startTime: eventForm.startTime,
      endTime: eventForm.endTime,
      reminders: eventForm.reminders,
      location: eventForm.location,
      color: eventForm.color,
      status: 'scheduled',
      createdAt: editingEvent?.createdAt || new Date().toISOString(),
      googleCalendarLink: generateGoogleCalendarLink()
    };

    if (editingEvent) {
      setCalendarEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? newEvent : event
      ));
    } else {
      setCalendarEvents(prev => [...prev, newEvent]);
    }

    resetForm();
    setResult(`Calendar event ${editingEvent ? 'updated' : 'created'} successfully!`);
  };

  const generateGoogleCalendarLink = (): string => {
    const startDateTime = new Date(`${eventForm.startDate}T${eventForm.startTime}`);
    const endDateTime = new Date(`${eventForm.endDate}T${eventForm.endTime}`);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: eventForm.title,
      dates: `${formatDate(startDateTime)}/${formatDate(endDateTime)}`,
      details: eventForm.description,
      location: eventForm.location
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const resetForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setExtractedTask(null);
    setGithubUrl('');
    setEventForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '09:00',
      endTime: '11:00',
      reminders: [15],
      location: '',
      color: '#3B82F6',
      priority: 'medium'
    });
  };

  const editEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      reminders: event.reminders,
      location: event.location,
      color: event.color,
      priority: 'medium'
    });
    setShowEventForm(true);
  };

  const deleteEvent = (eventId: string) => {
    setConfirmMessage('Are you sure you want to delete this event?');
    setConfirmAction(() => () => {
      setCalendarEvents(prev => prev.filter(event => event.id !== eventId));
      setShowConfirmDialog(false);
      setResult('Event deleted successfully!');
    });
    setShowConfirmDialog(true);
  };

  const updateEventStatus = (eventId: string, status: CalendarEvent['status']) => {
    setCalendarEvents(prev => prev.map(event =>
      event.id === eventId ? { ...event, status } : event
    ));
  };

  const copyToClipboard = async (text: string, eventId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEventId(eventId);
      setTimeout(() => setCopiedEventId(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard');
    }
  };

  const exportData = () => {
    const data = {
      events: calendarEvents,
      templates: taskTemplates,
      settings: workSettings,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `github-scheduler-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.events) setCalendarEvents(data.events);
        if (data.templates) setTaskTemplates(data.templates);
        if (data.settings) setWorkSettings(data.settings);
        setResult('Data imported successfully!');
      } catch (error) {
        setError('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    setConfirmMessage('Are you sure you want to delete all data? This action cannot be undone.');
    setConfirmAction(() => () => {
      setCalendarEvents([]);
      setTaskTemplates([]);
      localStorage.removeItem('githubScheduler_events');
      localStorage.removeItem('githubScheduler_templates');
      setShowConfirmDialog(false);
      setResult('All data cleared successfully!');
    });
    setShowConfirmDialog(true);
  };

  const filteredEvents = calendarEvents.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getAnalytics = () => {
    const total = calendarEvents.length;
    const completed = calendarEvents.filter(e => e.status === 'completed').length;
    const inProgress = calendarEvents.filter(e => e.status === 'in-progress').length;
    const scheduled = calendarEvents.filter(e => e.status === 'scheduled').length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, inProgress, scheduled, completionRate };
  };

  const renderSchedulerTab = () => (
    <div className="space-y-6" id="scheduler-tab">
      <div className="card-responsive">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Github className="w-5 h-5" />
          GitHub Task URL
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="form-label">GitHub Issue or Pull Request URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/owner/repo/issues/123"
              className="input-responsive w-full"
              id="github-url-input"
            />
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
              Enter a GitHub issue or pull request URL to extract task details
            </p>
          </div>

          <button
            onClick={extractGitHubContent}
            disabled={isLoading || !githubUrl.trim()}
            className="btn btn-primary btn-responsive flex items-center gap-2"
            id="extract-task-btn"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Extracting...
              </>
            ) : (
              <>
                <Target className="w-4 h-4" />
                Extract Task Details
              </>
            )}
          </button>
        </div>

        {extractedTask && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-2">Task Extracted Successfully!</h3>
            <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
              <p><strong>Title:</strong> {extractedTask.title}</p>
              <p><strong>Type:</strong> {extractedTask.taskType}</p>
              <p><strong>Priority:</strong> {extractedTask.priority}</p>
              <p><strong>Estimated Hours:</strong> {extractedTask.estimatedHours}</p>
              {extractedTask.labels.length > 0 && (
                <p><strong>Labels:</strong> {extractedTask.labels.join(', ')}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {showEventForm && (
        <div className="card-responsive">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {editingEvent ? 'Edit Calendar Event' : 'Create Calendar Event'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Event Title</label>
              <input
                type="text"
                value={eventForm.title}
                onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                className="input-responsive w-full"
                placeholder="Task title"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Priority Color</label>
              <input
                type="color"
                value={eventForm.color}
                onChange={(e) => setEventForm(prev => ({ ...prev, color: e.target.value }))}
                className="input h-10 w-full"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={eventForm.startDate}
                onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-responsive w-full"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={eventForm.endDate}
                onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-responsive w-full"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm(prev => ({ ...prev, startTime: e.target.value }))}
                className="input-responsive w-full"
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm(prev => ({ ...prev, endTime: e.target.value }))}
                className="input-responsive w-full"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                className="input-responsive w-full h-24 resize-none"
                placeholder="Task description and notes"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                value={eventForm.location}
                onChange={(e) => setEventForm(prev => ({ ...prev, location: e.target.value }))}
                className="input-responsive w-full"
                placeholder="Development Environment"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Reminders (minutes before)</label>
              <select
                multiple
                value={eventForm.reminders.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                  setEventForm(prev => ({ ...prev, reminders: values }));
                }}
                className="input-responsive w-full h-20"
              >
                <option value="5">5 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="1440">1 day</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={createCalendarEvent}
              className="btn btn-primary btn-responsive flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingEvent ? 'Update Event' : 'Create Event'}
            </button>
            <button
              onClick={resetForm}
              className="btn bg-gray-500 text-white hover:bg-gray-600 btn-responsive"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderCalendarTab = () => (
    <div className="space-y-6" id="calendar-tab">
      <div className="card-responsive">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendar Events
          </h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events..."
                className="input-responsive pl-10"
                id="search-events"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-responsive"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-slate-400">
              {calendarEvents.length === 0 
                ? "No calendar events yet. Start by extracting a GitHub task!"
                : "No events match your search criteria."
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          event.status === 'completed' ? 'badge-success' :
                          event.status === 'in-progress' ? 'badge-warning' :
                          event.status === 'cancelled' ? 'badge-error' : 'badge-info'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                    
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{event.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {event.startDate} {event.startTime} - {event.endTime}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <span>📍</span>
                          {event.location}
                        </div>
                      )}
                      {event.reminders.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Bell className="w-4 h-4" />
                          {event.reminders.length} reminder{event.reminders.length !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={event.status}
                      onChange={(e) => updateEventStatus(event.id, e.target.value as CalendarEvent['status'])}
                      className="input-sm text-xs"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    
                    {event.googleCalendarLink && (
                      <a
                        href={event.googleCalendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm bg-blue-500 text-white hover:bg-blue-600 flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Google
                      </a>
                    )}
                    
                    <button
                      onClick={() => copyToClipboard(event.googleCalendarLink || '', event.id)}
                      className="btn btn-sm bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-1"
                    >
                      {copiedEventId === event.id ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                    
                    <button
                      onClick={() => editEvent(event)}
                      className="btn btn-sm bg-yellow-500 text-white hover:bg-yellow-600 flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="btn btn-sm bg-red-500 text-white hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderAnalyticsTab = () => {
    const analytics = getAnalytics();
    
    return (
      <div className="space-y-6" id="analytics-tab">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Total Events</div>
            <div className="stat-value">{analytics.total}</div>
            <div className="stat-desc">All created events</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Completed</div>
            <div className="stat-value text-green-600">{analytics.completed}</div>
            <div className="stat-desc">{analytics.completionRate}% completion rate</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">In Progress</div>
            <div className="stat-value text-yellow-600">{analytics.inProgress}</div>
            <div className="stat-desc">Currently active</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Scheduled</div>
            <div className="stat-value text-blue-600">{analytics.scheduled}</div>
            <div className="stat-desc">Upcoming events</div>
          </div>
        </div>

        <div className="card-responsive">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Activity
          </h3>
          
          <div className="space-y-3">
            {calendarEvents
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{event.title}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Created {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${
                    event.status === 'completed' ? 'badge-success' :
                    event.status === 'in-progress' ? 'badge-warning' :
                    event.status === 'cancelled' ? 'badge-error' : 'badge-info'
                  }`}>
                    {event.status}
                  </span>
                </div>
              ))}
            
            {calendarEvents.length === 0 && (
              <p className="text-gray-500 dark:text-slate-400 text-center py-4">
                No activity yet. Create your first event!
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsTab = () => (
    <div className="space-y-6" id="settings-tab">
      <div className="card-responsive">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Work Settings
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label className="form-label">Work Start Time</label>
            <input
              type="time"
              value={workSettings.workStartTime}
              onChange={(e) => setWorkSettings(prev => ({ ...prev, workStartTime: e.target.value }))}
              className="input-responsive w-full"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Work End Time</label>
            <input
              type="time"
              value={workSettings.workEndTime}
              onChange={(e) => setWorkSettings(prev => ({ ...prev, workEndTime: e.target.value }))}
              className="input-responsive w-full"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Default Task Duration (hours)</label>
            <input
              type="number"
              min="0.5"
              max="24"
              step="0.5"
              value={workSettings.defaultTaskDuration}
              onChange={(e) => setWorkSettings(prev => ({ ...prev, defaultTaskDuration: parseFloat(e.target.value) }))}
              className="input-responsive w-full"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Break Duration (minutes)</label>
            <input
              type="number"
              min="5"
              max="120"
              step="5"
              value={workSettings.breakDuration}
              onChange={(e) => setWorkSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
              className="input-responsive w-full"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select
              value={workSettings.timezone}
              onChange={(e) => setWorkSettings(prev => ({ ...prev, timezone: e.target.value }))}
              className="input-responsive w-full"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Berlin">Berlin</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
              <option value="Asia/Kolkata">India</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Theme</label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setWorkSettings(prev => ({ ...prev, theme: 'light' }))}
                className={`btn ${workSettings.theme === 'light' ? 'btn-primary' : 'bg-gray-200 text-gray-700'} flex items-center gap-2`}
              >
                <Sun className="w-4 h-4" />
                Light
              </button>
              <button
                onClick={() => setWorkSettings(prev => ({ ...prev, theme: 'dark' }))}
                className={`btn ${workSettings.theme === 'dark' ? 'btn-primary' : 'bg-gray-200 text-gray-700'} flex items-center gap-2`}
              >
                <Moon className="w-4 h-4" />
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card-responsive">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Data Management</h3>
        
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={exportData}
              className="btn bg-green-500 text-white hover:bg-green-600 btn-responsive flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </button>
            
            <label className="btn bg-blue-500 text-white hover:bg-blue-600 btn-responsive flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              Import Data
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
            
            <button
              onClick={clearAllData}
              className="btn bg-red-500 text-white hover:bg-red-600 btn-responsive flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </button>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-slate-400">
            <p>• Export: Download all your data as a backup file</p>
            <p>• Import: Restore data from a backup file</p>
            <p>• Clear: Remove all events, templates, and settings</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition" id="welcome_fallback">
      <AILayer
        ref={aiLayerRef}
        prompt=""
        onResult={handleAIResult}
        onError={(error) => setError(error?.message || 'An error occurred')}
        onLoading={setIsLoading}
      />

      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GitHub Task Scheduler</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-slate-400 hidden sm:block">
                Welcome, {currentUser.first_name}
              </span>
              <button
                onClick={logout}
                className="btn bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 btn-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 theme-transition">
        <div className="container-wide">
          <div className="flex space-x-8 overflow-x-auto" id="generation_issue_fallback">
            {[
              { id: 'scheduler', label: 'Task Scheduler', icon: Github },
              { id: 'calendar', label: 'Calendar Events', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                }`}
                id={`${id}-tab`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container-wide py-8">
        {/* Alerts */}
        {error && (
          <div className="alert alert-error mb-6">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {result && (
          <div className="alert alert-success mb-6">
            <CheckCircle className="w-5 h-5" />
            <span>{result}</span>
            <button onClick={() => setResult(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'scheduler' && renderSchedulerTab()}
        {activeTab === 'calendar' && renderCalendarTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </main>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="modal-backdrop" onClick={() => setShowConfirmDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Confirm Action</h3>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2">
              <p className="text-gray-500 dark:text-slate-400">{confirmMessage}</p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="btn bg-red-500 text-white hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 theme-transition mt-12">
        <div className="container-wide py-6">
          <p className="text-center text-sm text-gray-500 dark:text-slate-400">
            Copyright © 2025 Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;