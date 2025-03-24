import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { createRoot } from 'react-dom/client';
import { FileUploader, Layout, Plus, Upload, X, FileText, CheckCircle, AlertCircle, Moon, Sun, Search, Trash2, Settings, Loader, Download, RefreshCw, Edit3, Eye, Archive, BarChart2, Filter, SortAsc, SortDesc } from 'lucide-react';
import { format } from 'date-fns';
import { useForm, SubmitHandler } from 'react-hook-form';
import styles from './styles/styles.module.css';

// Define types for document management
type DocumentStatus = 'processed' | 'pending' | 'error' | 'archived';
type DocumentType = 'invoice' | 'shipping' | 'customs' | 'waybill' | 'other';

interface Document {
 id: string;
 name: string;
 type: DocumentType;
 uploadDate: Date;
 status: DocumentStatus;
 content?: string;
 confidence?: number;
 fileSize: number;
 extractedData?: Record<string, string>;
 tags?: string[];
}

interface Tag {
 id: string;
 name: string;
 color: string;
}

interface FormValues {
 documentType: DocumentType;
 tags: string[];
}

const App: React.FC = () => {
 // State management
 const [documents, setDocuments] = useState<Document[]>([]);
 const [activeView, setActiveView] = useState<'list' | 'grid'>('list');
 const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
 const [isUploading, setIsUploading] = useState<boolean>(false);
 const [searchQuery, setSearchQuery] = useState<string>('');
 const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
 const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');
 const [sortField, setSortField] = useState<'name' | 'uploadDate' | 'type'>('uploadDate');
 const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
 const [tags, setTags] = useState<Tag[]>([]);
 const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
 const [newTagName, setNewTagName] = useState<string>('');
 const [newTagColor, setNewTagColor] = useState<string>('#3B82F6');
 const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
 if (typeof window !== 'undefined') {
 const savedMode = localStorage.getItem('darkMode');
 return savedMode === 'true' || 
 (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
 }
 return false;
 });
 const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
 const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
 const [dashboardStats, setDashboardStats] = useState({
 totalDocuments: 0,
 processedDocuments: 0,
 pendingDocuments: 0,
 errorDocuments: 0
 });

 // Form handling with react-hook-form
 const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
 const fileInputRef = useRef<HTMLInputElement>(null);
 
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

 // Initialize with sample data
 useEffect(() => {
 // Generate some sample documents
 const sampleDocuments: Document[] = [
 {
 id: '1',
 name: 'Invoice-XYZ123.pdf',
 type: 'invoice',
 uploadDate: new Date(2023, 5, 15),
 status: 'processed',
 fileSize: 1024 * 512, // 512KB
 confidence: 0.95,
 extractedData: {
 invoiceNumber: 'INV-2023-001',
 date: '2023-06-15',
 amount: '$1,245.00',
 vendor: 'ABC Suppliers Inc.',
 currency: 'USD'
 },
 tags: ['important', 'verified']
 },
 {
 id: '2',
 name: 'Shipping-Manifest-June.xlsx',
 type: 'shipping',
 uploadDate: new Date(2023, 5, 20),
 status: 'processed',
 fileSize: 1024 * 1024, // 1MB
 confidence: 0.89,
 extractedData: {
 shipmentId: 'SHP2023-0620-001',
 origin: 'New York, NY',
 destination: 'Los Angeles, CA',
 items: '24 packages',
 carrier: 'FastFreight Express'
 },
 tags: ['verified']
 },
 {
 id: '3',
 name: 'Customs-Declaration-JUN23.pdf',
 type: 'customs',
 uploadDate: new Date(2023, 5, 22),
 status: 'pending',
 fileSize: 1024 * 768, // 768KB
 tags: ['urgent']
 },
 {
 id: '4',
 name: 'WaybillJUN25.pdf',
 type: 'waybill',
 uploadDate: new Date(2023, 5, 25),
 status: 'error',
 fileSize: 1024 * 256, // 256KB
 tags: ['problem']
 },
 {
 id: '5',
 name: 'Invoice-ABC456.pdf',
 type: 'invoice',
 uploadDate: new Date(2023, 5, 28),
 status: 'processed',
 fileSize: 1024 * 640, // 640KB
 confidence: 0.92,
 extractedData: {
 invoiceNumber: 'INV-2023-002',
 date: '2023-06-28',
 amount: '$875.50',
 vendor: 'XYZ Corp',
 currency: 'USD'
 },
 tags: ['verified']
 },
 {
 id: '6',
 name: 'PackingList-JUN30.docx',
 type: 'shipping',
 uploadDate: new Date(2023, 5, 30),
 status: 'pending',
 fileSize: 1024 * 384, // 384KB
 tags: ['urgent']
 }
 ];

 // Sample tags
 const sampleTags: Tag[] = [
 { id: '1', name: 'important', color: '#EF4444' }, // red
 { id: '2', name: 'verified', color: '#10B981' }, // green
 { id: '3', name: 'urgent', color: '#F59E0B' }, // amber
 { id: '4', name: 'problem', color: '#6366F1' } // indigo
 ];

 setDocuments(sampleDocuments);
 setTags(sampleTags);

 // Update dashboard stats
 updateDashboardStats(sampleDocuments);
 }, []);

 const updateDashboardStats = (docs: Document[]) => {
 setDashboardStats({
 totalDocuments: docs.length,
 processedDocuments: docs.filter(doc => doc.status === 'processed').length,
 pendingDocuments: docs.filter(doc => doc.status === 'pending').length,
 errorDocuments: docs.filter(doc => doc.status === 'error').length
 });
 };

 // Handle file upload
 const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
 const files = event.target.files;
 if (!files || files.length === 0) return;

 setIsUploading(true);

 // Simulate processing delay
 setTimeout(() => {
 const newDocs: Document[] = Array.from(files).map((file, index) => {
 const fileExt = file.name.split('.').pop() || '';
 let docType: DocumentType = 'other';
 
 // Determine document type based on filename
 if (file.name.toLowerCase().includes('invoice')) docType = 'invoice';
 else if (file.name.toLowerCase().includes('ship')) docType = 'shipping';
 else if (file.name.toLowerCase().includes('customs')) docType = 'customs';
 else if (file.name.toLowerCase().includes('waybill')) docType = 'waybill';

 return {
 id: `new-${Date.now()}-${index}`,
 name: file.name,
 type: docType,
 uploadDate: new Date(),
 status: 'pending',
 fileSize: file.size,
 tags: []
 };
 });

 setDocuments(prevDocs => {
 const updatedDocs = [...prevDocs, ...newDocs];
 updateDashboardStats(updatedDocs);
 return updatedDocs;
 });
 setIsUploading(false);
 
 // Reset file input
 if (fileInputRef.current) {
 fileInputRef.current.value = '';
 }
 }, 1500);
 };

 // Handle document processing simulation
 const processDocument = (docId: string) => {
 setDocuments(prev => {
 const updatedDocs = prev.map(doc => {
 if (doc.id === docId && doc.status === 'pending') {
 const processed: Document = {
 ...doc,
 status: Math.random() > 0.2 ? 'processed' : 'error',
 confidence: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
 };
 
 // Add extracted data for processed documents
 if (processed.status === 'processed') {
 if (processed.type === 'invoice') {
 processed.extractedData = {
 invoiceNumber: `INV-${Math.floor(Math.random() * 10000)}`,
 date: format(new Date(), 'yyyy-MM-dd'),
 amount: `$${(Math.random() * 2000 + 100).toFixed(2)}`,
 vendor: ['ABC Corp', 'XYZ Suppliers', 'Global Logistics'][Math.floor(Math.random() * 3)],
 currency: 'USD'
 };
 } else if (processed.type === 'shipping') {
 processed.extractedData = {
 shipmentId: `SHP-${Math.floor(Math.random() * 10000)}`,
 origin: ['New York', 'Chicago', 'Miami'][Math.floor(Math.random() * 3)],
 destination: ['Los Angeles', 'Seattle', 'Denver'][Math.floor(Math.random() * 3)],
 items: `${Math.floor(Math.random() * 30 + 1)} packages`,
 carrier: ['FastFreight', 'ShipEx', 'Global Carriers'][Math.floor(Math.random() * 3)]
 };
 }
 }
 
 return processed;
 }
 return doc;
 });
 
 updateDashboardStats(updatedDocs);
 return updatedDocs;
 });
 };

 // Handle document deletion
 const deleteDocument = (docId: string) => {
 setDocuments(prev => {
 const updatedDocs = prev.filter(doc => doc.id !== docId);
 updateDashboardStats(updatedDocs);
 return updatedDocs;
 });
 
 // If the deleted document was selected, clear selection
 if (selectedDocument && selectedDocument.id === docId) {
 setSelectedDocument(null);
 }
 };

 // Handle tag creation
 const handleAddTag = () => {
 if (newTagName.trim() === '') return;
 
 const newTag: Tag = {
 id: `tag-${Date.now()}`,
 name: newTagName.trim().toLowerCase(),
 color: newTagColor
 };
 
 setTags(prev => [...prev, newTag]);
 setNewTagName('');
 setIsAddingTag(false);
 };

 // Add tag to document
 const addTagToDocument = (docId: string, tagName: string) => {
 setDocuments(prev => prev.map(doc => {
 if (doc.id === docId) {
 const updatedTags = [...(doc.tags || []), tagName];
 // Remove duplicates
 return { ...doc, tags: Array.from(new Set(updatedTags)) };
 }
 return doc;
 }));
 };

 // Remove tag from document
 const removeTagFromDocument = (docId: string, tagName: string) => {
 setDocuments(prev => prev.map(doc => {
 if (doc.id === docId && doc.tags) {
 return { ...doc, tags: doc.tags.filter(tag => tag !== tagName) };
 }
 return doc;
 }));
 };

 // Format file size for display
 const formatFileSize = (bytes: number): string => {
 if (bytes < 1024) return `${bytes} B`;
 if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
 };

 // Filter and sort documents
 const filteredAndSortedDocuments = documents
 .filter(doc => {
 const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
 const matchesType = typeFilter === 'all' || doc.type === typeFilter;
 return matchesSearch && matchesStatus && matchesType;
 })
 .sort((a, b) => {
 if (sortField === 'name') {
 return sortDirection === 'asc' 
 ? a.name.localeCompare(b.name)
 : b.name.localeCompare(a.name);
 } else if (sortField === 'uploadDate') {
 return sortDirection === 'asc' 
 ? a.uploadDate.getTime() - b.uploadDate.getTime()
 : b.uploadDate.getTime() - a.uploadDate.getTime();
 } else { // type
 return sortDirection === 'asc' 
 ? a.type.localeCompare(b.type)
 : b.type.localeCompare(a.type);
 }
 });

 // Get tag color by name
 const getTagColor = (tagName: string): string => {
 const tag = tags.find(t => t.name === tagName);
 return tag ? tag.color : '#9CA3AF'; // Default gray if tag not found
 };

 // Status badge component
 const StatusBadge: React.FC<{ status: DocumentStatus }> = ({ status }) => {
 let badgeClass = 'badge ';
 switch(status) {
 case 'processed':
 badgeClass += 'badge-success';
 break;
 case 'pending':
 badgeClass += 'badge-warning';
 break;
 case 'error':
 badgeClass += 'badge-error';
 break;
 case 'archived':
 badgeClass += 'badge-info';
 break;
 }
 
 return (
 <span className={badgeClass}>
 {status.charAt(0).toUpperCase() + status.slice(1)}
 </span>
 );
 };

 // Toggle sort direction
 const toggleSort = (field: 'name' | 'uploadDate' | 'type') => {
 if (sortField === field) {
 setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
 } else {
 setSortField(field);
 setSortDirection('asc');
 }
 };

 // Submit form handler
 const onSubmit: SubmitHandler<FormValues> = (data) => {
 console.log('Form submitted:', data);
 setIsModalOpen(false);
 reset();
 };

 return (
 <div className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
 {/* Header */}
 <header className="bg-white dark:bg-gray-800 shadow-sm theme-transition">
 <div className="container mx-auto px-4 py-4 flex justify-between items-center">
 <div className="flex items-center space-x-3">
 <FileText className="h-8 w-8 text-primary-600 dark:text-primary-400" />
 <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LogiDoc Reader</h1>
 </div>
 <div className="flex items-center space-x-4">
 <button 
 className="btn btn-icon"
 onClick={() => setIsSettingsOpen(prev => !prev)}
 aria-label="Settings"
 >
 <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
 </button>
 <button 
 className="btn btn-icon"
 onClick={() => setIsDarkMode(prev => !prev)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 {isDarkMode ? 
 <Sun className="h-5 w-5 text-gray-300" /> : 
 <Moon className="h-5 w-5 text-gray-600" />
 }
 </button>
 </div>
 </div>
 </header>

 {/* Main content */}
 <main className="container mx-auto px-4 py-6">
 {/* Dashboard Stats */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Total Documents</div>
 <div className="stat-value">{dashboardStats.totalDocuments}</div>
 <div className="stat-desc">All document types</div>
 </div>
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Processed</div>
 <div className="stat-value text-success-600">{dashboardStats.processedDocuments}</div>
 <div className="stat-desc">
 {dashboardStats.totalDocuments > 0 ? 
 `${Math.round((dashboardStats.processedDocuments / dashboardStats.totalDocuments) * 100)}% of total` : 
 'No documents yet'}
 </div>
 </div>
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Pending</div>
 <div className="stat-value text-warning-600">{dashboardStats.pendingDocuments}</div>
 <div className="stat-desc">
 {dashboardStats.pendingDocuments > 0 ? 'Awaiting processing' : 'No pending documents'}
 </div>
 </div>
 <div className="stat-card bg-white dark:bg-gray-800">
 <div className="stat-title">Errors</div>
 <div className="stat-value text-error-600">{dashboardStats.errorDocuments}</div>
 <div className="stat-desc">
 {dashboardStats.errorDocuments > 0 ? 'Require attention' : 'No errors detected'}
 </div>
 </div>
 </div>

 {/* Controls and filters */}
 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
 <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
 <div className="relative w-full md:w-64">
 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
 <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
 </div>
 <input
 type="text"
 className="input pl-10 w-full"
 placeholder="Search documents..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>

 <div className="flex items-center gap-2 w-full md:w-auto">
 <select
 className="input"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value as DocumentStatus | 'all')}
 aria-label="Filter by status"
 >
 <option value="all">All Statuses</option>
 <option value="processed">Processed</option>
 <option value="pending">Pending</option>
 <option value="error">Error</option>
 <option value="archived">Archived</option>
 </select>

 <select
 className="input"
 value={typeFilter}
 onChange={(e) => setTypeFilter(e.target.value as DocumentType | 'all')}
 aria-label="Filter by document type"
 >
 <option value="all">All Types</option>
 <option value="invoice">Invoice</option>
 <option value="shipping">Shipping</option>
 <option value="customs">Customs</option>
 <option value="waybill">Waybill</option>
 <option value="other">Other</option>
 </select>

 <button 
 className="btn btn-icon" 
 onClick={() => {
 setSearchQuery('');
 setStatusFilter('all');
 setTypeFilter('all');
 }}
 aria-label="Clear filters"
 >
 <RefreshCw className="h-4 w-4" />
 </button>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
 <button 
 className={`px-3 py-1 rounded-md transition-colors ${activeView === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
 onClick={() => setActiveView('list')}
 aria-label="List view"
 >
 List
 </button>
 <button 
 className={`px-3 py-1 rounded-md transition-colors ${activeView === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
 onClick={() => setActiveView('grid')}
 aria-label="Grid view"
 >
 Grid
 </button>
 </div>

 <div className="flex items-center">
 <input 
 type="file" 
 id="fileUpload" 
 className="hidden" 
 onChange={handleFileUpload} 
 multiple 
 ref={fileInputRef}
 />
 <label 
 htmlFor="fileUpload" 
 className="btn btn-primary flex items-center gap-2"
 aria-label="Upload new documents"
 >
 {isUploading ? (
 <>
 <Loader className="h-4 w-4 animate-spin" />
 <span>Uploading...</span>
 </>
 ) : (
 <>
 <Upload className="h-4 w-4" />
 <span>Upload</span>
 </>
 )}
 </label>
 </div>
 </div>
 </div>

 {/* Document list view */}
 {activeView === 'list' && (
 <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
 {filteredAndSortedDocuments.length > 0 ? (
 <div className="table-container">
 <table className="table w-full">
 <thead>
 <tr>
 <th 
 className="table-header cursor-pointer"
 onClick={() => toggleSort('name')}
 >
 <div className="flex items-center space-x-1">
 <span>Name</span>
 {sortField === 'name' && (
 sortDirection === 'asc' ? 
 <SortAsc className="h-4 w-4" /> : 
 <SortDesc className="h-4 w-4" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => toggleSort('type')}
 >
 <div className="flex items-center space-x-1">
 <span>Type</span>
 {sortField === 'type' && (
 sortDirection === 'asc' ? 
 <SortAsc className="h-4 w-4" /> : 
 <SortDesc className="h-4 w-4" />
 )}
 </div>
 </th>
 <th 
 className="table-header cursor-pointer"
 onClick={() => toggleSort('uploadDate')}
 >
 <div className="flex items-center space-x-1">
 <span>Upload Date</span>
 {sortField === 'uploadDate' && (
 sortDirection === 'asc' ? 
 <SortAsc className="h-4 w-4" /> : 
 <SortDesc className="h-4 w-4" />
 )}
 </div>
 </th>
 <th className="table-header">Size</th>
 <th className="table-header">Status</th>
 <th className="table-header">Tags</th>
 <th className="table-header">Actions</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
 {filteredAndSortedDocuments.map(doc => (
 <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 theme-transition">
 <td className="table-cell font-medium text-gray-900 dark:text-white">
 {doc.name}
 {doc.status === 'processed' && doc.confidence && (
 <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
 Confidence: {Math.round(doc.confidence * 100)}%
 </div>
 )}
 </td>
 <td className="table-cell text-gray-500 dark:text-gray-400">
 {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)}
 </td>
 <td className="table-cell text-gray-500 dark:text-gray-400">
 {format(doc.uploadDate, 'MMM d, yyyy')}
 </td>
 <td className="table-cell text-gray-500 dark:text-gray-400">
 {formatFileSize(doc.fileSize)}
 </td>
 <td className="table-cell">
 <StatusBadge status={doc.status} />
 </td>
 <td className="table-cell">
 <div className="flex flex-wrap gap-1">
 {doc.tags?.map(tag => (
 <span 
 key={tag} 
 className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" 
 style={{ backgroundColor: `${getTagColor(tag)}30`, color: getTagColor(tag) }}
 >
 {tag}
 <button 
 onClick={() => removeTagFromDocument(doc.id, tag)}
 className="ml-1 text-xs"
 aria-label={`Remove ${tag} tag`}
 >
 ×
 </button>
 </span>
 ))}
 {(!doc.tags || doc.tags.length < 3) && (
 <button 
 onClick={() => {
 setSelectedDocument(doc);
 setIsModalOpen(true);
 }}
 className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 aria-label="Add tag"
 >
 <Plus className="h-3 w-3" />
 </button>
 )}
 </div>
 </td>
 <td className="table-cell">
 <div className="flex items-center space-x-2">
 <button 
 className="btn btn-icon btn-sm"
 onClick={() => setSelectedDocument(doc)}
 aria-label={`View ${doc.name}`}
 >
 <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
 </button>
 {doc.status === 'pending' && (
 <button 
 className="btn btn-icon btn-sm"
 onClick={() => processDocument(doc.id)}
 aria-label={`Process ${doc.name}`}
 >
 <RefreshCw className="h-4 w-4 text-primary-500 dark:text-primary-400" />
 </button>
 )}
 <button 
 className="btn btn-icon btn-sm"
 onClick={() => deleteDocument(doc.id)}
 aria-label={`Delete ${doc.name}`}
 >
 <Trash2 className="h-4 w-4 text-error-500 dark:text-error-400" />
 </button>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="p-6 text-center">
 <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
 <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
 </div>
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No documents found</h3>
 <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
 {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 
 'Try adjusting your search or filters to find what you\'re looking for.' : 
 'Upload documents to get started with automated document processing.'}
 </p>
 {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
 <button 
 className="btn btn-secondary mt-4"
 onClick={() => {
 setSearchQuery('');
 setStatusFilter('all');
 setTypeFilter('all');
 }}
 aria-label="Clear filters"
 >
 Clear Filters
 </button>
 )}
 </div>
 )}
 </div>
 )}

 {/* Document grid view */}
 {activeView === 'grid' && (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {filteredAndSortedDocuments.length > 0 ? (
 filteredAndSortedDocuments.map(doc => (
 <div key={doc.id} className="card-responsive hover:shadow-md theme-transition">
 <div className="flex items-start justify-between">
 <div className="flex items-center">
 <div className="p-2 rounded-md bg-gray-100 dark:bg-gray-700">
 <FileText className="h-5 w-5 text-gray-500 dark:text-gray-400" />
 </div>
 <div className="ml-3">
 <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px]">
 {doc.name}
 </h3>
 <p className="text-xs text-gray-500 dark:text-gray-400">
 {doc.type.charAt(0).toUpperCase() + doc.type.slice(1)} • {formatFileSize(doc.fileSize)}
 </p>
 </div>
 </div>
 <StatusBadge status={doc.status} />
 </div>

 <div className="mt-3">
 <p className="text-xs text-gray-500 dark:text-gray-400">
 Uploaded {format(doc.uploadDate, 'MMM d, yyyy')}
 </p>
 {doc.status === 'processed' && doc.confidence && (
 <div className="mt-1 flex items-center">
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
 <div 
 className="bg-primary-500 dark:bg-primary-400 h-1.5 rounded-full" 
 style={{ width: `${Math.round(doc.confidence * 100)}%` }}
 ></div>
 </div>
 <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
 {Math.round(doc.confidence * 100)}%
 </span>
 </div>
 )}
 </div>

 <div className="mt-3 flex flex-wrap gap-1">
 {doc.tags?.map(tag => (
 <span 
 key={tag} 
 className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium" 
 style={{ backgroundColor: `${getTagColor(tag)}30`, color: getTagColor(tag) }}
 >
 {tag}
 </span>
 ))}
 </div>

 <div className="mt-4 flex justify-between items-center">
 <button 
 className="btn btn-sm btn-secondary"
 onClick={() => setSelectedDocument(doc)}
 aria-label={`View ${doc.name}`}
 >
 View Details
 </button>
 <div className="flex space-x-1">
 {doc.status === 'pending' && (
 <button 
 className="btn btn-icon btn-sm"
 onClick={() => processDocument(doc.id)}
 aria-label={`Process ${doc.name}`}
 >
 <RefreshCw className="h-4 w-4 text-primary-500" />
 </button>
 )}
 <button 
 className="btn btn-icon btn-sm"
 onClick={() => deleteDocument(doc.id)}
 aria-label={`Delete ${doc.name}`}
 >
 <Trash2 className="h-4 w-4 text-error-500" />
 </button>
 </div>
 </div>
 </div>
 ))
 ) : (
 <div className="col-span-full p-6 text-center bg-white dark:bg-gray-800 rounded-lg shadow">
 <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
 <FileText className="h-6 w-6 text-gray-400 dark:text-gray-500" />
 </div>
 <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No documents found</h3>
 <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
 {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? 
 'Try adjusting your search or filters to find what you\'re looking for.' : 
 'Upload documents to get started with automated document processing.'}
 </p>
 {(searchQuery || statusFilter !== 'all' || typeFilter !== 'all') && (
 <button 
 className="btn btn-secondary mt-4"
 onClick={() => {
 setSearchQuery('');
 setStatusFilter('all');
 setTypeFilter('all');
 }}
 aria-label="Clear filters"
 >
 Clear Filters
 </button>
 )}
 </div>
 )}
 </div>
 )}
 </main>

 {/* Document details modal */}
 {selectedDocument && (
 <div className="modal-backdrop" onClick={() => setSelectedDocument(null)}>
 <div className="modal-content max-w-2xl" onClick={e => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 Document Details
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500 focus:outline-none"
 onClick={() => setSelectedDocument(null)}
 aria-label="Close modal"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 
 <div className="mt-4 space-y-4">
 <div className="flex items-center justify-between">
 <div>
 <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
 {selectedDocument.name}
 </h2>
 <p className="text-sm text-gray-500 dark:text-gray-400">
 {selectedDocument.type.charAt(0).toUpperCase() + selectedDocument.type.slice(1)} • 
 {formatFileSize(selectedDocument.fileSize)} • 
 Uploaded on {format(selectedDocument.uploadDate, 'MMMM d, yyyy')}
 </p>
 </div>
 <StatusBadge status={selectedDocument.status} />
 </div>
 
 {selectedDocument.tags && selectedDocument.tags.length > 0 && (
 <div>
 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags</h4>
 <div className="flex flex-wrap gap-2">
 {selectedDocument.tags.map(tag => (
 <span 
 key={tag} 
 className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium" 
 style={{ backgroundColor: `${getTagColor(tag)}30`, color: getTagColor(tag) }}
 >
 {tag}
 <button 
 onClick={() => removeTagFromDocument(selectedDocument.id, tag)}
 className="ml-1.5 text-xs"
 aria-label={`Remove ${tag} tag`}
 >
 ×
 </button>
 </span>
 ))}
 {selectedDocument.tags.length < 5 && (
 <button 
 onClick={() => setIsModalOpen(true)}
 className="inline-flex items-center rounded-full px-2.5 py-0.5 text-sm border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
 aria-label="Add tag"
 >
 <Plus className="h-3 w-3 mr-1" />
 Add tag
 </button>
 )}
 </div>
 </div>
 )}

 {selectedDocument.status === 'processed' && selectedDocument.extractedData && (
 <div>
 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Extracted Data</h4>
 <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-4 space-y-2">
 {Object.entries(selectedDocument.extractedData).map(([key, value]) => (
 <div key={key} className="flex items-start">
 <dt className="w-1/3 text-sm font-medium text-gray-500 dark:text-gray-400">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</dt>
 <dd className="w-2/3 text-sm text-gray-900 dark:text-white">{value}</dd>
 </div>
 ))}
 </div>
 </div>
 )}

 {selectedDocument.status === 'processed' && selectedDocument.confidence && (
 <div>
 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Processing Confidence</h4>
 <div className="flex items-center">
 <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
 <div 
 className="bg-primary-500 dark:bg-primary-400 h-2.5 rounded-full" 
 style={{ width: `${Math.round(selectedDocument.confidence * 100)}%` }}
 ></div>
 </div>
 <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
 {Math.round(selectedDocument.confidence * 100)}%
 </span>
 </div>
 </div>
 )}

 {selectedDocument.status === 'error' && (
 <div className="alert alert-error">
 <AlertCircle className="h-5 w-5" />
 <p>An error occurred during processing. Please review the document and try again.</p>
 </div>
 )}

 {selectedDocument.status === 'pending' && (
 <div className="alert alert-warning">
 <AlertCircle className="h-5 w-5" />
 <p>This document is pending processing. Process it to extract data.</p>
 </div>
 )}

 <div className="flex justify-between items-center border-t pt-4 dark:border-gray-700">
 <div className="flex space-x-2">
 {selectedDocument.status === 'pending' && (
 <button 
 className="btn btn-primary"
 onClick={() => {
 processDocument(selectedDocument.id);
 setSelectedDocument(prev => {
 if (prev) {
 const updatedDoc = documents.find(doc => doc.id === prev.id);
 return updatedDoc || prev;
 }
 return null;
 });
 }}
 aria-label="Process document"
 >
 <RefreshCw className="h-4 w-4 mr-2" />
 Process Document
 </button>
 )}
 {selectedDocument.status === 'processed' && (
 <button 
 className="btn btn-secondary"
 onClick={() => console.log('Download document')}
 aria-label="Download document data"
 >
 <Download className="h-4 w-4 mr-2" />
 Download Data
 </button>
 )}
 </div>
 <button 
 className="btn btn-error"
 onClick={() => {
 deleteDocument(selectedDocument.id);
 setSelectedDocument(null);
 }}
 aria-label="Delete document"
 >
 <Trash2 className="h-4 w-4 mr-2" />
 Delete
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* Add tags modal */}
 {isModalOpen && (
 <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
 <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 Add Tags
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500 focus:outline-none"
 onClick={() => setIsModalOpen(false)}
 aria-label="Close modal"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 
 <div className="mt-4">
 <form onSubmit={e => {
 e.preventDefault();
 if (selectedDocument && e.currentTarget.tag.value) {
 addTagToDocument(selectedDocument.id, e.currentTarget.tag.value);
 setIsModalOpen(false);
 (e.currentTarget as HTMLFormElement).reset();
 }
 }}>
 <div className="mb-4">
 <label htmlFor="tag" className="form-label">
 Select Tag
 </label>
 <div className="grid grid-cols-1 gap-2">
 <select 
 id="tag" 
 name="tag"
 className="input"
 aria-label="Select a tag"
 >
 {tags.map(tag => (
 <option key={tag.id} value={tag.name}>
 {tag.name}
 </option>
 ))}
 </select>

 <div className="flex items-center mt-2">
 <span className="mr-2 text-sm text-gray-500 dark:text-gray-400">or</span>
 <button 
 type="button"
 className="btn btn-sm btn-secondary"
 onClick={() => setIsAddingTag(prev => !prev)}
 aria-label={isAddingTag ? "Cancel new tag" : "Create new tag"}
 >
 {isAddingTag ? "Cancel" : "Create New Tag"}
 </button>
 </div>
 </div>
 </div>

 {isAddingTag && (
 <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg mb-4">
 <div className="form-group">
 <label htmlFor="tagName" className="form-label">
 Tag Name
 </label>
 <input 
 type="text" 
 id="tagName"
 className="input" 
 value={newTagName}
 onChange={(e) => setNewTagName(e.target.value)}
 placeholder="Enter tag name"
 />
 </div>

 <div className="form-group">
 <label htmlFor="tagColor" className="form-label">
 Tag Color
 </label>
 <div className="flex items-center space-x-2">
 <input 
 type="color" 
 id="tagColor"
 className="w-10 h-10 rounded" 
 value={newTagColor}
 onChange={(e) => setNewTagColor(e.target.value)}
 />
 <div 
 className="h-6 flex-1 rounded" 
 style={{ backgroundColor: newTagColor }}
 ></div>
 </div>
 </div>

 <button 
 type="button"
 className="btn btn-primary w-full"
 onClick={handleAddTag}
 disabled={!newTagName.trim()}
 aria-label="Create tag"
 >
 Create Tag
 </button>
 </div>
 )}

 <div className="modal-footer">
 <button 
 type="button" 
 className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
 onClick={() => setIsModalOpen(false)}
 aria-label="Cancel"
 >
 Cancel
 </button>
 <button 
 type="submit" 
 className="btn btn-primary"
 aria-label="Add tag"
 >
 Add Tag
 </button>
 </div>
 </form>
 </div>
 </div>
 </div>
 )}

 {/* Settings Modal */}
 {isSettingsOpen && (
 <div className="modal-backdrop" onClick={() => setIsSettingsOpen(false)}>
 <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
 <div className="modal-header">
 <h3 className="text-lg font-medium text-gray-900 dark:text-white">
 <Settings className="h-5 w-5 inline mr-2" /> Settings
 </h3>
 <button 
 className="text-gray-400 hover:text-gray-500 focus:outline-none"
 onClick={() => setIsSettingsOpen(false)}
 aria-label="Close settings"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 
 <div className="mt-4 space-y-6">
 <div>
 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</h4>
 <div className="flex items-center space-x-2">
 <span className="text-sm dark:text-slate-300">Light</span>
 <button 
 className={styles.themeToggle}
 onClick={() => setIsDarkMode(prev => !prev)}
 aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
 >
 <span className={`${styles.themeToggleThumb} ${isDarkMode ? styles.themeToggleThumbDark : ''}`}></span>
 </button>
 <span className="text-sm dark:text-slate-300">Dark</span>
 </div>
 </div>
 
 <div>
 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default View</h4>
 <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-fit">
 <button 
 className={`px-3 py-1 rounded-md transition-colors ${activeView === 'list' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
 onClick={() => setActiveView('list')}
 aria-label="Set list view as default"
 >
 List
 </button>
 <button 
 className={`px-3 py-1 rounded-md transition-colors ${activeView === 'grid' ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
 onClick={() => setActiveView('grid')}
 aria-label="Set grid view as default"
 >
 Grid
 </button>
 </div>
 </div>

 <div>
 <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Manage Tags</h4>
 <div className="bg-gray-50 dark:bg-gray-750 rounded-lg p-3 max-h-40 overflow-y-auto">
 {tags.length > 0 ? (
 <ul className="space-y-2">
 {tags.map(tag => (
 <li key={tag.id} className="flex items-center justify-between">
 <div className="flex items-center">
 <div 
 className="w-3 h-3 rounded-full mr-2" 
 style={{ backgroundColor: tag.color }}
 ></div>
 <span className="text-sm text-gray-700 dark:text-gray-300">{tag.name}</span>
 </div>
 <button 
 className="text-gray-400 hover:text-gray-500"
 onClick={() => setTags(prev => prev.filter(t => t.id !== tag.id))}
 aria-label={`Delete ${tag.name} tag`}
 >
 <X className="h-4 w-4" />
 </button>
 </li>
 ))}
 </ul>
 ) : (
 <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">No tags created yet</p>
 )}
 </div>
 <button 
 className="btn btn-sm btn-secondary mt-2 w-full"
 onClick={() => {
 setIsAddingTag(true);
 setIsSettingsOpen(false);
 setIsModalOpen(true);
 }}
 aria-label="Add new tag"
 >
 <Plus className="h-3 w-3 mr-1" />
 Add New Tag
 </button>
 </div>
 </div>
 
 <div className="modal-footer">
 <button 
 className="btn btn-primary"
 onClick={() => setIsSettingsOpen(false)}
 aria-label="Save settings"
 >
 Save Settings
 </button>
 </div>
 </div>
 </div>
 )}

 {/* Footer */}
 <footer className="bg-white dark:bg-gray-800 shadow-sm theme-transition py-4 px-4 text-center">
 <p className="text-sm text-gray-500 dark:text-gray-400">
 Copyright (c) 2025 of Datavtar Private Limited. All rights reserved.
 </p>
 </footer>
 </div>
 );
};

// Create root and render
const root = document.getElementById('root');
if (root) {
 createRoot(root).render(<App />);
}

export default App;