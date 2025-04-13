import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Calendar, Folder, Edit, Trash2, Download, X, FileText, Clock, BookOpen, ChevronDown, ChevronUp, Moon, Sun, Filter, Tag } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import styles from './styles/styles.module.css';

// Define types
interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  objectives: string[];
  materials: string[];
  procedure: string;
  assessment: string;
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  favorite: boolean;
}

interface Resource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'link' | 'other';
  url: string;
  tags: string[];
  description: string;
  uploadedAt: string;
  favorite: boolean;
  lessonPlanIds: string[];
}

interface Stats {
  totalLessonPlans: number;
  totalResources: number;
  lessonPlansBySubject: {
    name: string;
    value: number;
  }[];
  lessonPlansByGrade: {
    name: string;
    value: number;
  }[];
  recentActivity: {
    date: string;
    count: number;
  }[];
}

type ActiveTab = 'lesson-plans' | 'resources' | 'dashboard';
type FilterOption = 'all' | 'documents' | 'images' | 'videos' | 'links' | 'favorites';

const App: React.FC = () => {
  // State variables
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showLessonPlanModal, setShowLessonPlanModal] = useState<boolean>(false);
  const [showResourceModal, setShowResourceModal] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<{id: string, type: 'lessonPlan' | 'resource'} | null>(null);
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [resourceFilter, setResourceFilter] = useState<FilterOption>('all');
  const [stats, setStats] = useState<Stats>({
    totalLessonPlans: 0,
    totalResources: 0,
    lessonPlansBySubject: [],
    lessonPlansByGrade: [],
    recentActivity: []
  });

  // Refs
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Template data for initial state
  const sampleLessonPlans: LessonPlan[] = [
    {
      id: '1',
      title: 'Introduction to Photosynthesis',
      subject: 'Science',
      grade: '5',
      duration: 45,
      objectives: ['Understand the process of photosynthesis', 'Identify the parts of a plant involved in photosynthesis'],
      materials: ['Plant diagrams', 'Colored pencils', 'Worksheet'],
      procedure: 'Begin with a brief discussion about plants and how they get energy. Introduce the concept of photosynthesis with visual aids.',
      assessment: 'Students will complete a worksheet labeling the parts of a plant involved in photosynthesis.',
      notes: 'Consider bringing in a real plant for demonstration.',
      tags: ['science', 'plants', 'biology'],
      createdAt: '2023-03-15T10:30:00Z',
      updatedAt: '2023-03-20T14:15:00Z',
      favorite: true
    },
    {
      id: '2',
      title: 'Multiplication Facts Practice',
      subject: 'Math',
      grade: '3',
      duration: 30,
      objectives: ['Practice multiplication facts up to 10x10', 'Improve mental math skills'],
      materials: ['Multiplication flashcards', 'Worksheets', 'Math games'],
      procedure: 'Start with a quick flashcard review. Then have students work in pairs on multiplication games.',
      assessment: 'Timed multiplication quiz at the end of class.',
      notes: 'Some students may need additional support. Have extra practice sheets ready.',
      tags: ['math', 'multiplication', 'elementary'],
      createdAt: '2023-04-05T09:00:00Z',
      updatedAt: '2023-04-10T11:20:00Z',
      favorite: false
    },
    {
      id: '3',
      title: 'The Writing Process',
      subject: 'English',
      grade: '4',
      duration: 60,
      objectives: ['Understand the steps of the writing process', 'Begin planning a short story'],
      materials: ['Writing process handout', 'Story planning worksheet', 'Example stories'],
      procedure: 'Introduce the steps of the writing process. Model each step using an example. Have students begin planning their own stories.',
      assessment: 'Students will submit their story plans for review.',
      notes: 'This is part 1 of a 3-part lesson on writing stories.',
      tags: ['english', 'writing', 'creativity'],
      createdAt: '2023-05-02T13:00:00Z',
      updatedAt: '2023-05-05T10:45:00Z',
      favorite: true
    }
  ];

  const sampleResources: Resource[] = [
    {
      id: '1',
      name: 'Photosynthesis Diagram',
      type: 'image',
      url: 'https://example.com/photosynthesis.jpg',
      tags: ['science', 'plants', 'photosynthesis'],
      description: 'Detailed diagram showing the process of photosynthesis in plants',
      uploadedAt: '2023-03-14T08:30:00Z',
      favorite: true,
      lessonPlanIds: ['1']
    },
    {
      id: '2',
      name: 'Multiplication Tables Chart',
      type: 'document',
      url: 'https://example.com/multiplication.pdf',
      tags: ['math', 'multiplication'],
      description: 'Printable multiplication tables from 1 to 12',
      uploadedAt: '2023-04-02T15:45:00Z',
      favorite: false,
      lessonPlanIds: ['2']
    },
    {
      id: '3',
      name: 'Writing Process Video',
      type: 'video',
      url: 'https://example.com/writing-process.mp4',
      tags: ['english', 'writing'],
      description: 'Educational video explaining the 5 steps of the writing process',
      uploadedAt: '2023-04-30T11:20:00Z',
      favorite: true,
      lessonPlanIds: ['3']
    },
    {
      id: '4',
      name: 'Grammar Rules Reference',
      type: 'document',
      url: 'https://example.com/grammar.pdf',
      tags: ['english', 'grammar', 'reference'],
      description: 'Comprehensive reference guide for grammar rules',
      uploadedAt: '2023-05-10T09:15:00Z',
      favorite: false,
      lessonPlanIds: []
    },
    {
      id: '5',
      name: 'Educational Games Website',
      type: 'link',
      url: 'https://educationalgames.com',
      tags: ['games', 'interactive', 'general'],
      description: 'Website with various educational games for different subjects',
      uploadedAt: '2023-05-15T14:30:00Z',
      favorite: true,
      lessonPlanIds: []
    }
  ];

  // Dark mode toggle effect
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = savedMode ? savedMode === 'true' : prefersDark;
    
    setDarkMode(initialDarkMode);
    
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Load data from local storage or use sample data
  useEffect(() => {
    const savedLessonPlans = localStorage.getItem('lessonPlans');
    const savedResources = localStorage.getItem('resources');
    
    if (savedLessonPlans) {
      setLessonPlans(JSON.parse(savedLessonPlans));
    } else {
      setLessonPlans(sampleLessonPlans);
    }
    
    if (savedResources) {
      setResources(JSON.parse(savedResources));
    } else {
      setResources(sampleResources);
    }
  }, []);

  // Update stats whenever lessonPlans or resources change
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
    localStorage.setItem('resources', JSON.stringify(resources));
    
    // Update statistics
    updateStats();
  }, [lessonPlans, resources]);

  // Close modal on escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowLessonPlanModal(false);
        setShowResourceModal(false);
        setShowDeleteConfirmModal(false);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Update statistics
  const updateStats = () => {
    // Get counts by subject
    const subjectCounts: {[key: string]: number} = {};
    lessonPlans.forEach(plan => {
      subjectCounts[plan.subject] = (subjectCounts[plan.subject] || 0) + 1;
    });
    
    // Get counts by grade
    const gradeCounts: {[key: string]: number} = {};
    lessonPlans.forEach(plan => {
      gradeCounts[plan.grade] = (gradeCounts[plan.grade] || 0) + 1;
    });
    
    // Get recent activity (last 7 days)
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const activityData: {[key: string]: number} = {};
    
    // Add dates for the past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      activityData[dateString] = 0;
    }
    
    // Count activities
    [...lessonPlans, ...resources].forEach(item => {
      const date = new Date(item.updatedAt || item.uploadedAt);
      if (date >= sevenDaysAgo) {
        const dateString = date.toISOString().split('T')[0];
        activityData[dateString] = (activityData[dateString] || 0) + 1;
      }
    });
    
    // Convert to arrays for charts
    const subjectData = Object.entries(subjectCounts).map(([name, value]) => ({ name, value }));
    const gradeData = Object.entries(gradeCounts).map(([name, value]) => ({ name, value }));
    const activityArray = Object.entries(activityData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    setStats({
      totalLessonPlans: lessonPlans.length,
      totalResources: resources.length,
      lessonPlansBySubject: subjectData,
      lessonPlansByGrade: gradeData,
      recentActivity: activityArray
    });
  };

  // Sort lesson plans
  const sortedLessonPlans = [...lessonPlans].sort((a, b) => {
    let valueA, valueB;
    
    // Handle different sort fields
    if (sortBy === 'updatedAt' || sortBy === 'createdAt') {
      valueA = new Date(a[sortBy]).getTime();
      valueB = new Date(b[sortBy]).getTime();
    } else if (sortBy === 'duration') {
      valueA = a.duration;
      valueB = b.duration;
    } else {
      valueA = a[sortBy as keyof LessonPlan]?.toString().toLowerCase() || '';
      valueB = b[sortBy as keyof LessonPlan]?.toString().toLowerCase() || '';
    }
    
    // Apply sort direction
    return sortDirection === 'asc' 
      ? (valueA > valueB ? 1 : -1)
      : (valueA < valueB ? 1 : -1);
  });

  // Filter and sort resources
  const filteredResources = [...resources].filter(resource => {
    if (resourceFilter === 'all') return true;
    if (resourceFilter === 'favorites') return resource.favorite;
    return resource.type === resourceFilter;
  }).sort((a, b) => {
    const dateA = new Date(a.uploadedAt).getTime();
    const dateB = new Date(b.uploadedAt).getTime();
    return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
  });

  // Search functionality
  const filteredLessonPlans = sortedLessonPlans.filter(plan => {
    const searchFields = `${plan.title} ${plan.subject} ${plan.grade} ${plan.tags.join(' ')}`;
    return searchFields.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const searchedResources = filteredResources.filter(resource => {
    const searchFields = `${resource.name} ${resource.description} ${resource.tags.join(' ')}`;
    return searchFields.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle sorting change
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  // Open lesson plan modal for creating or editing
  const openLessonPlanModal = (lessonPlan?: LessonPlan) => {
    if (lessonPlan) {
      setSelectedLessonPlan(lessonPlan);
      setIsEditing(true);
    } else {
      setSelectedLessonPlan({
        id: Date.now().toString(),
        title: '',
        subject: '',
        grade: '',
        duration: 30,
        objectives: [''],
        materials: [''],
        procedure: '',
        assessment: '',
        notes: '',
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        favorite: false
      });
      setIsEditing(false);
    }
    setShowLessonPlanModal(true);
  };

  // Open resource modal for creating or editing
  const openResourceModal = (resource?: Resource) => {
    if (resource) {
      setSelectedResource(resource);
      setIsEditing(true);
    } else {
      setSelectedResource({
        id: Date.now().toString(),
        name: '',
        type: 'document',
        url: '',
        tags: [],
        description: '',
        uploadedAt: new Date().toISOString(),
        favorite: false,
        lessonPlanIds: []
      });
      setIsEditing(false);
    }
    setShowResourceModal(true);
  };

  // Handle save lesson plan
  const handleSaveLessonPlan = () => {
    if (!selectedLessonPlan) return;
    
    const updatedLessonPlan = {
      ...selectedLessonPlan,
      updatedAt: new Date().toISOString()
    };
    
    if (isEditing) {
      setLessonPlans(lessonPlans.map(plan => 
        plan.id === updatedLessonPlan.id ? updatedLessonPlan : plan
      ));
    } else {
      setLessonPlans([...lessonPlans, updatedLessonPlan]);
    }
    
    setShowLessonPlanModal(false);
  };

  // Handle save resource
  const handleSaveResource = () => {
    if (!selectedResource) return;
    
    if (isEditing) {
      setResources(resources.map(resource => 
        resource.id === selectedResource.id ? selectedResource : resource
      ));
    } else {
      setResources([...resources, selectedResource]);
    }
    
    setShowResourceModal(false);
  };

  // Handle delete confirmation
  const confirmDelete = (id: string, type: 'lessonPlan' | 'resource') => {
    setItemToDelete({ id, type });
    setShowDeleteConfirmModal(true);
  };

  // Handle delete action
  const handleDelete = () => {
    if (!itemToDelete) return;
    
    if (itemToDelete.type === 'lessonPlan') {
      setLessonPlans(lessonPlans.filter(plan => plan.id !== itemToDelete.id));
      
      // Also update any resources that reference this lesson plan
      setResources(resources.map(resource => ({
        ...resource,
        lessonPlanIds: resource.lessonPlanIds.filter(id => id !== itemToDelete.id)
      })));
    } else {
      setResources(resources.filter(resource => resource.id !== itemToDelete.id));
    }
    
    setShowDeleteConfirmModal(false);
    setItemToDelete(null);
  };

  // Handle favorite toggle
  const toggleFavorite = (id: string, type: 'lessonPlan' | 'resource') => {
    if (type === 'lessonPlan') {
      setLessonPlans(lessonPlans.map(plan => 
        plan.id === id ? { ...plan, favorite: !plan.favorite } : plan
      ));
    } else {
      setResources(resources.map(resource => 
        resource.id === id ? { ...resource, favorite: !resource.favorite } : resource
      ));
    }
  };

  // Download lesson plan as text file
  const downloadLessonPlan = (lessonPlan: LessonPlan) => {
    const content = `# ${lessonPlan.title}

Subject: ${lessonPlan.subject}
Grade: ${lessonPlan.grade}
Duration: ${lessonPlan.duration} minutes

## Objectives
${lessonPlan.objectives.map(obj => `- ${obj}`).join('\n')}

## Materials
${lessonPlan.materials.map(mat => `- ${mat}`).join('\n')}

## Procedure
${lessonPlan.procedure}

## Assessment
${lessonPlan.assessment}

## Notes
${lessonPlan.notes}

## Tags
${lessonPlan.tags.join(', ')}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonPlan.title.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Update lesson plan field
  const updateLessonPlanField = (field: keyof LessonPlan, value: any) => {
    if (!selectedLessonPlan) return;
    setSelectedLessonPlan({
      ...selectedLessonPlan,
      [field]: value
    });
  };

  // Update resource field
  const updateResourceField = (field: keyof Resource, value: any) => {
    if (!selectedResource) return;
    setSelectedResource({
      ...selectedResource,
      [field]: value
    });
  };

  // Handle array fields in lesson plans (objectives, materials)
  const handleArrayField = (field: 'objectives' | 'materials', index: number, value: string) => {
    if (!selectedLessonPlan) return;
    
    const newArray = [...selectedLessonPlan[field]];
    newArray[index] = value;
    
    updateLessonPlanField(field, newArray);
  };

  // Add new item to array field
  const addArrayItem = (field: 'objectives' | 'materials') => {
    if (!selectedLessonPlan) return;
    updateLessonPlanField(field, [...selectedLessonPlan[field], '']);
  };

  // Remove item from array field
  const removeArrayItem = (field: 'objectives' | 'materials', index: number) => {
    if (!selectedLessonPlan) return;
    const newArray = selectedLessonPlan[field].filter((_, i) => i !== index);
    updateLessonPlanField(field, newArray);
  };

  // Handle tags input
  const handleTagsInput = (event: React.KeyboardEvent<HTMLInputElement>, type: 'lessonPlan' | 'resource') => {
    const input = event.target as HTMLInputElement;
    
    if (event.key === 'Enter' && input.value.trim()) {
      event.preventDefault();
      const newTag = input.value.trim().toLowerCase();
      
      if (type === 'lessonPlan' && selectedLessonPlan) {
        if (!selectedLessonPlan.tags.includes(newTag)) {
          updateLessonPlanField('tags', [...selectedLessonPlan.tags, newTag]);
        }
      } else if (type === 'resource' && selectedResource) {
        if (!selectedResource.tags.includes(newTag)) {
          updateResourceField('tags', [...selectedResource.tags, newTag]);
        }
      }
      
      input.value = '';
    }
  };

  // Remove tag
  const removeTag = (tagIndex: number, type: 'lessonPlan' | 'resource') => {
    if (type === 'lessonPlan' && selectedLessonPlan) {
      const newTags = selectedLessonPlan.tags.filter((_, i) => i !== tagIndex);
      updateLessonPlanField('tags', newTags);
    } else if (type === 'resource' && selectedResource) {
      const newTags = selectedResource.tags.filter((_, i) => i !== tagIndex);
      updateResourceField('tags', newTags);
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Get resource type icon
  const getResourceTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'document': return <FileText size={18} />;
      case 'image': return <img className="w-4 h-4" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIi8+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiLz48cG9seWxpbmUgcG9pbnRzPSIyMSAxNSAxNiAxMCA1IDIxIi8+PC9zdmc+" alt="Image" />;
      case 'video': return <img className="w-4 h-4" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxyZWN0IHg9IjIiIHk9IjIiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcng9IjIuMTgiIHJ5PSIyLjE4Ii8+PHBvbHlnb24gcG9pbnRzPSIxMCAxNiAxNiAxMiAxMCA4IDEwIDE2Ii8+PC9zdmc+" alt="Video" />;
      case 'link': return <img className="w-4 h-4" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik0xMCAxM2E1IDUgMCAwIDAgNy41NCAwbDMtM2E1IDUgMCAwIDAtNy4wNy03LjA3bC0xLjcyIDEuNzEiLz48cGF0aCBkPSJNMTQgMTFhNSA1IDAgMCAwLTcuNTQgMGwtMyAzYTUgNSAwIDAgMCA3LjA3IDcuMDdsMS43MS0xLjcxIi8+PC9zdmc+" alt="Link" />;
      default: return <Folder size={18} />;
    }
  };

  // Get color for chart sections
  const getChartColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    return colors[index % colors.length];
  };

  // Render the dashboard tab
  const renderDashboard = () => (
    <div className="space-y-6 p-4">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-title">Total Lesson Plans</div>
          <div className="stat-value">{stats.totalLessonPlans}</div>
          <div className="stat-desc">Across all subjects and grades</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Total Resources</div>
          <div className="stat-value">{stats.totalResources}</div>
          <div className="stat-desc">Documents, images, videos, and links</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Favorite Lesson Plans</div>
          <div className="stat-value">{lessonPlans.filter(plan => plan.favorite).length}</div>
          <div className="stat-desc">Your most important content</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-title">Favorite Resources</div>
          <div className="stat-value">{resources.filter(resource => resource.favorite).length}</div>
          <div className="stat-desc">Quick access materials</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity Chart */}
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: darkMode ? '#1e293b' : '#fff',
                    color: darkMode ? '#e5e7eb' : '#1f2937',
                    border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb' 
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  name="Items" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subjects Distribution Chart */}
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Lesson Plans by Subject</h3>
          <div className="h-64 flex items-center justify-center">
            {stats.lessonPlansBySubject.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.lessonPlansBySubject}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.lessonPlansBySubject.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getChartColor(index)} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} lesson plans`, 'Count']}
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#1e293b' : '#fff',
                      color: darkMode ? '#e5e7eb' : '#1f2937',
                      border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Lesson Plans */}
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Recent Lesson Plans</h3>
          <div className="space-y-3">
            {lessonPlans
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map(plan => (
                <div key={plan.id} className="flex items-center justify-between p-2 border-b dark:border-gray-700">
                  <div>
                    <h4 className="font-medium">{plan.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{plan.subject} - Grade {plan.grade}</p>
                  </div>
                  <button 
                    onClick={() => openLessonPlanModal(plan)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View
                  </button>
                </div>
              ))}
            {lessonPlans.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No lesson plans yet</p>
            )}
          </div>
        </div>

        {/* Recent Resources */}
        <div className="card p-4">
          <h3 className="text-lg font-medium mb-4">Recent Resources</h3>
          <div className="space-y-3">
            {resources
              .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
              .slice(0, 5)
              .map(resource => (
                <div key={resource.id} className="flex items-center justify-between p-2 border-b dark:border-gray-700">
                  <div className="flex items-center">
                    <span className="mr-2">{getResourceTypeIcon(resource.type)}</span>
                    <div>
                      <h4 className="font-medium">{resource.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{resource.type}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => openResourceModal(resource)}
                    className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    View
                  </button>
                </div>
              ))}
            {resources.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400">No resources yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render the lesson plans tab
  const renderLessonPlans = () => (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Search lesson plans..."
            className="input pl-10 pr-4 py-2 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        <button
          onClick={() => openLessonPlanModal()}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>New Lesson Plan</span>
        </button>
      </div>

      {/* Lesson Plans List */}
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr className="table-header">
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center">
                  Title
                  {sortBy === 'title' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('subject')}>
                <div className="flex items-center">
                  Subject
                  {sortBy === 'subject' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer" onClick={() => handleSort('grade')}>
                <div className="flex items-center">
                  Grade
                  {sortBy === 'grade' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="p-3 text-left cursor-pointer hidden sm:table-cell" onClick={() => handleSort('duration')}>
                <div className="flex items-center">
                  Duration
                  {sortBy === 'duration' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="p-3 text-left hidden lg:table-cell">Tags</th>
              <th className="p-3 text-left cursor-pointer hidden md:table-cell" onClick={() => handleSort('updatedAt')}>
                <div className="flex items-center">
                  Updated
                  {sortBy === 'updatedAt' && (
                    sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </div>
              </th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            {filteredLessonPlans.length > 0 ? (
              filteredLessonPlans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                  <td className="p-3 text-sm">
                    <div className="flex items-center">
                      <span className="mr-2 cursor-pointer" onClick={() => toggleFavorite(plan.id, 'lessonPlan')}>
                        {plan.favorite ? (
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        )}
                      </span>
                      <span className="font-medium">{plan.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{plan.subject}</td>
                  <td className="p-3 text-sm">{plan.grade}</td>
                  <td className="p-3 text-sm hidden sm:table-cell">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      <span>{plan.duration} min</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm hidden lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {plan.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                          {tag}
                        </span>
                      ))}
                      {plan.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300">
                          +{plan.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-sm hidden md:table-cell">{formatDate(plan.updatedAt)}</td>
                  <td className="p-3 text-sm">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openLessonPlanModal(plan)}
                        className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        aria-label="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => downloadLessonPlan(plan)}
                        className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        aria-label="Download"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        onClick={() => confirmDelete(plan.id, 'lessonPlan')}
                        className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No lesson plans match your search' : 'No lesson plans yet. Create your first one!'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render the resources tab
  const renderResources = () => (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search resources..."
              className="input pl-10 pr-4 py-2 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <div className="relative">
            <select
              className="input py-2 pl-9 pr-8 appearance-none bg-white dark:bg-slate-800"
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value as FilterOption)}
            >
              <option value="all">All Types</option>
              <option value="documents">Documents</option>
              <option value="images">Images</option>
              <option value="videos">Videos</option>
              <option value="links">Links</option>
              <option value="favorites">Favorites</option>
            </select>
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        <button
          onClick={() => openResourceModal()}
          className="btn btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>New Resource</span>
        </button>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {searchedResources.length > 0 ? (
          searchedResources.map(resource => (
            <div key={resource.id} className="card hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <span className="mr-2">{getResourceTypeIcon(resource.type)}</span>
                  <h3 className="text-lg font-medium truncate" title={resource.name}>{resource.name}</h3>
                </div>
                <span 
                  className="cursor-pointer" 
                  onClick={() => toggleFavorite(resource.id, 'resource')}
                >
                  {resource.favorite ? (
                    <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-gray-400 hover:text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  )}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-2" title={resource.description}>
                {resource.description || 'No description available'}
              </p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {resource.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                    <Tag size={12} className="mr-1" />
                    {tag}
                  </span>
                ))}
                {resource.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300">
                    +{resource.tags.length - 3}
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Added: {new Date(resource.uploadedAt).toLocaleDateString()}</span>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => openResourceModal(resource)} 
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    aria-label="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => confirmDelete(resource.id, 'resource')} 
                    className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full p-4 text-center text-gray-500 dark:text-gray-400">
            {searchTerm || resourceFilter !== 'all' ? 'No resources match your filters' : 'No resources yet. Add your first one!'}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <BookOpen className="mr-2 text-primary-600 dark:text-primary-400" size={28} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Educator's Workbench</h1>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          <div className="mt-4 border-b border-gray-200 dark:border-slate-700">
            <nav className="flex space-x-8">
              <button
                className={`${styles.tabButton} ${activeTab === 'dashboard' ? styles.activeTabButton : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'lesson-plans' ? styles.activeTabButton : ''}`}
                onClick={() => setActiveTab('lesson-plans')}
              >
                Lesson Plans
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'resources' ? styles.activeTabButton : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                Resources
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid my-6">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'lesson-plans' && renderLessonPlans()}
        {activeTab === 'resources' && renderResources()}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 shadow-inner py-4 mt-auto theme-transition">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </div>
      </footer>

      {/* Lesson Plan Modal */}
      {showLessonPlanModal && selectedLessonPlan && (
        <div className="modal-backdrop" onClick={() => setShowLessonPlanModal(false)}>
          <div 
            className="modal-content max-w-3xl" 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowLessonPlanModal(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input 
                  id="title" 
                  type="text" 
                  className="input" 
                  value={selectedLessonPlan.title} 
                  onChange={(e) => updateLessonPlanField('title', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="subject">Subject</label>
                <input 
                  id="subject" 
                  type="text" 
                  className="input" 
                  value={selectedLessonPlan.subject} 
                  onChange={(e) => updateLessonPlanField('subject', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="grade">Grade Level</label>
                <input 
                  id="grade" 
                  type="text" 
                  className="input" 
                  value={selectedLessonPlan.grade} 
                  onChange={(e) => updateLessonPlanField('grade', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="duration">Duration (minutes)</label>
                <input 
                  id="duration" 
                  type="number" 
                  min="1"
                  className="input" 
                  value={selectedLessonPlan.duration} 
                  onChange={(e) => updateLessonPlanField('duration', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label">Learning Objectives</label>
                {selectedLessonPlan.objectives.map((objective, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input flex-grow"
                      value={objective}
                      onChange={(e) => handleArrayField('objectives', index, e.target.value)}
                      placeholder="Enter a learning objective"
                    />
                    <button
                      type="button"
                      className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      onClick={() => removeArrayItem('objectives', index)}
                      aria-label="Remove objective"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 mt-2"
                  onClick={() => addArrayItem('objectives')}
                >
                  Add Objective
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label">Materials Needed</label>
                {selectedLessonPlan.materials.map((material, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="input flex-grow"
                      value={material}
                      onChange={(e) => handleArrayField('materials', index, e.target.value)}
                      placeholder="Enter a material"
                    />
                    <button
                      type="button"
                      className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                      onClick={() => removeArrayItem('materials', index)}
                      aria-label="Remove material"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800 mt-2"
                  onClick={() => addArrayItem('materials')}
                >
                  Add Material
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label" htmlFor="procedure">Procedure</label>
                <textarea
                  id="procedure"
                  rows={5}
                  className="input"
                  value={selectedLessonPlan.procedure}
                  onChange={(e) => updateLessonPlanField('procedure', e.target.value)}
                  placeholder="Describe the procedure of your lesson"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label" htmlFor="assessment">Assessment</label>
                <textarea
                  id="assessment"
                  rows={3}
                  className="input"
                  value={selectedLessonPlan.assessment}
                  onChange={(e) => updateLessonPlanField('assessment', e.target.value)}
                  placeholder="How will you assess student learning?"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label" htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  rows={3}
                  className="input"
                  value={selectedLessonPlan.notes}
                  onChange={(e) => updateLessonPlanField('notes', e.target.value)}
                  placeholder="Any additional notes or reflections"
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label" htmlFor="tags">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedLessonPlan.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                      <button 
                        type="button" 
                        className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                        onClick={() => removeTag(index, 'lessonPlan')}
                        aria-label="Remove tag"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  id="tags"
                  className="input"
                  placeholder="Type a tag and press Enter"
                  onKeyDown={(e) => handleTagsInput(e, 'lessonPlan')}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                onClick={() => setShowLessonPlanModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveLessonPlan}
              >
                {isEditing ? 'Update' : 'Create'} Lesson Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resource Modal */}
      {showResourceModal && selectedResource && (
        <div className="modal-backdrop" onClick={() => setShowResourceModal(false)}>
          <div 
            className="modal-content max-w-lg" 
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowResourceModal(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Resource Name</label>
                <input 
                  id="name" 
                  type="text" 
                  className="input" 
                  value={selectedResource.name} 
                  onChange={(e) => updateResourceField('name', e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="type">Resource Type</label>
                <select
                  id="type"
                  className="input"
                  value={selectedResource.type}
                  onChange={(e) => updateResourceField('type', e.target.value as Resource['type'])}
                >
                  <option value="document">Document</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="link">Link</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="url">URL / Link</label>
                <input 
                  id="url" 
                  type="text" 
                  className="input" 
                  value={selectedResource.url} 
                  onChange={(e) => updateResourceField('url', e.target.value)}
                  placeholder="Enter URL or link to resource"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows={3}
                  className="input"
                  value={selectedResource.description}
                  onChange={(e) => updateResourceField('description', e.target.value)}
                  placeholder="Describe this resource"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="resource-tags">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedResource.tags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full dark:bg-blue-900 dark:text-blue-200"
                    >
                      {tag}
                      <button 
                        type="button" 
                        className="text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
                        onClick={() => removeTag(index, 'resource')}
                        aria-label="Remove tag"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  id="resource-tags"
                  className="input"
                  placeholder="Type a tag and press Enter"
                  onKeyDown={(e) => handleTagsInput(e, 'resource')}
                />
              </div>
              
              <div className="form-group">
                <div className="flex items-center">
                  <input
                    id="favorite"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={selectedResource.favorite}
                    onChange={(e) => updateResourceField('favorite', e.target.checked)}
                  />
                  <label htmlFor="favorite" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    Mark as favorite
                  </label>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                onClick={() => setShowResourceModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSaveResource}
              >
                {isEditing ? 'Update' : 'Add'} Resource
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteConfirmModal(false)}>
          <div 
            className="modal-content max-w-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Confirm Deletion
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                onClick={() => setShowDeleteConfirmModal(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
            <p className="my-4 text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this {itemToDelete?.type === 'lessonPlan' ? 'lesson plan' : 'resource'}? This action cannot be undone.
            </p>
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600" 
                onClick={() => setShowDeleteConfirmModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn bg-red-600 text-white hover:bg-red-700 focus:ring-red-500" 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;