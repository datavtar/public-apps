import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Check, Clock, CreditCard, Eye, EyeOff, FileText, Filter, Lock, LogIn, LogOut, Play, Plus, Search, Settings, Trash2, Upload, User, UserPlus, Video } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import styles from './styles/styles.module.css';

// Define Types
type UserRole = 'admin' | 'student';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  subscribed: boolean;
  subscriptionEnd?: string;
  paymentHistory: Payment[];
  enrolledCourses: string[];
  progress: Record<string, CourseProgress>;
}

interface CourseProgress {
  completedLessons: string[];
  lastWatched: string;
  progress: number; // 0-100
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instrument: string;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number; // in seconds
  resources?: string[];
  order: number;
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  method: 'credit_card' | 'paypal' | 'bank_transfer';
}

interface DashboardStats {
  studentsCount: number;
  coursesCount: number;
  totalRevenue: number;
  revenueByMonth: { name: string; revenue: number }[];
  studentsByInstrument: { name: string; value: number }[];
}

const App: React.FC = () => {
  // State declarations
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activePage, setActivePage] = useState<string>('login');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    studentsCount: 0,
    coursesCount: 0,
    totalRevenue: 0,
    revenueByMonth: [],
    studentsByInstrument: []
  });
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterInstrument, setFilterInstrument] = useState<string>('all');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    const storedCourses = localStorage.getItem('courses');
    const storedPayments = localStorage.getItem('payments');
    const storedCurrentUser = localStorage.getItem('currentUser');

    if (storedUsers) setUsers(JSON.parse(storedUsers));
    if (storedCourses) setCourses(JSON.parse(storedCourses));
    if (storedPayments) setPayments(JSON.parse(storedPayments));
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
      setActivePage('dashboard');
    }

    // Initialize with demo data if empty
    if (!storedUsers) {
      const initialAdmin = {
        id: '1',
        name: 'Admin User',
        email: 'admin@music.com',
        password: 'admin123',
        role: 'admin' as UserRole,
        subscribed: true,
        paymentHistory: [],
        enrolledCourses: [],
        progress: {}
      };

      const initialStudent = {
        id: '2',
        name: 'Student User',
        email: 'student@example.com',
        password: 'student123',
        role: 'student' as UserRole,
        subscribed: true,
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentHistory: [
          {
            id: 'p1',
            userId: '2',
            amount: 29.99,
            date: new Date().toISOString(),
            status: 'completed' as const,
            method: 'credit_card' as const
          }
        ],
        enrolledCourses: ['c1'],
        progress: {
          'c1': {
            completedLessons: ['l1_1'],
            lastWatched: 'l1_2',
            progress: 25
          }
        }
      };

      const initialUsers = [initialAdmin, initialStudent];
      setUsers(initialUsers);
      localStorage.setItem('users', JSON.stringify(initialUsers));
    }

    if (!storedCourses) {
      const initialCourses = [
        {
          id: 'c1',
          title: 'Piano Fundamentals',
          description: 'Learn the basics of piano playing with this comprehensive course for beginners.',
          price: 29.99,
          thumbnail: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
          difficulty: 'beginner' as const,
          instrument: 'Piano',
          lessons: [
            {
              id: 'l1_1',
              title: 'Introduction to the Keyboard',
              description: 'Learn about the layout of the piano keyboard and basic finger positions.',
              videoUrl: 'https://example.com/videos/piano-intro.mp4',
              duration: 600,
              order: 1
            },
            {
              id: 'l1_2',
              title: 'Basic Scales',
              description: 'Learn how to play the C major scale and understand the concept of scales.',
              videoUrl: 'https://example.com/videos/piano-scales.mp4',
              duration: 720,
              order: 2
            },
            {
              id: 'l1_3',
              title: 'Simple Melodies',
              description: 'Practice playing simple melodies with both hands.',
              videoUrl: 'https://example.com/videos/piano-melodies.mp4',
              duration: 900,
              order: 3
            }
          ],
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'c2',
          title: 'Guitar Mastery',
          description: 'Take your guitar skills to the next level with advanced techniques and theory.',
          price: 39.99,
          thumbnail: 'https://images.unsplash.com/photo-1525201548942-d8732f6617a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
          difficulty: 'intermediate' as const,
          instrument: 'Guitar',
          lessons: [
            {
              id: 'l2_1',
              title: 'Advanced Chord Progressions',
              description: 'Learn complex chord progressions and transitions.',
              videoUrl: 'https://example.com/videos/guitar-chords.mp4',
              duration: 1200,
              order: 1
            },
            {
              id: 'l2_2',
              title: 'Fingerpicking Techniques',
              description: 'Master various fingerpicking patterns for different music styles.',
              videoUrl: 'https://example.com/videos/guitar-fingerpicking.mp4',
              duration: 1500,
              order: 2
            }
          ],
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'c3',
          title: 'Violin for Beginners',
          description: 'Start your journey with the violin from the very basics to playing simple tunes.',
          price: 49.99,
          thumbnail: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
          difficulty: 'beginner' as const,
          instrument: 'Violin',
          lessons: [
            {
              id: 'l3_1',
              title: 'Holding the Violin and Bow',
              description: 'Learn the proper posture and technique for holding the violin and bow.',
              videoUrl: 'https://example.com/videos/violin-posture.mp4',
              duration: 900,
              order: 1
            },
            {
              id: 'l3_2',
              title: 'First Notes on Open Strings',
              description: 'Practice playing the four open strings with proper bow technique.',
              videoUrl: 'https://example.com/videos/violin-open-strings.mp4',
              duration: 1080,
              order: 2
            }
          ],
          createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      setCourses(initialCourses);
      localStorage.setItem('courses', JSON.stringify(initialCourses));
    }

    if (!storedPayments) {
      const initialPayments = [
        {
          id: 'p1',
          userId: '2',
          amount: 29.99,
          date: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed' as const,
          method: 'credit_card' as const
        },
        {
          id: 'p2',
          userId: '2',
          amount: 39.99,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed' as const,
          method: 'paypal' as const
        }
      ];
      setPayments(initialPayments);
      localStorage.setItem('payments', JSON.stringify(initialPayments));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (users.length) localStorage.setItem('users', JSON.stringify(users));
    if (courses.length) localStorage.setItem('courses', JSON.stringify(courses));
    if (payments.length) localStorage.setItem('payments', JSON.stringify(payments));
    if (currentUser) localStorage.setItem('currentUser', JSON.stringify(currentUser));
  }, [users, courses, payments, currentUser]);

  // Update dashboard stats when data changes
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      // Calculate dashboard statistics
      const studentsCount = users.filter(user => user.role === 'student').length;
      const coursesCount = courses.length;
      const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);

      // Group payments by month for chart data
      const monthlyRevenue: Record<string, number> = {};
      payments.filter(p => p.status === 'completed').forEach(payment => {
        const date = new Date(payment.date);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        monthlyRevenue[monthYear] = (monthlyRevenue[monthYear] || 0) + payment.amount;
      });

      // Format revenue data for chart
      const revenueByMonth = Object.entries(monthlyRevenue).map(([name, revenue]) => ({ name, revenue }));

      // Count students by instrument preference
      const instrumentCounts: Record<string, number> = {};
      users.filter(user => user.role === 'student').forEach(student => {
        // Get instruments from enrolled courses
        student.enrolledCourses.forEach(courseId => {
          const course = courses.find(c => c.id === courseId);
          if (course) {
            instrumentCounts[course.instrument] = (instrumentCounts[course.instrument] || 0) + 1;
          }
        });
      });

      // Format instrument data for chart
      const studentsByInstrument = Object.entries(instrumentCounts).map(([name, value]) => ({ name, value }));

      setDashboardStats({
        studentsCount,
        coursesCount,
        totalRevenue,
        revenueByMonth,
        studentsByInstrument
      });
    }
  }, [users, courses, payments, currentUser]);

  // Handle Esc key press to close modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Handle clicks outside modal to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node) && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isModalOpen]);

  const closeModal = () => {
    document.body.classList.remove('modal-open');
    setIsModalOpen(false);
  };

  const openModal = (content: string) => {
    document.body.classList.add('modal-open');
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.email === loginEmail && u.password === loginPassword);
    
    if (user) {
      setCurrentUser(user);
      setLoginError('');
      setActivePage('dashboard');
    } else {
      setLoginError('Invalid email or password');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActivePage('login');
    localStorage.removeItem('currentUser');
  };

  const handleRegistration = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    
    // Basic validation
    if (!name || !email || !password || password !== confirmPassword) {
      setLoginError('Please fill all fields correctly. Passwords must match.');
      return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
      setLoginError('Email already registered');
      return;
    }
    
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password,
      role: 'student',
      subscribed: false,
      paymentHistory: [],
      enrolledCourses: [],
      progress: {}
    };
    
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setActivePage('dashboard');
    setLoginError('');
  };

  const handleSubscribe = () => {
    if (!currentUser) return;
    
    const newPayment: Payment = {
      id: `pay_${Date.now()}`,
      userId: currentUser.id,
      amount: 19.99,
      date: new Date().toISOString(),
      status: 'completed',
      method: 'credit_card'
    };
    
    // Update user subscription
    const updatedUser = {
      ...currentUser,
      subscribed: true,
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      paymentHistory: [...currentUser.paymentHistory, newPayment]
    };
    
    setCurrentUser(updatedUser);
    setPayments([...payments, newPayment]);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const enrollInCourse = (courseId: string) => {
    if (!currentUser || !currentUser.subscribed) return;
    
    // If already enrolled, go to course page
    if (currentUser.enrolledCourses.includes(courseId)) {
      const course = courses.find(c => c.id === courseId);
      if (course) {
        setSelectedCourse(course);
        setActivePage('course');
      }
      return;
    }
    
    // Add course to user's enrolled courses
    const updatedUser = {
      ...currentUser,
      enrolledCourses: [...currentUser.enrolledCourses, courseId],
      progress: {
        ...currentUser.progress,
        [courseId]: {
          completedLessons: [],
          lastWatched: '',
          progress: 0
        }
      }
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    
    // Navigate to the course
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
      setActivePage('course');
    }
  };

  const markLessonComplete = (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    
    // Get current progress
    const courseProgress = currentUser.progress[courseId] || { completedLessons: [], lastWatched: '', progress: 0 };
    
    // If already completed, don't add it again
    if (courseProgress.completedLessons.includes(lessonId)) return;
    
    // Add lesson to completed lessons
    const updatedCompletedLessons = [...courseProgress.completedLessons, lessonId];
    
    // Calculate progress percentage
    const course = courses.find(c => c.id === courseId);
    const totalLessons = course?.lessons.length || 1;
    const newProgress = Math.round((updatedCompletedLessons.length / totalLessons) * 100);
    
    // Update user progress
    const updatedProgress = {
      ...courseProgress,
      completedLessons: updatedCompletedLessons,
      lastWatched: lessonId,
      progress: newProgress
    };
    
    const updatedUser = {
      ...currentUser,
      progress: {
        ...currentUser.progress,
        [courseId]: updatedProgress
      }
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const updateLastWatched = (courseId: string, lessonId: string) => {
    if (!currentUser) return;
    
    // Get current progress
    const courseProgress = currentUser.progress[courseId] || { completedLessons: [], lastWatched: '', progress: 0 };
    
    // Update last watched
    const updatedProgress = {
      ...courseProgress,
      lastWatched: lessonId
    };
    
    const updatedUser = {
      ...currentUser,
      progress: {
        ...currentUser.progress,
        [courseId]: updatedProgress
      }
    };
    
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
  };

  const addNewCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newCourse: Course = {
      id: `course_${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      thumbnail: formData.get('thumbnail') as string || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80',
      difficulty: formData.get('difficulty') as 'beginner' | 'intermediate' | 'advanced',
      instrument: formData.get('instrument') as string,
      lessons: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCourses([...courses, newCourse]);
    closeModal();
  };

  const addNewLesson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCourse) return;
    
    const formData = new FormData(e.currentTarget);
    
    const newLesson: Lesson = {
      id: `lesson_${Date.now()}`,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      videoUrl: formData.get('videoUrl') as string,
      duration: parseInt(formData.get('duration') as string, 10),
      order: editingCourse.lessons.length + 1
    };
    
    const resources = formData.get('resources') as string;
    if (resources) {
      newLesson.resources = resources.split(',').map(r => r.trim());
    }
    
    const updatedCourse = {
      ...editingCourse,
      lessons: [...editingCourse.lessons, newLesson],
      updatedAt: new Date().toISOString()
    };
    
    setCourses(courses.map(c => c.id === editingCourse.id ? updatedCourse : c));
    setEditingCourse(updatedCourse);
    closeModal();
  };

  const deleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
    
    // Update users who have enrolled in this course
    const updatedUsers = users.map(user => {
      if (user.enrolledCourses.includes(courseId)) {
        const { [courseId]: _, ...restProgress } = user.progress;
        return {
          ...user,
          enrolledCourses: user.enrolledCourses.filter(id => id !== courseId),
          progress: restProgress
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Update current user if needed
    if (currentUser?.enrolledCourses.includes(courseId)) {
      const { [courseId]: _, ...restProgress } = currentUser.progress;
      const updatedCurrentUser = {
        ...currentUser,
        enrolledCourses: currentUser.enrolledCourses.filter(id => id !== courseId),
        progress: restProgress
      };
      setCurrentUser(updatedCurrentUser);
    }
  };

  const deleteLesson = (courseId: string, lessonId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    const updatedLessons = course.lessons.filter(l => l.id !== lessonId);
    // Re-order lessons
    const reorderedLessons = updatedLessons.map((lesson, index) => ({
      ...lesson,
      order: index + 1
    }));
    
    const updatedCourse = {
      ...course,
      lessons: reorderedLessons,
      updatedAt: new Date().toISOString()
    };
    
    setCourses(courses.map(c => c.id === courseId ? updatedCourse : c));
    
    // If editing this course, update editingCourse
    if (editingCourse?.id === courseId) {
      setEditingCourse(updatedCourse);
    }
    
    // Update users' progress
    const updatedUsers = users.map(user => {
      if (user.enrolledCourses.includes(courseId) && user.progress[courseId]) {
        const updatedProgress = {
          ...user.progress[courseId],
          completedLessons: user.progress[courseId].completedLessons.filter(id => id !== lessonId),
          lastWatched: user.progress[courseId].lastWatched === lessonId 
            ? (reorderedLessons[0]?.id || '') 
            : user.progress[courseId].lastWatched,
          progress: Math.round((user.progress[courseId].completedLessons.filter(id => id !== lessonId).length / reorderedLessons.length) * 100)
        };
        
        return {
          ...user,
          progress: {
            ...user.progress,
            [courseId]: updatedProgress
          }
        };
      }
      return user;
    });
    
    setUsers(updatedUsers);
    
    // Update current user if needed
    if (currentUser?.enrolledCourses.includes(courseId) && currentUser.progress[courseId]) {
      const updatedProgress = {
        ...currentUser.progress[courseId],
        completedLessons: currentUser.progress[courseId].completedLessons.filter(id => id !== lessonId),
        lastWatched: currentUser.progress[courseId].lastWatched === lessonId 
          ? (reorderedLessons[0]?.id || '') 
          : currentUser.progress[courseId].lastWatched,
        progress: Math.round((currentUser.progress[courseId].completedLessons.filter(id => id !== lessonId).length / reorderedLessons.length) * 100)
      };
      
      const updatedCurrentUser = {
        ...currentUser,
        progress: {
          ...currentUser.progress,
          [courseId]: updatedProgress
        }
      };
      
      setCurrentUser(updatedCurrentUser);
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getFilteredCourses = () => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesInstrument = filterInstrument === 'all' || course.instrument === filterInstrument;
      const matchesDifficulty = filterDifficulty === 'all' || course.difficulty === filterDifficulty;
      
      return matchesSearch && matchesInstrument && matchesDifficulty;
    });
  };

  const uniqueInstruments = Array.from(new Set(courses.map(course => course.instrument)));

  // Render login page
  const renderLogin = () => (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="card-lg w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-primary-600 dark:text-primary-400">Music Course Platform</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to access your courses</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {loginError && <div className="alert alert-error" role="alert">{loginError}</div>}
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <User size={18} />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="input pl-10"
                placeholder="yourname@example.com"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input pl-10 pr-10"
                placeholder="********"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary w-full">
            <LogIn size={18} className="mr-2" /> Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Don't have an account?</p>
          <button 
            className="mt-2 btn btn-secondary w-full"
            onClick={() => setActivePage('register')}
          >
            <UserPlus size={18} className="mr-2" /> Create Account
          </button>
        </div>
      </div>
    </div>
  );

  // Render registration page
  const renderRegister = () => (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="card-lg w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold mb-2 text-primary-600 dark:text-primary-400">Create Account</h1>
          <p className="text-gray-600 dark:text-gray-400">Join our music learning platform</p>
        </div>
        
        <form onSubmit={handleRegistration} className="space-y-4">
          {loginError && <div className="alert alert-error" role="alert">{loginError}</div>}
          
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input
              type="text"
              id="reg-name"
              name="name"
              className="input"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email Address</label>
            <input
              type="email"
              id="reg-email"
              name="email"
              className="input"
              placeholder="yourname@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="reg-password"
                name="password"
                className="input pr-10"
                placeholder="********"
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              className="input"
              placeholder="********"
              required
              minLength={8}
            />
          </div>
          
          <button type="submit" className="btn btn-primary w-full">
            Create Account
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400">Already have an account?</p>
          <button 
            className="mt-2 btn btn-secondary w-full"
            onClick={() => setActivePage('login')}
          >
            <LogIn size={18} className="mr-2" /> Sign In
          </button>
        </div>
      </div>
    </div>
  );

  // Render dashboard page
  const renderDashboard = () => {
    if (!currentUser) return null;
    
    // Admin dashboard
    if (currentUser.role === 'admin') {
      return (
        <div className="container-fluid py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your courses and students</p>
          </div>
          
          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="stat-card">
              <span className="stat-title">Total Students</span>
              <div className="stat-value">{dashboardStats.studentsCount}</div>
              <span className="stat-desc">Active learners</span>
            </div>
            
            <div className="stat-card">
              <span className="stat-title">Total Courses</span>
              <div className="stat-value">{dashboardStats.coursesCount}</div>
              <span className="stat-desc">Available courses</span>
            </div>
            
            <div className="stat-card">
              <span className="stat-title">Total Revenue</span>
              <div className="stat-value">${dashboardStats.totalRevenue.toFixed(2)}</div>
              <span className="stat-desc">Lifetime earnings</span>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Students by Instrument</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.studentsByInstrument}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Course Management */}
          <div className="card mb-8">
            <div className="flex-between mb-4">
              <h2 className="text-xl font-semibold">Course Management</h2>
              <button 
                className="btn btn-primary"
                onClick={() => openModal('addCourse')}
              >
                <Plus size={18} className="mr-1" /> Add Course
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Title</th>
                    <th className="table-header">Instrument</th>
                    <th className="table-header">Difficulty</th>
                    <th className="table-header">Price</th>
                    <th className="table-header">Lessons</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {courses.map(course => (
                    <tr key={course.id}>
                      <td className="table-cell">{course.title}</td>
                      <td className="table-cell">{course.instrument}</td>
                      <td className="table-cell capitalize">{course.difficulty}</td>
                      <td className="table-cell">${course.price.toFixed(2)}</td>
                      <td className="table-cell">{course.lessons.length}</td>
                      <td className="table-cell">
                        <div className="flex space-x-2">
                          <button 
                            className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
                            onClick={() => {
                              setEditingCourse(course);
                              setActivePage('editCourse');
                            }}
                            aria-label="Edit course"
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-sm bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this course?')) {
                                deleteCourse(course.id);
                              }
                            }}
                            aria-label="Delete course"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Student Management */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Student Management</h2>
            
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Email</th>
                    <th className="table-header">Subscription</th>
                    <th className="table-header">Enrolled Courses</th>
                    <th className="table-header">Payment History</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                  {users.filter(user => user.role === 'student').map(student => (
                    <tr key={student.id}>
                      <td className="table-cell">{student.name}</td>
                      <td className="table-cell">{student.email}</td>
                      <td className="table-cell">
                        {student.subscribed ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-error">Inactive</span>
                        )}
                      </td>
                      <td className="table-cell">{student.enrolledCourses.length}</td>
                      <td className="table-cell">
                        <button 
                          className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                          onClick={() => {
                            setEditingUser(student);
                            openModal('viewPayments');
                          }}
                        >
                          View Payments
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    // Student dashboard
    return (
      <div className="container-fluid py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Welcome back, {currentUser.name}</p>
        </div>
        
        {/* Subscription Status */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">Subscription Status</h2>
          
          {currentUser.subscribed ? (
            <div className="flex items-center">
              <div className="mr-4 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 p-3 rounded-full">
                <Check size={24} />
              </div>
              <div>
                <h3 className="font-medium">Active Subscription</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Expires: {new Date(currentUser.subscriptionEnd || '').toLocaleDateString()}
                </p>
              </div>
            </div>
          ) : (
            <div>
              <p className="mb-4">You don't have an active subscription. Subscribe now to access all our courses!</p>
              <button className="btn btn-primary" onClick={handleSubscribe}>
                <CreditCard size={18} className="mr-2" /> Subscribe for $19.99/month
              </button>
            </div>
          )}
        </div>
        
        {/* My Courses */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">My Courses</h2>
          
          {currentUser.enrolledCourses.length === 0 ? (
            <p>You haven't enrolled in any courses yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentUser.enrolledCourses.map(courseId => {
                const course = courses.find(c => c.id === courseId);
                if (!course) return null;
                
                const progress = currentUser.progress[courseId] || { progress: 0, lastWatched: '' };
                const lastWatchedLesson = course.lessons.find(l => l.id === progress.lastWatched);
                
                return (
                  <div key={course.id} className="card">
                    <div 
                      className="h-40 bg-cover bg-center rounded-t-lg mb-4" 
                      style={{ backgroundImage: `url(${course.thumbnail})` }}
                    ></div>
                    
                    <h3 className="font-semibold text-lg mb-2">{course.title}</h3>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span>Progress: {progress.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-primary-600 h-2.5 rounded-full" 
                          style={{ width: `${progress.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {lastWatchedLesson && (
                      <p className="text-sm mb-4">
                        <span className="font-medium">Last watched:</span> {lastWatchedLesson.title}
                      </p>
                    )}
                    
                    <button 
                      className="btn btn-primary w-full"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActivePage('course');
                      }}
                    >
                      <Play size={18} className="mr-2" /> Continue Learning
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Browse Courses */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Browse Courses</h2>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Search size={18} className="text-gray-400" />
              </span>
              <input
                type="text"
                className="input pl-10"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Filter size={18} className="text-gray-400" />
                </span>
                <select
                  className="input pl-10 pr-8 appearance-none"
                  value={filterInstrument}
                  onChange={(e) => setFilterInstrument(e.target.value)}
                >
                  <option value="all">All Instruments</option>
                  {uniqueInstruments.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Filter size={18} className="text-gray-400" />
                </span>
                <select
                  className="input pl-10 pr-8 appearance-none"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredCourses().map(course => (
              <div key={course.id} className="card">
                <div 
                  className="h-40 bg-cover bg-center rounded-t-lg mb-4" 
                  style={{ backgroundImage: `url(${course.thumbnail})` }}
                ></div>
                
                <div className="mb-4">
                  <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${course.difficulty === 'beginner' ? 'badge-success' : course.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'}`}>
                      {course.difficulty}
                    </span>
                    <span className="badge badge-info">{course.instrument}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">{course.description}</p>
                </div>
                
                <div className="flex-between mt-auto">
                  <span className="font-semibold">${course.price.toFixed(2)}</span>
                  <button 
                    className={`btn ${currentUser.subscribed ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => enrollInCourse(course.id)}
                    disabled={!currentUser.subscribed}
                  >
                    {currentUser.enrolledCourses.includes(course.id) 
                      ? 'Continue' 
                      : currentUser.subscribed 
                        ? 'Enroll Now' 
                        : 'Subscribe to Enroll'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {getFilteredCourses().length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">No courses found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render course page
  const renderCourse = () => {
    if (!selectedCourse || !currentUser) return null;
    
    const courseProgress = currentUser.progress[selectedCourse.id] || { completedLessons: [], lastWatched: '', progress: 0 };
    const sortedLessons = [...selectedCourse.lessons].sort((a, b) => a.order - b.order);
    const lastWatchedLesson = sortedLessons.find(l => l.id === courseProgress.lastWatched) || sortedLessons[0];
    
    return (
      <div className="container-fluid py-6">
        <div className="mb-6">
          <button 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mb-4"
            onClick={() => setActivePage('dashboard')}
          >
            &larr; Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold mb-2">{selectedCourse.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`badge ${selectedCourse.difficulty === 'beginner' ? 'badge-success' : selectedCourse.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'}`}>
              {selectedCourse.difficulty}
            </span>
            <span className="badge badge-info">{selectedCourse.instrument}</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{selectedCourse.description}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lesson content - takes up 2/3 of the space on large screens */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            {selectedLesson ? (
              <div className="card">
                <div className="aspect-w-16 aspect-h-9 mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
                  {/* This would be a real video player in a production app */}
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      className="w-full h-full rounded-lg"
                      controls
                      poster="https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                      onEnded={() => markLessonComplete(selectedCourse.id, selectedLesson.id)}
                    >
                      <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
                
                <h2 className="text-xl font-semibold mb-2">{selectedLesson.title}</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{selectedLesson.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Clock size={16} className="mr-1" />
                  <span>{formatDuration(selectedLesson.duration)}</span>
                </div>
                
                {selectedLesson.resources && selectedLesson.resources.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Resources</h3>
                    <ul className="space-y-2">
                      {selectedLesson.resources.map((resource, index) => (
                        <li key={index} className="flex items-center">
                          <FileText size={16} className="mr-2 text-primary-600" />
                          <a href="#" className="text-primary-600 hover:underline">{resource}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-6 flex justify-between">
                  <button 
                    className="btn bg-gray-200 text-gray-800 hover:bg-gray-300"
                    onClick={() => {
                      const currentIndex = sortedLessons.findIndex(l => l.id === selectedLesson.id);
                      if (currentIndex > 0) {
                        const prevLesson = sortedLessons[currentIndex - 1];
                        setSelectedLesson(prevLesson);
                        updateLastWatched(selectedCourse.id, prevLesson.id);
                      }
                    }}
                    disabled={sortedLessons.findIndex(l => l.id === selectedLesson.id) === 0}
                  >
                    &larr; Previous
                  </button>
                  
                  <button 
                    className="btn btn-primary"
                    onClick={() => {
                      // Mark current lesson complete
                      markLessonComplete(selectedCourse.id, selectedLesson.id);
                      
                      // Move to next lesson if available
                      const currentIndex = sortedLessons.findIndex(l => l.id === selectedLesson.id);
                      if (currentIndex < sortedLessons.length - 1) {
                        const nextLesson = sortedLessons[currentIndex + 1];
                        setSelectedLesson(nextLesson);
                        updateLastWatched(selectedCourse.id, nextLesson.id);
                      }
                    }}
                    disabled={sortedLessons.findIndex(l => l.id === selectedLesson.id) === sortedLessons.length - 1 && 
                             courseProgress.completedLessons.includes(selectedLesson.id)}
                  >
                    {courseProgress.completedLessons.includes(selectedLesson.id) ? 'Next Lesson' : 'Mark Complete & Continue'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card flex items-center justify-center py-12">
                <p className="text-xl text-gray-600 dark:text-gray-400">Select a lesson to start learning</p>
              </div>
            )}
          </div>
          
          {/* Course syllabus - takes up 1/3 of the space on large screens */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="card sticky top-6">
              <div className="mb-4">
                <h2 className="text-xl font-semibold">Course Content</h2>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span>{selectedCourse.lessons.length} lessons</span>
                  <span>Progress: {courseProgress.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${courseProgress.progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-2">
                {sortedLessons.map((lesson, index) => (
                  <div 
                    key={lesson.id} 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedLesson?.id === lesson.id 
                      ? 'bg-primary-100 dark:bg-primary-900 border-l-4 border-primary-600' 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-700'}`}
                    onClick={() => {
                      setSelectedLesson(lesson);
                      updateLastWatched(selectedCourse.id, lesson.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-xs mr-3">
                          {index + 1}
                        </span>
                        <span className={courseProgress.completedLessons.includes(lesson.id) ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
                          {lesson.title}
                        </span>
                      </div>
                      {courseProgress.completedLessons.includes(lesson.id) && (
                        <span className="text-green-600 dark:text-green-400">
                          <Check size={16} />
                        </span>
                      )}
                    </div>
                    <div className="ml-9 flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                      <Clock size={12} className="mr-1" />
                      <span>{formatDuration(lesson.duration)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render course editing page for admin
  const renderEditCourse = () => {
    if (!editingCourse || currentUser?.role !== 'admin') return null;
    
    return (
      <div className="container-fluid py-6">
        <div className="mb-6">
          <button 
            className="btn bg-gray-200 text-gray-800 hover:bg-gray-300 mb-4"
            onClick={() => setActivePage('dashboard')}
          >
            &larr; Back to Dashboard
          </button>
          
          <h1 className="text-3xl font-bold mb-2">Edit Course: {editingCourse.title}</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Details */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-xl font-semibold mb-4">Course Details</h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Course Title</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        title: e.target.value
                      })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Instrument</label>
                    <input 
                      type="text" 
                      className="input" 
                      value={editingCourse.instrument}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        instrument: e.target.value
                      })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Difficulty</label>
                    <select 
                      className="input" 
                      value={editingCourse.difficulty}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        difficulty: e.target.value as 'beginner' | 'intermediate' | 'advanced'
                      })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Price ($)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="input" 
                      value={editingCourse.price}
                      onChange={(e) => setEditingCourse({
                        ...editingCourse,
                        price: parseFloat(e.target.value)
                      })}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input 
                    type="text" 
                    className="input" 
                    value={editingCourse.thumbnail}
                    onChange={(e) => setEditingCourse({
                      ...editingCourse,
                      thumbnail: e.target.value
                    })}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="input h-32" 
                    value={editingCourse.description}
                    onChange={(e) => setEditingCourse({
                      ...editingCourse,
                      description: e.target.value
                    })}
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setCourses(courses.map(c => c.id === editingCourse.id ? {
                        ...editingCourse,
                        updatedAt: new Date().toISOString()
                      } : c));
                      alert('Course updated successfully!');
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
            
            <div className="card">
              <div className="flex-between mb-4">
                <h2 className="text-xl font-semibold">Lessons</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => openModal('addLesson')}
                >
                  <Plus size={18} className="mr-1" /> Add Lesson
                </button>
              </div>
              
              <div className="space-y-4">
                {editingCourse.lessons.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400">No lessons yet. Add your first lesson to get started.</p>
                ) : (
                  editingCourse.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, index) => (
                      <div key={lesson.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex-between">
                          <div className="flex items-center">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700 text-xs mr-3">
                              {index + 1}
                            </span>
                            <h3 className="font-medium">{lesson.title}</h3>
                          </div>
                          <button 
                            className="text-red-600 hover:text-red-800"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this lesson?')) {
                                deleteLesson(editingCourse.id, lesson.id);
                              }
                            }}
                            aria-label="Delete lesson"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <div className="ml-9 mt-1 text-sm text-gray-600 dark:text-gray-400">{lesson.description}</div>
                        
                        <div className="ml-9 mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Video size={14} className="mr-1" />
                          <span className="mr-3">{formatDuration(lesson.duration)}</span>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="lg:col-span-1">
            <div className="card sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Course Preview</h2>
              
              <div 
                className="h-40 bg-cover bg-center rounded-lg mb-4" 
                style={{ backgroundImage: `url(${editingCourse.thumbnail})` }}
              ></div>
              
              <h3 className="font-semibold text-lg mb-2">{editingCourse.title}</h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`badge ${editingCourse.difficulty === 'beginner' ? 'badge-success' : editingCourse.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error'}`}>
                  {editingCourse.difficulty}
                </span>
                <span className="badge badge-info">{editingCourse.instrument}</span>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-4">{editingCourse.description}</p>
              
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">Price:</span>
                  <span>${editingCourse.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center mb-1">
                  <span className="font-medium mr-2">Lessons:</span>
                  <span>{editingCourse.lessons.length}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Last Updated:</span>
                  <span>{new Date(editingCourse.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render modal content
  const renderModalContent = () => {
    switch (modalContent) {
      case 'addCourse':
        return (
          <div>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Course</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={addNewCourse} className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="title">Course Title</label>
                <input type="text" id="title" name="title" className="input" required />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="instrument">Instrument</label>
                  <input type="text" id="instrument" name="instrument" className="input" required />
                </div>
                
                <div className="form-group">
                  <label className="form-label" htmlFor="difficulty">Difficulty</label>
                  <select id="difficulty" name="difficulty" className="input" required>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="price">Price ($)</label>
                <input type="number" id="price" name="price" step="0.01" className="input" required />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="thumbnail">Thumbnail URL</label>
                <input type="text" id="thumbnail" name="thumbnail" className="input" />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" className="input h-24" required></textarea>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        );
      
      case 'addLesson':
        return (
          <div>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Add New Lesson</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={addNewLesson} className="mt-4 space-y-4">
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-title">Lesson Title</label>
                <input type="text" id="lesson-title" name="title" className="input" required />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="video-url">Video URL</label>
                <input type="text" id="video-url" name="videoUrl" className="input" required />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="duration">Duration (seconds)</label>
                <input type="number" id="duration" name="duration" className="input" required />
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="lesson-description">Description</label>
                <textarea id="lesson-description" name="description" className="input h-24" required></textarea>
              </div>
              
              <div className="form-group">
                <label className="form-label" htmlFor="resources">Resources (comma separated links)</label>
                <input type="text" id="resources" name="resources" className="input" placeholder="Sheet music.pdf, Backing track.mp3" />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Lesson</button>
              </div>
            </form>
          </div>
        );
      
      case 'viewPayments':
        if (!editingUser) return null;
        return (
          <div>
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Payment History: {editingUser.name}</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>
            
            <div className="mt-4">
              {editingUser.paymentHistory.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">No payment history available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th className="table-header">Date</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Status</th>
                        <th className="table-header">Method</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                      {editingUser.paymentHistory.map(payment => (
                        <tr key={payment.id}>
                          <td className="table-cell">{new Date(payment.date).toLocaleDateString()}</td>
                          <td className="table-cell">${payment.amount.toFixed(2)}</td>
                          <td className="table-cell">
                            <span className={`badge ${payment.status === 'completed' ? 'badge-success' : payment.status === 'pending' ? 'badge-warning' : 'badge-error'}`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="table-cell capitalize">{payment.method.replace('_', ' ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              <div className="mt-6 text-right">
                <button className="btn bg-gray-100 text-gray-700 hover:bg-gray-200" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Shared header component for authenticated routes
  const renderHeader = () => {
    if (!currentUser || activePage === 'login' || activePage === 'register') return null;
    
    return (
      <header className="bg-white shadow dark:bg-slate-800 dark:border-b dark:border-slate-700">
        <div className="container-fluid">
          <div className="flex-between py-4">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">Music Course Platform</h1>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser.role === 'admin' && (
                <button 
                  className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={() => setActivePage('dashboard')}
                >
                  <Settings size={16} className="mr-1" /> Admin Panel
                </button>
              )}
              
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">
                  {currentUser.name}
                </span>
                <button 
                  className="btn btn-sm bg-gray-200 text-gray-800 hover:bg-gray-300"
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-1" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  };

  // Shared footer component
  const renderFooter = () => (
    <footer className="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 py-4 mt-8">
      <div className="container-fluid">
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </p>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {renderHeader()}
      
      <main className="flex-grow">
        {activePage === 'login' && renderLogin()}
        {activePage === 'register' && renderRegister()}
        {activePage === 'dashboard' && renderDashboard()}
        {activePage === 'course' && renderCourse()}
        {activePage === 'editCourse' && renderEditCourse()}
      </main>
      
      {renderFooter()}
      
      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div ref={modalRef} className="modal-content">
            {renderModalContent()}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
