import React, { useState, useEffect } from 'react';
import { Check, Plus, Search, Trash2, Calendar, Clock, X, Edit, Filter, ArrowDownUp, BookOpen, Download, FileText, Upload, Pencil, FolderOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import styles from './styles/styles.module.css';

// Types
interface LessonPlan {
  id: string;
  title: string;
  subject: string;
  grade: string;
  duration: number;
  objectives: string[];
  materials: string[];
  activities: Activity[];
  assessment: string;
  notes: string;
  createdAt: string;
  lastUpdated: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
}

interface Activity {
  id: string;
  title: string;
  description: string;
  duration: number;
  materialIds?: string[];
}

interface TeachingMaterial {
  id: string;
  title: string;
  type: 'document' | 'presentation' | 'worksheet' | 'video' | 'audio' | 'image' | 'other';
  description: string;
  fileUrl?: string;
  fileData?: string; // For storing file content as base64
  tags: string[];
  createdAt: string;
  lastUpdated: string;
}

interface SubjectStat {
  subject: string;
  count: number;
}

// Enums
enum ViewMode {
  Calendar = 'calendar',
  List = 'list',
}

enum ActiveTab {
  LessonPlans = 'lessonPlans',
  Materials = 'materials',
  Dashboard = 'dashboard',
}

function App() {
  // State
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.LessonPlans);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.List);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterGrade, setFilterGrade] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showNewLessonModal, setShowNewLessonModal] = useState<boolean>(false);
  const [showNewMaterialModal, setShowNewMaterialModal] = useState<boolean>(false);
  const [showLessonDetailModal, setShowLessonDetailModal] = useState<boolean>(false);
  const [showMaterialDetailModal, setShowMaterialDetailModal] = useState<boolean>(false);
  const [currentLessonPlan, setCurrentLessonPlan] = useState<LessonPlan | null>(null);
  const [currentMaterial, setCurrentMaterial] = useState<TeachingMaterial | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [stats, setStats] = useState<{ subjects: SubjectStat[], totalLessons: number, totalMaterials: number }>({ 
    subjects: [], 
    totalLessons: 0, 
    totalMaterials: 0 
  });

  // Load data from localStorage
  useEffect(() => {
    // Theme detection
    const savedMode = localStorage.getItem('darkMode');
    const isDark = savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }

    // Load lesson plans
    const savedLessonPlans = localStorage.getItem('lessonPlans');
    if (savedLessonPlans) {
      setLessonPlans(JSON.parse(savedLessonPlans));
    } else {
      // Default lesson plans
      const defaultLessonPlans: LessonPlan[] = [
        {
          id: '1',
          title: 'Introduction to Photosynthesis',
          subject: 'Science',
          grade: '6',
          duration: 45,
          objectives: ['Explain the process of photosynthesis', 'Identify factors affecting photosynthesis'],
          materials: ['Textbook p.42-45', 'Plant diagram worksheet'],
          activities: [
            {
              id: 'a1',
              title: 'Warm-up discussion',
              description: 'Ask students what plants need to survive',
              duration: 5
            },
            {
              id: 'a2',
              title: 'Photosynthesis explanation',
              description: 'Use plant diagram to explain the process',
              duration: 15
            },
            {
              id: 'a3',
              title: 'Group activity',
              description: 'Students work in pairs to complete worksheet',
              duration: 20
            },
            {
              id: 'a4',
              title: 'Wrap-up',
              description: 'Review key concepts',
              duration: 5
            }
          ],
          assessment: 'Worksheet completion and participation in discussions',
          notes: 'Remember to bring actual plant samples if available',
          createdAt: '2025-01-15T09:00:00',
          lastUpdated: '2025-01-20T14:30:00',
          status: 'published',
          tags: ['photosynthesis', 'plants', 'biology']
        },
        {
          id: '2',
          title: 'Solving Linear Equations',
          subject: 'Mathematics',
          grade: '8',
          duration: 55,
          objectives: ['Understand how to solve linear equations', 'Apply equation solving to word problems'],
          materials: ['Algebra textbook', 'Practice worksheet'],
          activities: [
            {
              id: 'a1',
              title: 'Review previous concepts',
              description: 'Quick review of equation properties',
              duration: 10
            },
            {
              id: 'a2',
              title: 'Demonstration',
              description: 'Show step-by-step process of solving equations',
              duration: 15
            },
            {
              id: 'a3',
              title: 'Guided practice',
              description: 'Students solve equations with teacher assistance',
              duration: 15
            },
            {
              id: 'a4',
              title: 'Independent practice',
              description: 'Students work on worksheet problems',
              duration: 15
            }
          ],
          assessment: 'Completion of practice problems with 80% accuracy',
          notes: 'Be prepared for questions about negative numbers',
          createdAt: '2025-01-10T10:15:00',
          lastUpdated: '2025-01-18T11:20:00',
          status: 'published',
          tags: ['algebra', 'equations', 'linear']
        },
        {
          id: '3',
          title: 'Elements of Poetry',
          subject: 'English',
          grade: '7',
          duration: 50,
          objectives: ['Identify poetic devices', 'Analyze poem structure and meaning'],
          materials: ['Poetry handout', 'Selected poems for analysis'],
          activities: [
            {
              id: 'a1',
              title: 'Introduction to poetry',
              description: 'Discuss what makes poetry unique as a form of expression',
              duration: 10
            },
            {
              id: 'a2',
              title: 'Poetic devices presentation',
              description: 'Explain rhythm, rhyme, alliteration, etc.',
              duration: 15
            },
            {
              id: 'a3',
              title: 'Group analysis',
              description: 'Students work in groups to analyze assigned poems',
              duration: 20
            },
            {
              id: 'a4',
              title: 'Sharing insights',
              description: 'Groups share their analysis with the class',
              duration: 5
            }
          ],
          assessment: 'Quality of group analysis and participation',
          notes: 'Select poems appropriate for 7th grade reading level',
          createdAt: '2025-01-05T08:30:00',
          lastUpdated: '2025-01-15T13:45:00',
          status: 'draft',
          tags: ['poetry', 'literature', 'analysis']
        }
      ];
      setLessonPlans(defaultLessonPlans);
      localStorage.setItem('lessonPlans', JSON.stringify(defaultLessonPlans));
    }

    // Load materials
    const savedMaterials = localStorage.getItem('materials');
    if (savedMaterials) {
      setMaterials(JSON.parse(savedMaterials));
    } else {
      // Default materials
      const defaultMaterials: TeachingMaterial[] = [
        {
          id: 'm1',
          title: 'Photosynthesis Diagram',
          type: 'image',
          description: 'Visual diagram showing the process of photosynthesis',
          tags: ['science', 'biology', 'plants'],
          createdAt: '2025-01-10T09:30:00',
          lastUpdated: '2025-01-10T09:30:00'
        },
        {
          id: 'm2',
          title: 'Algebra Worksheets Bundle',
          type: 'worksheet',
          description: 'Collection of worksheets for practicing linear equations',
          tags: ['math', 'algebra', 'practice'],
          createdAt: '2025-01-08T14:20:00',
          lastUpdated: '2025-01-12T11:15:00'
        },
        {
          id: 'm3',
          title: 'Poetry Analysis Guide',
          type: 'document',
          description: 'Guide to help students analyze poetry including definitions of common poetic devices',
          tags: ['english', 'poetry', 'literature'],
          createdAt: '2025-01-03T15:45:00',
          lastUpdated: '2025-01-14T10:30:00'
        },
        {
          id: 'm4',
          title: 'Scientific Method Presentation',
          type: 'presentation',
          description: 'Slides explaining the steps of the scientific method with examples',
          tags: ['science', 'scientific method', 'research'],
          createdAt: '2024-12-15T13:20:00',
          lastUpdated: '2025-01-05T09:40:00'
        }
      ];
      setMaterials(defaultMaterials);
      localStorage.setItem('materials', JSON.stringify(defaultMaterials));
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('lessonPlans', JSON.stringify(lessonPlans));
  }, [lessonPlans]);

  useEffect(() => {
    localStorage.setItem('materials', JSON.stringify(materials));
  }, [materials]);

  // Calculate stats when data changes
  useEffect(() => {
    // Calculate subject statistics
    const subjectCounts: Record<string, number> = {};
    
    lessonPlans.forEach(plan => {
      if (subjectCounts[plan.subject]) {
        subjectCounts[plan.subject]++;
      } else {
        subjectCounts[plan.subject] = 1;
      }
    });
    
    const subjectStats: SubjectStat[] = Object.keys(subjectCounts).map(subject => ({
      subject,
      count: subjectCounts[subject]
    }));
    
    setStats({
      subjects: subjectStats,
      totalLessons: lessonPlans.length,
      totalMaterials: materials.length
    });
  }, [lessonPlans, materials]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Filter lesson plans
  const filteredLessonPlans = lessonPlans.filter(plan => {
    const matchesSearch = plan.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        plan.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = filterSubject === 'all' || plan.subject === filterSubject;
    const matchesGrade = filterGrade === 'all' || plan.grade === filterGrade;
    const matchesStatus = filterStatus === 'all' || plan.status === filterStatus;
    
    return matchesSearch && matchesSubject && matchesGrade && matchesStatus;
  });

  // Sort lesson plans
  const sortedLessonPlans = [...filteredLessonPlans].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'subject') {
      comparison = a.subject.localeCompare(b.subject);
    } else if (sortBy === 'grade') {
      comparison = parseInt(a.grade) - parseInt(b.grade);
    } else if (sortBy === 'duration') {
      comparison = a.duration - b.duration;
    } else if (sortBy === 'lastUpdated') {
      comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter materials
  const filteredMaterials = materials.filter(material => {
    return material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
           material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Sort materials
  const sortedMaterials = [...filteredMaterials].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'type') {
      comparison = a.type.localeCompare(b.type);
    } else if (sortBy === 'lastUpdated') {
      comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Get unique subjects for filter dropdown
  const subjects = Array.from(new Set(lessonPlans.map(plan => plan.subject)));
  
  // Get unique grades for filter dropdown
  const grades = Array.from(new Set(lessonPlans.map(plan => plan.grade)));

  // Create a new lesson plan
  const handleCreateLessonPlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const subject = formData.get('subject') as string;
    const grade = formData.get('grade') as string;
    const duration = parseInt(formData.get('duration') as string);
    const objectives = (formData.get('objectives') as string).split('\n').filter(obj => obj.trim() !== '');
    const materials = (formData.get('materials') as string).split('\n').filter(mat => mat.trim() !== '');
    const assessment = formData.get('assessment') as string;
    const notes = formData.get('notes') as string;
    const tagString = formData.get('tags') as string;
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    // Get activities from the form
    const activityTitles = formData.getAll('activityTitle') as string[];
    const activityDescriptions = formData.getAll('activityDescription') as string[];
    const activityDurations = formData.getAll('activityDuration') as string[];
    
    const activities = activityTitles.map((title, index) => ({
      id: `activity_${Date.now()}_${index}`,
      title,
      description: activityDescriptions[index],
      duration: parseInt(activityDurations[index]),
      materialIds: []
    }));
    
    const newLessonPlan: LessonPlan = {
      id: currentLessonPlan ? currentLessonPlan.id : `lesson_${Date.now()}`,
      title,
      subject,
      grade,
      duration,
      objectives,
      materials,
      activities,
      assessment,
      notes,
      createdAt: currentLessonPlan ? currentLessonPlan.createdAt : new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      status: (formData.get('status') as 'draft' | 'published' | 'archived'),
      tags
    };
    
    if (currentLessonPlan) {
      // Update existing lesson plan
      setLessonPlans(lessonPlans.map(plan => 
        plan.id === currentLessonPlan.id ? newLessonPlan : plan
      ));
    } else {
      // Create new lesson plan
      setLessonPlans([...lessonPlans, newLessonPlan]);
    }
    
    setShowNewLessonModal(false);
    setCurrentLessonPlan(null);
  };

  // Create a new material
  const handleCreateMaterial = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const title = formData.get('title') as string;
    const type = formData.get('type') as 'document' | 'presentation' | 'worksheet' | 'video' | 'audio' | 'image' | 'other';
    const description = formData.get('description') as string;
    const tagString = formData.get('tags') as string;
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    
    // Handle file upload if present
    const fileInput = form.querySelector('#materialFile') as HTMLInputElement;
    let fileData;
    
    if (fileInput?.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        fileData = event.target?.result as string;
        
        const newMaterial: TeachingMaterial = {
          id: currentMaterial ? currentMaterial.id : `material_${Date.now()}`,
          title,
          type,
          description,
          fileData,
          tags,
          createdAt: currentMaterial ? currentMaterial.createdAt : new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        };
        
        if (currentMaterial) {
          // Update existing material
          setMaterials(materials.map(material => 
            material.id === currentMaterial.id ? newMaterial : material
          ));
        } else {
          // Create new material
          setMaterials([...materials, newMaterial]);
        }
      };
      
      reader.readAsDataURL(file);
    } else {
      // No file uploaded or no change to existing file
      const newMaterial: TeachingMaterial = {
        id: currentMaterial ? currentMaterial.id : `material_${Date.now()}`,
        title,
        type,
        description,
        fileData: currentMaterial?.fileData,
        tags,
        createdAt: currentMaterial ? currentMaterial.createdAt : new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      
      if (currentMaterial) {
        // Update existing material
        setMaterials(materials.map(material => 
          material.id === currentMaterial.id ? newMaterial : material
        ));
      } else {
        // Create new material
        setMaterials([...materials, newMaterial]);
      }
    }
    
    setShowNewMaterialModal(false);
    setCurrentMaterial(null);
  };

  // Delete a lesson plan
  const handleDeleteLessonPlan = (id: string) => {
    if (window.confirm('Are you sure you want to delete this lesson plan?')) {
      setLessonPlans(lessonPlans.filter(plan => plan.id !== id));
    }
  };

  // Delete a material
  const handleDeleteMaterial = (id: string) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      setMaterials(materials.filter(material => material.id !== id));
    }
  };

  // Edit a lesson plan
  const handleEditLessonPlan = (plan: LessonPlan) => {
    setCurrentLessonPlan(plan);
    setShowNewLessonModal(true);
  };

  // Edit a material
  const handleEditMaterial = (material: TeachingMaterial) => {
    setCurrentMaterial(material);
    setShowNewMaterialModal(true);
  };

  // View lesson plan details
  const handleViewLessonDetails = (plan: LessonPlan) => {
    setCurrentLessonPlan(plan);
    setShowLessonDetailModal(true);
  };

  // View material details
  const handleViewMaterialDetails = (material: TeachingMaterial) => {
    setCurrentMaterial(material);
    setShowMaterialDetailModal(true);
  };

  // Close modal on ESC key press
  useEffect(() => {
    const handleEscKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowNewLessonModal(false);
        setShowNewMaterialModal(false);
        setShowLessonDetailModal(false);
        setShowMaterialDetailModal(false);
        setCurrentLessonPlan(null);
        setCurrentMaterial(null);
      }
    };

    window.addEventListener('keydown', handleEscKeyPress);

    return () => {
      window.removeEventListener('keydown', handleEscKeyPress);
    };
  }, []);

  // Download material template
  const handleDownloadMaterialTemplate = () => {
    const template = {
      title: 'Sample Material',
      type: 'document',
      description: 'Description of your teaching material',
      tags: ['tag1', 'tag2', 'tag3']
    };

    const templateBlob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(templateBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'material-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download lesson plan template
  const handleDownloadLessonTemplate = () => {
    const template = {
      title: 'Sample Lesson Plan',
      subject: 'Subject Name',
      grade: 'Grade Level',
      duration: 45,
      objectives: ['Objective 1', 'Objective 2'],
      materials: ['Material 1', 'Material 2'],
      activities: [
        {
          title: 'Activity 1',
          description: 'Description of activity',
          duration: 15
        }
      ],
      assessment: 'How students will be assessed',
      notes: 'Additional notes',
      status: 'draft',
      tags: ['tag1', 'tag2', 'tag3']
    };

    const templateBlob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(templateBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lesson-plan-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm theme-transition">
        <div className="container-fluid py-4">
          <div className="flex-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lesson Planner</h1>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={toggleDarkMode}
                className="theme-toggle"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <span className="theme-toggle-thumb"></span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container-fluid mt-4">
        <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-700">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === ActiveTab.Dashboard ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab(ActiveTab.Dashboard)}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === ActiveTab.LessonPlans ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab(ActiveTab.LessonPlans)}
          >
            Lesson Plans
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeTab === ActiveTab.Materials ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab(ActiveTab.Materials)}
          >
            Teaching Materials
          </button>
        </div>
      </div>

      {/* Dashboard Content */}
      {activeTab === ActiveTab.Dashboard && (
        <div className="container-fluid py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Summary Stats */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Summary</h2>
              <div className="grid grid-cols-1 gap-4">
                <div className="stat-card">
                  <div className="stat-title">Total Lesson Plans</div>
                  <div className="stat-value">{stats.totalLessons}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Total Teaching Materials</div>
                  <div className="stat-value">{stats.totalMaterials}</div>
                </div>
              </div>
            </div>

            {/* Subject Distribution */}
            <div className="card col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Lesson Plans by Subject</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.subjects}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#4f46e5" name="Number of Lessons" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card col-span-1 md:col-span-3">
              <h2 className="text-lg font-semibold mb-4 dark:text-white">Recent Lesson Plans</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                  <thead>
                    <tr>
                      <th className="table-header">Title</th>
                      <th className="table-header">Subject</th>
                      <th className="table-header">Grade</th>
                      <th className="table-header">Last Updated</th>
                      <th className="table-header">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {lessonPlans.slice(0, 5).map(plan => (
                      <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer theme-transition"
                          onClick={() => handleViewLessonDetails(plan)}>
                        <td className="table-cell">{plan.title}</td>
                        <td className="table-cell">{plan.subject}</td>
                        <td className="table-cell">Grade {plan.grade}</td>
                        <td className="table-cell">{formatDate(plan.lastUpdated)}</td>
                        <td className="table-cell">
                          <span className={`badge ${plan.status === 'published' ? 'badge-success' : plan.status === 'draft' ? 'badge-warning' : 'badge-error'}`}>
                            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Plans Content */}
      {activeTab === ActiveTab.LessonPlans && (
        <div className="container-fluid py-6">
          <div className="flex-between flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search lesson plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <button
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
                  onClick={() => {
                    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                    setSortOrder(newOrder);
                  }}
                  aria-label="Change sort order"
                >
                  <ArrowDownUp className="h-4 w-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
              <div>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by field"
                >
                  <option value="lastUpdated">Last Updated</option>
                  <option value="title">Title</option>
                  <option value="subject">Subject</option>
                  <option value="grade">Grade</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
              <div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => {
                    setCurrentLessonPlan(null);
                    setShowNewLessonModal(true);
                  }}
                  aria-label="Create new lesson plan"
                >
                  <Plus className="h-4 w-4" />
                  New Plan
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div>
              <select
                className="input"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                aria-label="Filter by subject"
              >
                <option value="all">All Subjects</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="input"
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                aria-label="Filter by grade"
              >
                <option value="all">All Grades</option>
                {grades.map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="input"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <button
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
                onClick={() => {
                  setSearchTerm('');
                  setFilterSubject('all');
                  setFilterGrade('all');
                  setFilterStatus('all');
                  setSortBy('lastUpdated');
                  setSortOrder('desc');
                }}
              >
                <Filter className="h-4 w-4" />
                Reset Filters
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className={`btn ${viewMode === ViewMode.List ? 'btn-primary' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600'}`}
              onClick={() => setViewMode(ViewMode.List)}
            >
              List View
            </button>
            <button
              className={`btn ${viewMode === ViewMode.Calendar ? 'btn-primary' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600'} flex items-center gap-2`}
              onClick={() => setViewMode(ViewMode.Calendar)}
            >
              <Calendar className="h-4 w-4" />
              Calendar View
            </button>
          </div>

          {/* Lesson Plans List View */}
          {viewMode === ViewMode.List && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedLessonPlans.length > 0 ? (
                sortedLessonPlans.map(plan => (
                  <div key={plan.id} className="card hover:shadow-md cursor-pointer theme-transition" onClick={() => handleViewLessonDetails(plan)}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg dark:text-white">{plan.title}</h3>
                      <span className={`badge ${plan.status === 'published' ? 'badge-success' : plan.status === 'draft' ? 'badge-warning' : 'badge-error'}`}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <p>{plan.subject} • Grade {plan.grade}</p>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{plan.duration} minutes</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {plan.tags.map(tag => (
                        <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>Updated: {formatDate(plan.lastUpdated)}</span>
                      <div className="flex gap-2">
                        <button 
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLessonPlan(plan);
                          }}
                          aria-label="Edit lesson plan"
                        >
                          <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button 
                          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLessonPlan(plan.id);
                          }}
                          aria-label="Delete lesson plan"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No lesson plans found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Create a new lesson plan or adjust your filters</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      setCurrentLessonPlan(null);
                      setShowNewLessonModal(true);
                    }}
                  >
                    Create Lesson Plan
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Calendar View Placeholder */}
          {viewMode === ViewMode.Calendar && (
            <div className="card p-6">
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Calendar View</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-1">A calendar view of your lesson plans would be shown here.</p>
                <p className="text-gray-500 dark:text-gray-400">This is a simplified placeholder for demonstration purposes.</p>
              </div>
            </div>
          )}

          {/* Template download button */}
          <div className="mt-8 flex justify-center">
            <button 
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
              onClick={handleDownloadLessonTemplate}
            >
              <Download className="h-4 w-4" />
              Download Lesson Plan Template
            </button>
          </div>
        </div>
      )}

      {/* Teaching Materials Content */}
      {activeTab === ActiveTab.Materials && (
        <div className="container-fluid py-6">
          <div className="flex-between flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[280px]">
              <div className="relative">
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center">
                <button
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
                  onClick={() => {
                    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                    setSortOrder(newOrder);
                  }}
                  aria-label="Change sort order"
                >
                  <ArrowDownUp className="h-4 w-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
              <div>
                <select
                  className="input"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  aria-label="Sort by field"
                >
                  <option value="lastUpdated">Last Updated</option>
                  <option value="title">Title</option>
                  <option value="type">Type</option>
                </select>
              </div>
              <div>
                <button
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => {
                    setCurrentMaterial(null);
                    setShowNewMaterialModal(true);
                  }}
                  aria-label="Create new material"
                >
                  <Plus className="h-4 w-4" />
                  New Material
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedMaterials.length > 0 ? (
              sortedMaterials.map(material => (
                <div key={material.id} className="card hover:shadow-md cursor-pointer theme-transition" onClick={() => handleViewMaterialDetails(material)}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg dark:text-white flex-1">{material.title}</h3>
                  </div>
                  <div className="flex items-center mb-3">
                    <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                      {material.type.charAt(0).toUpperCase() + material.type.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{material.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {material.tags.map(tag => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Updated: {formatDate(material.lastUpdated)}</span>
                    <div className="flex gap-2">
                      <button 
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMaterial(material);
                        }}
                        aria-label="Edit material"
                      >
                        <Edit className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button 
                        className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMaterial(material.id);
                        }}
                        aria-label="Delete material"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No materials found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create a new teaching material or adjust your search</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setCurrentMaterial(null);
                    setShowNewMaterialModal(true);
                  }}
                >
                  Create Material
                </button>
              </div>
            )}
          </div>

          {/* Template download button */}
          <div className="mt-8 flex justify-center">
            <button 
              className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
              onClick={handleDownloadMaterialTemplate}
            >
              <Download className="h-4 w-4" />
              Download Material Template
            </button>
          </div>
        </div>
      )}

      {/* New Lesson Plan Modal */}
      {showNewLessonModal && (
        <div className="modal-backdrop" onClick={() => { setShowNewLessonModal(false); setCurrentLessonPlan(null); }}>
          <div className="modal-content w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                {currentLessonPlan ? 'Edit Lesson Plan' : 'Create New Lesson Plan'}
              </h3>
              <button 
                onClick={() => { setShowNewLessonModal(false); setCurrentLessonPlan(null); }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLessonPlan}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="input"
                    defaultValue={currentLessonPlan?.title || ''}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      className="input"
                      defaultValue={currentLessonPlan?.subject || ''}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="grade">Grade</label>
                    <select
                      id="grade"
                      name="grade"
                      className="input"
                      defaultValue={currentLessonPlan?.grade || '6'}
                      required
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(grade => (
                        <option key={grade} value={grade.toString()}>{grade}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="duration">Duration (minutes)</label>
                    <input
                      type="number"
                      id="duration"
                      name="duration"
                      className="input"
                      min="5"
                      step="5"
                      defaultValue={currentLessonPlan?.duration || 45}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="objectives">Objectives (one per line)</label>
                  <textarea
                    id="objectives"
                    name="objectives"
                    className="input h-20"
                    defaultValue={currentLessonPlan?.objectives.join('\n') || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="materials">Materials (one per line)</label>
                  <textarea
                    id="materials"
                    name="materials"
                    className="input h-20"
                    defaultValue={currentLessonPlan?.materials.join('\n') || ''}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Activities</label>
                  <div className="space-y-3" id="activities-container">
                    {(currentLessonPlan?.activities || [{id: 'new_1', title: '', description: '', duration: 15}]).map((activity, index) => (
                      <div key={activity.id} className="card-sm bg-gray-50 dark:bg-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div className="md:col-span-2">
                            <label className="form-label text-xs" htmlFor={`activityTitle${index}`}>Title</label>
                            <input
                              type="text"
                              id={`activityTitle${index}`}
                              name="activityTitle"
                              className="input"
                              defaultValue={activity.title}
                              required
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="form-label text-xs" htmlFor={`activityDuration${index}`}>Duration (min)</label>
                            <input
                              type="number"
                              id={`activityDuration${index}`}
                              name="activityDuration"
                              className="input"
                              min="1"
                              defaultValue={activity.duration}
                              required
                            />
                          </div>
                          <div className="md:col-span-4">
                            <label className="form-label text-xs" htmlFor={`activityDescription${index}`}>Description</label>
                            <textarea
                              id={`activityDescription${index}`}
                              name="activityDescription"
                              className="input h-20"
                              defaultValue={activity.description}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="mt-2 btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
                    onClick={() => {
                      const activitiesContainer = document.getElementById('activities-container');
                      if (activitiesContainer) {
                        const newIndex = activitiesContainer.children.length;
                        const newDiv = document.createElement('div');
                        newDiv.className = 'card-sm bg-gray-50 dark:bg-slate-700';
                        newDiv.innerHTML = `
                          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div class="md:col-span-2">
                              <label class="form-label text-xs" for="activityTitle${newIndex}">Title</label>
                              <input
                                type="text"
                                id="activityTitle${newIndex}"
                                name="activityTitle"
                                class="input"
                                required
                              />
                            </div>
                            <div class="md:col-span-1">
                              <label class="form-label text-xs" for="activityDuration${newIndex}">Duration (min)</label>
                              <input
                                type="number"
                                id="activityDuration${newIndex}"
                                name="activityDuration"
                                class="input"
                                min="1"
                                value="15"
                                required
                              />
                            </div>
                            <div class="md:col-span-4">
                              <label class="form-label text-xs" for="activityDescription${newIndex}">Description</label>
                              <textarea
                                id="activityDescription${newIndex}"
                                name="activityDescription"
                                class="input h-20"
                                required
                              ></textarea>
                            </div>
                          </div>
                        `;
                        activitiesContainer.appendChild(newDiv);
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                    Add Activity
                  </button>
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="assessment">Assessment</label>
                  <textarea
                    id="assessment"
                    name="assessment"
                    className="input h-20"
                    defaultValue={currentLessonPlan?.assessment || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    name="notes"
                    className="input h-20"
                    defaultValue={currentLessonPlan?.notes || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="input"
                    defaultValue={currentLessonPlan?.tags.join(', ') || ''}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="status">Status</label>
                  <select
                    id="status"
                    name="status"
                    className="input"
                    defaultValue={currentLessonPlan?.status || 'draft'}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                  onClick={() => { setShowNewLessonModal(false); setCurrentLessonPlan(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentLessonPlan ? 'Update Lesson Plan' : 'Create Lesson Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Material Modal */}
      {showNewMaterialModal && (
        <div className="modal-backdrop" onClick={() => { setShowNewMaterialModal(false); setCurrentMaterial(null); }}>
          <div className="modal-content w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white" id="modal-title">
                {currentMaterial ? 'Edit Teaching Material' : 'Add New Teaching Material'}
              </h3>
              <button 
                onClick={() => { setShowNewMaterialModal(false); setCurrentMaterial(null); }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateMaterial}>
              <div className="mt-4 space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Title</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="input"
                    defaultValue={currentMaterial?.title || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    className="input"
                    defaultValue={currentMaterial?.type || 'document'}
                    required
                  >
                    <option value="document">Document</option>
                    <option value="presentation">Presentation</option>
                    <option value="worksheet">Worksheet</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="image">Image</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description"
                    name="description"
                    className="input h-20"
                    defaultValue={currentMaterial?.description || ''}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="materialFile">Upload File (optional)</label>
                  <input
                    type="file"
                    id="materialFile"
                    name="materialFile"
                    className="input py-2"
                  />
                  {currentMaterial?.fileData && (
                    <p className="mt-1 text-sm text-green-600 dark:text-green-400">File already uploaded</p>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    className="input"
                    defaultValue={currentMaterial?.tags.join(', ') || ''}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                  onClick={() => { setShowNewMaterialModal(false); setCurrentMaterial(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentMaterial ? 'Update Material' : 'Create Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lesson Detail Modal */}
      {showLessonDetailModal && currentLessonPlan && (
        <div className="modal-backdrop" onClick={() => { setShowLessonDetailModal(false); setCurrentLessonPlan(null); }}>
          <div className="modal-content w-full max-w-3xl overflow-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white" id="modal-title">
                  {currentLessonPlan.title}
                </h3>
                <span className={`badge ${currentLessonPlan.status === 'published' ? 'badge-success' : currentLessonPlan.status === 'draft' ? 'badge-warning' : 'badge-error'}`}>
                  {currentLessonPlan.status.charAt(0).toUpperCase() + currentLessonPlan.status.slice(1)}
                </span>
              </div>
              <button 
                onClick={() => { setShowLessonDetailModal(false); setCurrentLessonPlan(null); }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <div className="flex flex-wrap gap-y-2 gap-x-6 mb-6">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Subject:</span>
                  <span className="font-medium dark:text-white">{currentLessonPlan.subject}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Grade:</span>
                  <span className="font-medium dark:text-white">{currentLessonPlan.grade}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Duration:</span>
                  <span className="font-medium dark:text-white">{currentLessonPlan.duration} minutes</span>
                </div>
              </div>

              <div className="card-sm bg-gray-50 dark:bg-slate-700 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Learning Objectives</h4>
                <ul className="list-disc ml-5 text-gray-600 dark:text-gray-300 space-y-1">
                  {currentLessonPlan.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>

              <div className="card-sm bg-gray-50 dark:bg-slate-700 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Materials Needed</h4>
                <ul className="list-disc ml-5 text-gray-600 dark:text-gray-300 space-y-1">
                  {currentLessonPlan.materials.map((material, index) => (
                    <li key={index}>{material}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Activities</h4>
                <div className="space-y-3">
                  {currentLessonPlan.activities.map((activity, index) => (
                    <div key={activity.id} className="card-sm border border-gray-200 dark:border-slate-600">
                      <div className="flex justify-between mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">{activity.title}</h5>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{activity.duration} min</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">{activity.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-sm bg-gray-50 dark:bg-slate-700 mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Assessment</h4>
                <p className="text-gray-600 dark:text-gray-300">{currentLessonPlan.assessment}</p>
              </div>

              {currentLessonPlan.notes && (
                <div className="card-sm bg-gray-50 dark:bg-slate-700 mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Additional Notes</h4>
                  <p className="text-gray-600 dark:text-gray-300">{currentLessonPlan.notes}</p>
                </div>
              )}

              <div className="mb-6">
                <div className="flex flex-wrap gap-1">
                  {currentLessonPlan.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <div>
                  <p>Created: {formatDate(currentLessonPlan.createdAt)}</p>
                  <p>Last updated: {formatDate(currentLessonPlan.lastUpdated)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                onClick={() => { setShowLessonDetailModal(false); setCurrentLessonPlan(null); }}
              >
                Close
              </button>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => { 
                  setShowLessonDetailModal(false); 
                  handleEditLessonPlan(currentLessonPlan);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit Lesson Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Material Detail Modal */}
      {showMaterialDetailModal && currentMaterial && (
        <div className="modal-backdrop" onClick={() => { setShowMaterialDetailModal(false); setCurrentMaterial(null); }}>
          <div className="modal-content w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white" id="modal-title">
                  {currentMaterial.title}
                </h3>
                <span className="badge bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                  {currentMaterial.type.charAt(0).toUpperCase() + currentMaterial.type.slice(1)}
                </span>
              </div>
              <button 
                onClick={() => { setShowMaterialDetailModal(false); setCurrentMaterial(null); }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-300">{currentMaterial.description}</p>
              </div>

              {currentMaterial.fileData && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview</h4>
                  <div className="card-sm border border-gray-200 dark:border-slate-600">
                    {currentMaterial.type === 'image' ? (
                      <img 
                        src={currentMaterial.fileData} 
                        alt={currentMaterial.title} 
                        className="max-w-full h-auto rounded"
                      />
                    ) : (
                      <div className="flex-center flex-col py-4">
                        <p className="text-gray-500 dark:text-gray-400 mb-2">File available for download</p>
                        <button 
                          className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600 flex items-center gap-2"
                          onClick={() => {
                            const fileExtension = currentMaterial.type === 'document' ? '.pdf' : 
                                              currentMaterial.type === 'presentation' ? '.pptx' : 
                                              currentMaterial.type === 'worksheet' ? '.pdf' : 
                                              currentMaterial.type === 'video' ? '.mp4' : 
                                              currentMaterial.type === 'audio' ? '.mp3' : '.file';
                                              
                            const fileName = `${currentMaterial.title.replace(/\s+/g, '_')}${fileExtension}`;
                            
                            const a = document.createElement('a');
                            a.href = currentMaterial.fileData;
                            a.download = fileName;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                        >
                          <Download className="h-4 w-4" />
                          Download File
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <div className="flex flex-wrap gap-1">
                  {currentMaterial.tags.map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full dark:bg-slate-700 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
                <div>
                  <p>Created: {formatDate(currentMaterial.createdAt)}</p>
                  <p>Last updated: {formatDate(currentMaterial.lastUpdated)}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600"
                onClick={() => { setShowMaterialDetailModal(false); setCurrentMaterial(null); }}
              >
                Close
              </button>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => { 
                  setShowMaterialDetailModal(false); 
                  handleEditMaterial(currentMaterial);
                }}
              >
                <Pencil className="h-4 w-4" />
                Edit Material
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 py-6 mt-8 shadow-inner theme-transition">
        <div className="container-fluid text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
