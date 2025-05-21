import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Trash2,
  Edit,
  Search,
  Plus,
  X,
  Shield,
  UserCheck,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  Moon,
  Sun,
  Filter,
  ArrowDownUp,
  Check,
  LogOut
} from 'lucide-react';
import styles from './styles/styles.module.css';

// Define types for our application
type RoleType = 'admin' | 'manager' | 'user' | 'guest' | 'custom';

interface User {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  groups: string[];
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: 'internal' | 'external';
  permissions: Permission[];
  members: string[];
  createdAt: string;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  createdAt: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const getRoleColor = (role: RoleType): string => {
  switch (role) {
    case 'admin':
      return 'badge badge-error';
    case 'manager':
      return 'badge badge-warning';
    case 'user':
      return 'badge badge-info';
    case 'guest':
      return 'badge badge-success';
    default:
      return 'badge';
  }
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>
          <button 
            className="text-gray-400 hover:text-gray-500" 
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="mt-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Current view state
  const [currentView, setCurrentView] = useState<'users' | 'groups' | 'permissions'>('users');
  
  // Users state
  const [users, setUsers] = useState<User[]>(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) return JSON.parse(savedUsers);
    return generateSampleUsers();
  });
  
  // Groups state
  const [groups, setGroups] = useState<Group[]>(() => {
    const savedGroups = localStorage.getItem('groups');
    if (savedGroups) return JSON.parse(savedGroups);
    return generateSampleGroups();
  });
  
  // Permissions state
  const [permissions, setPermissions] = useState<Permission[]>(() => {
    const savedPermissions = localStorage.getItem('permissions');
    if (savedPermissions) return JSON.parse(savedPermissions);
    return generateSamplePermissions();
  });

  // Modal states
  const [userModalOpen, setUserModalOpen] = useState<boolean>(false);
  const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false);
  const [permissionModalOpen, setPermissionModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);

  // Search & filter states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<{
    role?: RoleType;
    groupType?: 'internal' | 'external';
    resourceType?: string;
  }>({});
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'ascending' | 'descending';
  } | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Apply dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('groups', JSON.stringify(groups));
    localStorage.setItem('permissions', JSON.stringify(permissions));
  }, [users, groups, permissions]);

  // Sample data generation functions
  function generateSampleUsers(): User[] {
    return [
      {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        groups: ['1', '3'],
        createdAt: new Date(2023, 1, 15).toISOString(),
        lastLogin: new Date(2023, 5, 20).toISOString(),
        isActive: true
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'manager',
        groups: ['2'],
        createdAt: new Date(2023, 2, 10).toISOString(),
        lastLogin: new Date(2023, 5, 19).toISOString(),
        isActive: true
      },
      {
        id: '3',
        name: 'Bob Johnson',
        email: 'bob@example.com',
        role: 'user',
        groups: ['3'],
        createdAt: new Date(2023, 3, 5).toISOString(),
        lastLogin: new Date(2023, 5, 15).toISOString(),
        isActive: true
      },
      {
        id: '4',
        name: 'Alice Williams',
        email: 'alice@example.com',
        role: 'user',
        groups: ['2', '3'],
        createdAt: new Date(2023, 4, 1).toISOString(),
        lastLogin: new Date(2023, 5, 18).toISOString(),
        isActive: false
      },
      {
        id: '5',
        name: 'Sam Davis',
        email: 'sam@example.com',
        role: 'guest',
        groups: [],
        createdAt: new Date(2023, 5, 1).toISOString(),
        isActive: true
      }
    ];
  }

  function generateSampleGroups(): Group[] {
    return [
      {
        id: '1',
        name: 'Administrators',
        description: 'System administrators with full access',
        type: 'internal',
        permissions: ['1', '2', '3', '4'],
        members: ['1'],
        createdAt: new Date(2023, 1, 1).toISOString()
      },
      {
        id: '2',
        name: 'Marketing Team',
        description: 'Marketing department personnel',
        type: 'internal',
        permissions: ['2', '3'],
        members: ['2', '4'],
        createdAt: new Date(2023, 2, 1).toISOString()
      },
      {
        id: '3',
        name: 'API Users',
        description: 'Third-party API integration access',
        type: 'external',
        permissions: ['2'],
        members: ['1', '3', '4'],
        createdAt: new Date(2023, 3, 1).toISOString()
      },
      {
        id: '4',
        name: 'Support Staff',
        description: 'Customer support team',
        type: 'internal',
        permissions: ['2', '3'],
        members: [],
        createdAt: new Date(2023, 4, 1).toISOString()
      },
      {
        id: '5',
        name: 'External Consultants',
        description: 'Third-party consultants',
        type: 'external',
        permissions: ['2'],
        members: [],
        createdAt: new Date(2023, 5, 1).toISOString()
      }
    ];
  }

  function generateSamplePermissions(): Permission[] {
    return [
      {
        id: '1',
        name: 'Manage Users',
        description: 'Create, edit, delete users',
        resource: 'users',
        action: 'manage',
        createdAt: new Date(2023, 1, 1).toISOString()
      },
      {
        id: '2',
        name: 'View Data',
        description: 'Read-only access to data',
        resource: 'data',
        action: 'read',
        createdAt: new Date(2023, 1, 1).toISOString()
      },
      {
        id: '3',
        name: 'Edit Content',
        description: 'Modify content items',
        resource: 'content',
        action: 'update',
        createdAt: new Date(2023, 1, 1).toISOString()
      },
      {
        id: '4',
        name: 'System Configuration',
        description: 'Configure system settings',
        resource: 'settings',
        action: 'manage',
        createdAt: new Date(2023, 1, 1).toISOString()
      },
      {
        id: '5',
        name: 'Upload Files',
        description: 'Upload files to the system',
        resource: 'files',
        action: 'create',
        createdAt: new Date(2023, 2, 1).toISOString()
      }
    ];
  }

  // Generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // User CRUD operations
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  const deleteUser = (userId: string) => {
    // Remove user from groups
    const updatedGroups = groups.map(group => ({
      ...group,
      members: group.members.filter(id => id !== userId)
    }));
    setGroups(updatedGroups);
    
    // Remove user from users list
    setUsers(users.filter(user => user.id !== userId));
  };

  // Group CRUD operations
  const addGroup = (groupData: Omit<Group, 'id' | 'createdAt'>) => {
    const newGroup: Group = {
      ...groupData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setGroups([...groups, newGroup]);
  };

  const updateGroup = (updatedGroup: Group) => {
    setGroups(groups.map(group => group.id === updatedGroup.id ? updatedGroup : group));
  };

  const deleteGroup = (groupId: string) => {
    // Remove group from users
    const updatedUsers = users.map(user => ({
      ...user,
      groups: user.groups.filter(id => id !== groupId)
    }));
    setUsers(updatedUsers);
    
    // Remove group from groups list
    setGroups(groups.filter(group => group.id !== groupId));
  };

  // Permission CRUD operations
  const addPermission = (permissionData: Omit<Permission, 'id' | 'createdAt'>) => {
    const newPermission: Permission = {
      ...permissionData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };
    setPermissions([...permissions, newPermission]);
  };

  const updatePermission = (updatedPermission: Permission) => {
    setPermissions(permissions.map(permission => 
      permission.id === updatedPermission.id ? updatedPermission : permission
    ));
  };

  const deletePermission = (permissionId: string) => {
    // Remove permission from groups
    const updatedGroups = groups.map(group => ({
      ...group,
      permissions: group.permissions.filter(id => id !== permissionId)
    }));
    setGroups(updatedGroups);
    
    // Remove permission from permissions list
    setPermissions(permissions.filter(permission => permission.id !== permissionId));
  };

  // Sorting logic
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Filtering and pagination logic
  const getFilteredUsers = () => {
    let result = [...users];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.name.toLowerCase().includes(term) || 
        user.email.toLowerCase().includes(term)
      );
    }
    
    // Apply role filter
    if (filter.role) {
      result = result.filter(user => user.role === filter.role);
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  };

  const getFilteredGroups = () => {
    let result = [...groups];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(group => 
        group.name.toLowerCase().includes(term) || 
        group.description.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (filter.groupType) {
      result = result.filter(group => group.type === filter.groupType);
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  };

  const getFilteredPermissions = () => {
    let result = [...permissions];
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(permission => 
        permission.name.toLowerCase().includes(term) || 
        permission.description.toLowerCase().includes(term) ||
        permission.resource.toLowerCase().includes(term)
      );
    }
    
    // Apply resource filter
    if (filter.resourceType) {
      result = result.filter(permission => permission.resource === filter.resourceType);
    }
    
    // Apply sorting
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return result;
  };

  // Pagination calculation
  const getCurrentItems = () => {
    let filteredItems: any[] = [];
    
    switch (currentView) {
      case 'users':
        filteredItems = getFilteredUsers();
        break;
      case 'groups':
        filteredItems = getFilteredGroups();
        break;
      case 'permissions':
        filteredItems = getFilteredPermissions();
        break;
    }
    
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  };

  const getTotalPages = () => {
    let totalItems = 0;
    
    switch (currentView) {
      case 'users':
        totalItems = getFilteredUsers().length;
        break;
      case 'groups':
        totalItems = getFilteredGroups().length;
        break;
      case 'permissions':
        totalItems = getFilteredPermissions().length;
        break;
    }
    
    return Math.ceil(totalItems / itemsPerPage);
  };

  // Helper to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  // Helper to get group and permission names by IDs
  const getGroupNameById = (id: string) => {
    const group = groups.find(g => g.id === id);
    return group ? group.name : 'Unknown';
  };

  const getPermissionNameById = (id: string) => {
    const permission = permissions.find(p => p.id === id);
    return permission ? permission.name : 'Unknown';
  };

  // Helper for creating a new user form
  const handleUserFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const userData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as RoleType,
      groups: Array.from(formData.getAll('groups') as FormDataEntryValue[]).map(g => g.toString()),
      isActive: formData.get('isActive') === 'on',
    };
    
    if (currentUser) {
      updateUser({
        ...currentUser,
        ...userData
      });
    } else {
      addUser(userData);
    }
    
    setCurrentUser(null);
    setUserModalOpen(false);
  };

  // Helper for creating a new group form
  const handleGroupFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const groupData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as 'internal' | 'external',
      permissions: Array.from(formData.getAll('permissions') as FormDataEntryValue[]).map(p => p.toString()),
      members: Array.from(formData.getAll('members') as FormDataEntryValue[]).map(m => m.toString()),
    };
    
    if (currentGroup) {
      updateGroup({
        ...currentGroup,
        ...groupData
      });
    } else {
      addGroup(groupData);
    }
    
    setCurrentGroup(null);
    setGroupModalOpen(false);
  };

  // Helper for creating a new permission form
  const handlePermissionFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData(e.target as HTMLFormElement);
    const permissionData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      resource: formData.get('resource') as string,
      action: formData.get('action') as 'create' | 'read' | 'update' | 'delete' | 'manage',
    };
    
    if (currentPermission) {
      updatePermission({
        ...currentPermission,
        ...permissionData
      });
    } else {
      addPermission(permissionData);
    }
    
    setCurrentPermission(null);
    setPermissionModalOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setFilter({});
    setSortConfig(null);
    setCurrentPage(1);
  };

  // Get unique resource types for filtering
  const getUniqueResourceTypes = (): string[] => {
    const resourceTypes = permissions.map(p => p.resource);
    return Array.from(new Set(resourceTypes));
  };

  return (
    <div className="min-h-screen flex flex-col theme-transition-all">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm p-4 sticky top-0 z-[var(--z-fixed)]">
        <div className="container-fluid flex-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
            <Shield className="mr-2" />
            RBAC System
          </h1>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="btn btn-sm flex items-center justify-center bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-full p-2"
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-100 dark:bg-slate-700 p-4">
        <div className="container-fluid flex flex-wrap gap-2">
          <button 
            className={`btn ${currentView === 'users' ? 'btn-primary' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-white'} flex items-center gap-2`}
            onClick={() => { setCurrentView('users'); resetFilters(); }}
          >
            <Users size={18} />
            <span>Users</span>
          </button>
          
          <button 
            className={`btn ${currentView === 'groups' ? 'btn-primary' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-white'} flex items-center gap-2`}
            onClick={() => { setCurrentView('groups'); resetFilters(); }}
          >
            <UserCheck size={18} />
            <span>Groups</span>
          </button>
          
          <button 
            className={`btn ${currentView === 'permissions' ? 'btn-primary' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-white'} flex items-center gap-2`}
            onClick={() => { setCurrentView('permissions'); resetFilters(); }}
          >
            <Lock size={18} />
            <span>Permissions</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-gray-50 dark:bg-slate-900 p-4">
        <div className="container-fluid">
          {/* Actions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {currentView === 'users' && 'User Management'}
                {currentView === 'groups' && 'Group Management'}
                {currentView === 'permissions' && 'Permission Management'}
              </h2>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${currentView}...`}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="input pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              </div>
              
              {/* Filter dropdown */}
              <div className="relative">
                <button 
                  className="btn bg-white dark:bg-slate-800 text-gray-700 dark:text-white flex items-center gap-2"
                  onClick={() => document.getElementById('filterDropdown')?.classList.toggle('hidden')}
                >
                  <Filter size={16} />
                  <span>Filter</span>
                  <ChevronDown size={14} />
                </button>
                
                <div 
                  id="filterDropdown" 
                  className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg p-2 z-10 hidden"
                >
                  {currentView === 'users' && (
                    <div className="p-2">
                      <label className="form-label">Role</label>
                      <select 
                        className="input mt-1"
                        value={filter.role || ''}
                        onChange={(e) => {
                          const value = e.target.value as RoleType | '';
                          setFilter({ ...filter, role: value || undefined });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="user">User</option>
                        <option value="guest">Guest</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                  )}
                  
                  {currentView === 'groups' && (
                    <div className="p-2">
                      <label className="form-label">Type</label>
                      <select 
                        className="input mt-1"
                        value={filter.groupType || ''}
                        onChange={(e) => {
                          const value = e.target.value as 'internal' | 'external' | '';
                          setFilter({ ...filter, groupType: value || undefined });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Types</option>
                        <option value="internal">Internal</option>
                        <option value="external">External</option>
                      </select>
                    </div>
                  )}
                  
                  {currentView === 'permissions' && (
                    <div className="p-2">
                      <label className="form-label">Resource</label>
                      <select 
                        className="input mt-1"
                        value={filter.resourceType || ''}
                        onChange={(e) => {
                          setFilter({ ...filter, resourceType: e.target.value || undefined });
                          setCurrentPage(1);
                        }}
                      >
                        <option value="">All Resources</option>
                        {getUniqueResourceTypes().map(resource => (
                          <option key={resource} value={resource}>{resource}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add new item button */}
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => {
                  if (currentView === 'users') {
                    setCurrentUser(null);
                    setUserModalOpen(true);
                  } else if (currentView === 'groups') {
                    setCurrentGroup(null);
                    setGroupModalOpen(true);
                  } else if (currentView === 'permissions') {
                    setCurrentPermission(null);
                    setPermissionModalOpen(true);
                  }
                }}
              >
                <Plus size={16} />
                <span>Add New {currentView.slice(0, -1)}</span>
              </button>
            </div>
          </div>

          {/* Content based on view */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden">
            {/* Users View */}
            {currentView === 'users' && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('name')}
                        >
                          Name
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('email')}
                        >
                          Email
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('role')}
                        >
                          Role
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">Groups</th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('lastLogin')}
                        >
                          Last Login
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('isActive')}
                        >
                          Status
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {getCurrentItems().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-slate-400">
                          No users found. Try a different search or add a new user.
                        </td>
                      </tr>
                    ) : (
                      getCurrentItems().map((user: User) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="table-cell px-4 py-4 font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </td>
                          <td className="table-cell px-4 py-4">{user.email}</td>
                          <td className="table-cell px-4 py-4">
                            <span className={getRoleColor(user.role)}>{user.role}</span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {user.groups.length > 0 ? (
                                user.groups.map(groupId => (
                                  <span key={groupId} className="badge badge-info">
                                    {getGroupNameById(groupId)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500">None</span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell px-4 py-4">{formatDate(user.lastLogin)}</td>
                          <td className="table-cell px-4 py-4">
                            <span className={user.isActive ? 'badge badge-success' : 'badge badge-error'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full dark:text-blue-400 dark:hover:bg-slate-700"
                                onClick={() => {
                                  setCurrentUser(user);
                                  setUserModalOpen(true);
                                }}
                                aria-label="Edit user"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-slate-700"
                                onClick={() => deleteUser(user.id)}
                                aria-label="Delete user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Groups View */}
            {currentView === 'groups' && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('name')}
                        >
                          Name
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('description')}
                        >
                          Description
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('type')}
                        >
                          Type
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">Permissions</th>
                      <th className="table-header px-4 py-3">Members</th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('createdAt')}
                        >
                          Created
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {getCurrentItems().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-slate-400">
                          No groups found. Try a different search or add a new group.
                        </td>
                      </tr>
                    ) : (
                      getCurrentItems().map((group: Group) => (
                        <tr key={group.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                          <td className="table-cell px-4 py-4 font-medium text-gray-900 dark:text-white">
                            {group.name}
                          </td>
                          <td className="table-cell px-4 py-4">{group.description}</td>
                          <td className="table-cell px-4 py-4">
                            <span className={group.type === 'internal' ? 'badge badge-info' : 'badge badge-warning'}>
                              {group.type}
                            </span>
                          </td>
                          <td className="table-cell px-4 py-4">
                            <div className="flex flex-wrap gap-1">
                              {group.permissions.length > 0 ? (
                                group.permissions.slice(0, 2).map(permId => (
                                  <span key={permId} className="badge">
                                    {getPermissionNameById(permId)}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 dark:text-slate-500">None</span>
                              )}
                              {group.permissions.length > 2 && (
                                <span className="badge">+{group.permissions.length - 2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="table-cell px-4 py-4">{group.members.length} members</td>
                          <td className="table-cell px-4 py-4">{formatDate(group.createdAt)}</td>
                          <td className="table-cell px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button 
                                className="p-1 text-blue-600 hover:bg-blue-100 rounded-full dark:text-blue-400 dark:hover:bg-slate-700"
                                onClick={() => {
                                  setCurrentGroup(group);
                                  setGroupModalOpen(true);
                                }}
                                aria-label="Edit group"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className="p-1 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-slate-700"
                                onClick={() => deleteGroup(group.id)}
                                aria-label="Delete group"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Permissions View */}
            {currentView === 'permissions' && (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('name')}
                        >
                          Name
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('description')}
                        >
                          Description
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('resource')}
                        >
                          Resource
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('action')}
                        >
                          Action
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">Used By</th>
                      <th className="table-header px-4 py-3">
                        <button 
                          className="flex items-center gap-1"
                          onClick={() => requestSort('createdAt')}
                        >
                          Created
                          <ArrowDownUp size={14} />
                        </button>
                      </th>
                      <th className="table-header px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {getCurrentItems().length === 0 ? (
                      <tr>
                        <td colSpan={7} className="table-cell text-center py-8 text-gray-500 dark:text-slate-400">
                          No permissions found. Try a different search or add a new permission.
                        </td>
                      </tr>
                    ) : (
                      getCurrentItems().map((permission: Permission) => {
                        // Calculate which groups use this permission
                        const usedByGroups = groups.filter(g => 
                          g.permissions.includes(permission.id)
                        ).length;
                        
                        return (
                          <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                            <td className="table-cell px-4 py-4 font-medium text-gray-900 dark:text-white">
                              {permission.name}
                            </td>
                            <td className="table-cell px-4 py-4">{permission.description}</td>
                            <td className="table-cell px-4 py-4">
                              <span className="badge badge-info">{permission.resource}</span>
                            </td>
                            <td className="table-cell px-4 py-4">
                              <span className={{
                                'create': 'badge badge-success',
                                'read': 'badge badge-info',
                                'update': 'badge badge-warning',
                                'delete': 'badge badge-error',
                                'manage': 'badge badge-error',
                              }[permission.action] || 'badge'}>
                                {permission.action}
                              </span>
                            </td>
                            <td className="table-cell px-4 py-4">{usedByGroups} groups</td>
                            <td className="table-cell px-4 py-4">{formatDate(permission.createdAt)}</td>
                            <td className="table-cell px-4 py-4">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="p-1 text-blue-600 hover:bg-blue-100 rounded-full dark:text-blue-400 dark:hover:bg-slate-700"
                                  onClick={() => {
                                    setCurrentPermission(permission);
                                    setPermissionModalOpen(true);
                                  }}
                                  aria-label="Edit permission"
                                >
                                  <Edit size={16} />
                                </button>
                                <button 
                                  className="p-1 text-red-600 hover:bg-red-100 rounded-full dark:text-red-400 dark:hover:bg-slate-700"
                                  onClick={() => deletePermission(permission.id)}
                                  aria-label="Delete permission"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {getTotalPages() > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 dark:border-slate-700">
                <div className="text-sm text-gray-500 dark:text-slate-400">
                  Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, {
                      'users': getFilteredUsers().length,
                      'groups': getFilteredGroups().length,
                      'permissions': getFilteredPermissions().length
                    }[currentView])}
                  </span> of{' '}
                  <span className="font-medium">{
                    {
                      'users': getFilteredUsers().length,
                      'groups': getFilteredGroups().length,
                      'permissions': getFilteredPermissions().length
                    }[currentView]
                  }</span> results
                </div>
                
                <div className="flex gap-1">
                  <button
                    className="btn btn-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-white disabled:opacity-50"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-white'}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    className="btn btn-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-white disabled:opacity-50"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === getTotalPages()}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 p-4 mt-auto border-t border-gray-200 dark:border-slate-700">
        <div className="container-fluid text-center text-gray-500 dark:text-slate-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Modals */}
      {/* User Modal */}
      <Modal 
        isOpen={userModalOpen} 
        onClose={() => { setUserModalOpen(false); setCurrentUser(null); }}
        title={currentUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleUserFormSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              className="input" 
              defaultValue={currentUser?.name || ''}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              className="input" 
              defaultValue={currentUser?.email || ''}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role</label>
            <select 
              id="role" 
              name="role" 
              className="input" 
              defaultValue={currentUser?.role || 'user'}
              required
            >
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Groups</label>
            <div className="mt-1 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-slate-600 rounded-md">
              {groups.map(group => (
                <div key={group.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`group-${group.id}`}
                    name="groups"
                    value={group.id}
                    defaultChecked={currentUser?.groups.includes(group.id)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor={`group-${group.id}`} className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                    {group.name} <span className="text-gray-400 dark:text-slate-500">({group.type})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <div className="flex items-center">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                defaultChecked={currentUser?.isActive !== false}
                className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                Active account
              </label>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              onClick={() => { setUserModalOpen(false); setCurrentUser(null); }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Group Modal */}
      <Modal 
        isOpen={groupModalOpen} 
        onClose={() => { setGroupModalOpen(false); setCurrentGroup(null); }}
        title={currentGroup ? 'Edit Group' : 'Add New Group'}
      >
        <form onSubmit={handleGroupFormSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              className="input" 
              defaultValue={currentGroup?.name || ''}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea 
              id="description" 
              name="description" 
              className="input" 
              defaultValue={currentGroup?.description || ''}
              rows={2}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="type">Type</label>
            <select 
              id="type" 
              name="type" 
              className="input" 
              defaultValue={currentGroup?.type || 'internal'}
              required
            >
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>
          
          <div className="form-group">
            <label className="form-label">Permissions</label>
            <div className="mt-1 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-slate-600 rounded-md">
              {permissions.map(permission => (
                <div key={permission.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`permission-${permission.id}`}
                    name="permissions"
                    value={permission.id}
                    defaultChecked={currentGroup?.permissions.includes(permission.id)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor={`permission-${permission.id}`} className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                    {permission.name} <span className="text-gray-400 dark:text-slate-500">({permission.resource})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Members</label>
            <div className="mt-1 space-y-2 max-h-40 overflow-y-auto p-2 border border-gray-300 dark:border-slate-600 rounded-md">
              {users.map(user => (
                <div key={user.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`member-${user.id}`}
                    name="members"
                    value={user.id}
                    defaultChecked={currentGroup?.members.includes(user.id)}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                  />
                  <label htmlFor={`member-${user.id}`} className="ml-2 text-sm text-gray-700 dark:text-slate-300">
                    {user.name} <span className="text-gray-400 dark:text-slate-500">({user.email})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              onClick={() => { setGroupModalOpen(false); setCurrentGroup(null); }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentGroup ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Permission Modal */}
      <Modal 
        isOpen={permissionModalOpen} 
        onClose={() => { setPermissionModalOpen(false); setCurrentPermission(null); }}
        title={currentPermission ? 'Edit Permission' : 'Add New Permission'}
      >
        <form onSubmit={handlePermissionFormSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              className="input" 
              defaultValue={currentPermission?.name || ''}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea 
              id="description" 
              name="description" 
              className="input" 
              defaultValue={currentPermission?.description || ''}
              rows={2}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="resource">Resource</label>
            <input 
              id="resource" 
              name="resource" 
              type="text" 
              className="input" 
              defaultValue={currentPermission?.resource || ''}
              list="resources"
              required 
            />
            <datalist id="resources">
              {getUniqueResourceTypes().map(resource => (
                <option key={resource} value={resource} />
              ))}
            </datalist>
          </div>
          
          <div className="form-group">
            <label className="form-label" htmlFor="action">Action</label>
            <select 
              id="action" 
              name="action" 
              className="input" 
              defaultValue={currentPermission?.action || 'read'}
              required
            >
              <option value="create">Create</option>
              <option value="read">Read</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="manage">Manage (All)</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              onClick={() => { setPermissionModalOpen(false); setCurrentPermission(null); }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {currentPermission ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;