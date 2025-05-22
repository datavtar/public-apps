import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsChart, Pie, Cell } from 'recharts';
import {
  Camera as CameraIcon,
  X,
  Plus,
  Upload,
  Calendar,
  ChevronLeft,
  ChevronRight,
  BarChart as BarChartIcon,
  PieChart,
  Clock,
  Info,
  FileImage,
  Heart,
  AlertTriangle,
  Utensils,
  Trash2,
  Moon,
  Sun,
  Check, // Added Check icon import
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';

// Type definitions
interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl: string;
  timestamp: string;
  benefits: string[];
  warnings: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface AilmentType {
  id: string;
  name: string;
  avoidFoods: string[];
  recommendedFoods: string[];
}

interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very active';
  dailyCalorieGoal: number;
  ailments: string[];
}

interface DailyLog {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: FoodItem[];
}

const App: React.FC = () => {
  // States
  const [activeTab, setActiveTab] = useState<'camera' | 'log' | 'insights' | 'profile'>('camera');
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recognizedFood, setRecognizedFood] = useState<string>('');
  const [foodDetails, setFoodDetails] = useState<FoodItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    age: 30,
    height: 170,
    weight: 70,
    gender: 'male',
    activityLevel: 'moderate',
    dailyCalorieGoal: 2000,
    ailments: []
  });
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [foodName, setFoodName] = useState<string>('');
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAilmentsModal, setShowAilmentsModal] = useState<boolean>(false);

  const cameraRef = useRef<any>(null);

  // Ailments list
  const ailments: AilmentType[] = [
    {
      id: '1',
      name: 'Diabetes',
      avoidFoods: ['Sugar', 'White bread', 'Soda', 'Candy', 'Pastries'],
      recommendedFoods: ['Leafy greens', 'Whole grains', 'Lean proteins', 'Nuts', 'Berries']
    },
    {
      id: '2',
      name: 'Hypertension',
      avoidFoods: ['Salt', 'Processed foods', 'Canned soups', 'Pickles', 'Fast food'],
      recommendedFoods: ['Bananas', 'Spinach', 'Berries', 'Oats', 'Yogurt']
    },
    {
      id: '3',
      name: 'Heart Disease',
      avoidFoods: ['Fried foods', 'Red meat', 'Butter', 'Full-fat dairy', 'Baked goods'],
      recommendedFoods: ['Salmon', 'Olive oil', 'Avocados', 'Nuts', 'Beans']
    },
    {
      id: '4',
      name: 'Gluten Intolerance',
      avoidFoods: ['Wheat', 'Barley', 'Rye', 'Pasta', 'Beer'],
      recommendedFoods: ['Rice', 'Quinoa', 'Corn', 'Potatoes', 'Gluten-free oats']
    },
    {
      id: '5',
      name: 'Lactose Intolerance',
      avoidFoods: ['Milk', 'Cheese', 'Ice cream', 'Yogurt', 'Butter'],
      recommendedFoods: ['Almond milk', 'Coconut yogurt', 'Tofu', 'Lactose-free milk', 'Nut cheeses']
    }
  ];

  // Mock food database
  const foodDatabase: Record<string, Omit<FoodItem, 'id' | 'imageUrl' | 'timestamp' | 'mealType'>> = {
    'apple': {
      name: 'Apple',
      calories: 95,
      protein: 0.5,
      carbs: 25,
      fat: 0.3,
      benefits: ['High in fiber', 'Good for heart health', 'Contains antioxidants'],
      warnings: ['High in natural sugars']
    },
    'banana': {
      name: 'Banana',
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      benefits: ['Rich in potassium', 'Good for digestion', 'Natural energy source'],
      warnings: ['High in natural sugars']
    },
    'burger': {
      name: 'Burger',
      calories: 550,
      protein: 25,
      carbs: 40,
      fat: 30,
      benefits: ['Contains protein', 'Can provide energy'],
      warnings: ['High in saturated fat', 'High in sodium', 'May contain processed ingredients']
    },
    'pizza': {
      name: 'Pizza',
      calories: 285,
      protein: 12,
      carbs: 36,
      fat: 10,
      benefits: ['Contains calcium from cheese', 'Can provide protein'],
      warnings: ['High in sodium', 'High in saturated fat', 'Often contains processed ingredients']
    },
    'salad': {
      name: 'Salad',
      calories: 120,
      protein: 3,
      carbs: 10,
      fat: 7,
      benefits: ['High in fiber', 'Rich in vitamins and minerals', 'Low in calories', 'Hydrating'],
      warnings: ['Dressings can add significant calories']
    },
    'chicken': {
      name: 'Grilled Chicken',
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      benefits: ['High in protein', 'Low in fat', 'Good for muscle building'],
      warnings: ['Can be high in sodium if processed']
    },
    'rice': {
      name: 'White Rice',
      calories: 205,
      protein: 4.3,
      carbs: 45,
      fat: 0.4,
      benefits: ['Easy to digest', 'Quick energy source', 'Low in fat'],
      warnings: ['Low in fiber', 'High glycemic index']
    },
    'pasta': {
      name: 'Pasta',
      calories: 200,
      protein: 7,
      carbs: 40,
      fat: 1.2,
      benefits: ['Good source of energy', 'Low in fat'],
      warnings: ['High in carbohydrates', 'Low in nutrients if not whole grain']
    },
    'salmon': {
      name: 'Salmon',
      calories: 206,
      protein: 22,
      carbs: 0,
      fat: 13,
      benefits: ['Rich in omega-3 fatty acids', 'High-quality protein', 'Contains vitamin D'],
      warnings: ['May contain environmental contaminants']
    },
    'steak': {
      name: 'Steak',
      calories: 271,
      protein: 26,
      carbs: 0,
      fat: 17,
      benefits: ['High in protein', 'Rich in iron', 'Contains B vitamins'],
      warnings: ['High in saturated fat', 'Linked to heart disease in excess']
    },
    'eggs': {
      name: 'Eggs',
      calories: 155,
      protein: 13,
      carbs: 1.1,
      fat: 11,
      benefits: ['Complete protein', 'Rich in nutrients', 'Contains choline for brain health'],
      warnings: ['High in cholesterol']
    },
    'yogurt': {
      name: 'Greek Yogurt',
      calories: 100,
      protein: 17,
      carbs: 6,
      fat: 0.4,
      benefits: ['High in protein', 'Contains probiotics', 'Good source of calcium'],
      warnings: ['May contain added sugars']
    },
    'avocado': {
      name: 'Avocado',
      calories: 240,
      protein: 3,
      carbs: 12,
      fat: 22,
      benefits: ['Rich in healthy fats', 'Contains fiber', 'Good for heart health'],
      warnings: ['High in calories']
    },
    'orange': {
      name: 'Orange',
      calories: 62,
      protein: 1.2,
      carbs: 15,
      fat: 0.2,
      benefits: ['High in vitamin C', 'Contains fiber', 'Supports immune function'],
      warnings: ['High in natural sugars']
    },
    'broccoli': {
      name: 'Broccoli',
      calories: 55,
      protein: 3.7,
      carbs: 11,
      fat: 0.6,
      benefits: ['High in vitamin C and K', 'Contains fiber', 'Anti-inflammatory properties'],
      warnings: ['May cause gas in some people']
    }
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const savedLogs = localStorage.getItem('dailyLogs');
    const darkModePreference = localStorage.getItem('darkMode');
    
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
    
    if (savedLogs) {
      setDailyLogs(JSON.parse(savedLogs));
    }

    if (darkModePreference === 'true') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode.toString());
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return format(date, 'MMM dd, yyyy');
  };

  // Get the current week starting from Sunday
  const getWeekDays = (): Date[] => {
    const start = startOfWeek(selectedDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  };

  // Select a date
  const selectDay = (day: Date) => {
    setSelectedDate(day);
  };

  // Navigate to previous or next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, 7));
    }
  };

  // Get log for selected date
  const getSelectedDateLog = (): DailyLog | undefined => {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    return dailyLogs.find(log => log.date === formattedDate);
  };

  // Calculate BMR (Basal Metabolic Rate) using the Mifflin-St Jeor Equation
  const calculateBMR = (): number => {
    const { gender, weight, height, age } = userProfile;
    if (gender === 'male') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate daily calorie need based on activity level
  const calculateDailyCalorieNeed = (): number => {
    const bmr = calculateBMR();
    const { activityLevel } = userProfile;
    
    const activityMultipliers = {
      'sedentary': 1.2,
      'light': 1.375,
      'moderate': 1.55,
      'active': 1.725,
      'very active': 1.9
    };
    
    return Math.round(bmr * activityMultipliers[activityLevel]);
  };

  // Update daily calorie goal
  const updateCalorieGoal = () => {
    setUserProfile(prev => ({
      ...prev,
      dailyCalorieGoal: calculateDailyCalorieNeed()
    }));
  };

  // Open camera
  const handleOpenCamera = () => {
    setIsCameraOpen(true);
    setCapturedImage(null);
    setFoodDetails(null);
    setRecognizedFood('');
  };

  // Capture image
  const handleCaptureImage = () => {
    if (cameraRef.current) {
      const photo = cameraRef.current.takePhoto();
      setCapturedImage(photo);
      setIsCameraOpen(false);
      mockFoodRecognition();
    }
  };

  // Mock food recognition with random selection from foodDatabase
  const mockFoodRecognition = () => {
    setIsLoading(true);
    setTimeout(() => {
      const foodKeys = Object.keys(foodDatabase);
      const randomFood = foodKeys[Math.floor(Math.random() * foodKeys.length)];
      setRecognizedFood(randomFood);
      setFoodName(foodDatabase[randomFood].name);
      setIsLoading(false);
    }, 1500);
  };

  // Handle manual food selection
  const handleFoodSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const foodKey = e.target.value;
    setRecognizedFood(foodKey);
    setFoodName(foodDatabase[foodKey]?.name || '');
  };

  // Add food to log
  const addFoodToLog = () => {
    if (!recognizedFood || !capturedImage) return;

    const food = foodDatabase[recognizedFood.toLowerCase()];
    if (!food) return;

    const newFoodItem: FoodItem = {
      id: Date.now().toString(),
      name: foodName || food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      imageUrl: capturedImage,
      timestamp: new Date().toISOString(),
      benefits: food.benefits,
      warnings: food.warnings,
      mealType
    };

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const existingLogIndex = dailyLogs.findIndex(log => log.date === formattedDate);

    if (existingLogIndex !== -1) {
      // Update existing log
      const updatedLogs = [...dailyLogs];
      const updatedLog = {
        ...updatedLogs[existingLogIndex],
        totalCalories: updatedLogs[existingLogIndex].totalCalories + food.calories,
        totalProtein: updatedLogs[existingLogIndex].totalProtein + food.protein,
        totalCarbs: updatedLogs[existingLogIndex].totalCarbs + food.carbs,
        totalFat: updatedLogs[existingLogIndex].totalFat + food.fat,
        meals: [...updatedLogs[existingLogIndex].meals, newFoodItem]
      };
      updatedLogs[existingLogIndex] = updatedLog;
      setDailyLogs(updatedLogs);
    } else {
      // Create new log
      const newLog: DailyLog = {
        date: formattedDate,
        totalCalories: food.calories,
        totalProtein: food.protein,
        totalCarbs: food.carbs,
        totalFat: food.fat,
        meals: [newFoodItem]
      };
      setDailyLogs([...dailyLogs, newLog]);
    }

    // Reset states
    setCapturedImage(null);
    setRecognizedFood('');
    setFoodName('');
    setActiveTab('log');
  };

  // Delete food from log
  const deleteFoodFromLog = (logDate: string, foodId: string) => {
    const logIndex = dailyLogs.findIndex(log => log.date === logDate);
    if (logIndex === -1) return;

    const foodIndex = dailyLogs[logIndex].meals.findIndex(meal => meal.id === foodId);
    if (foodIndex === -1) return;

    const food = dailyLogs[logIndex].meals[foodIndex];
    const updatedLogs = [...dailyLogs];
    const updatedMeals = updatedLogs[logIndex].meals.filter(meal => meal.id !== foodId);

    // If this was the last meal in the log, remove the entire log
    if (updatedMeals.length === 0) {
      setDailyLogs(updatedLogs.filter((_, index) => index !== logIndex));
      return;
    }

    // Update the log with new totals
    updatedLogs[logIndex] = {
      ...updatedLogs[logIndex],
      totalCalories: updatedLogs[logIndex].totalCalories - food.calories,
      totalProtein: updatedLogs[logIndex].totalProtein - food.protein,
      totalCarbs: updatedLogs[logIndex].totalCarbs - food.carbs,
      totalFat: updatedLogs[logIndex].totalFat - food.fat,
      meals: updatedMeals
    };

    setDailyLogs(updatedLogs);
  };

  // View food details
  const viewFoodDetails = (food: FoodItem) => {
    setFoodDetails(food);
  };

  // Toggle ailment selection
  const toggleAilment = (ailmentName: string) => {
    setUserProfile(prev => {
      const updatedAilments = prev.ailments.includes(ailmentName) 
        ? prev.ailments.filter(a => a !== ailmentName)
        : [...prev.ailments, ailmentName];
      
      return {
        ...prev,
        ailments: updatedAilments
      };
    });
  };

  // Get weekly calorie data for chart
  const getWeeklyCalorieData = () => {
    const weekDays = getWeekDays();
    return weekDays.map(day => {
      const formattedDate = format(day, 'yyyy-MM-dd');
      const log = dailyLogs.find(log => log.date === formattedDate);
      return {
        name: format(day, 'EEE'),
        calories: log?.totalCalories || 0,
        goal: userProfile.dailyCalorieGoal
      };
    });
  };

  // Get nutrient breakdown for pie chart
  const getNutrientBreakdown = () => {
    const selectedLog = getSelectedDateLog();
    if (!selectedLog) return [];

    const totalCalories = selectedLog.totalCalories;
    if (totalCalories === 0) return [];

    return [
      {
        name: 'Protein',
        value: Math.round((selectedLog.totalProtein * 4 / totalCalories) * 100),
        color: '#8884d8'
      },
      {
        name: 'Carbs',
        value: Math.round((selectedLog.totalCarbs * 4 / totalCalories) * 100),
        color: '#82ca9d'
      },
      {
        name: 'Fat',
        value: Math.round((selectedLog.totalFat * 9 / totalCalories) * 100),
        color: '#ffc658'
      }
    ];
  };

  // Check food warnings based on user ailments
  const getFoodWarningsForAilments = (food: FoodItem) => {
    if (!userProfile.ailments.length) return [];

    const warnings: string[] = [];
    userProfile.ailments.forEach(ailmentName => {
      const ailment = ailments.find(a => a.name === ailmentName);
      if (!ailment) return;

      // Check if food name matches any foods to avoid
      const lowerFoodName = food.name.toLowerCase();
      const avoidMatch = ailment.avoidFoods.find(avoidFood => {
        return lowerFoodName.includes(avoidFood.toLowerCase());
      });

      if (avoidMatch) {
        warnings.push(`This food may not be suitable for people with ${ailmentName}.`);
      }

      // Check if food name matches any recommended foods
      const recommendMatch = ailment.recommendedFoods.find(recFood => {
        return lowerFoodName.includes(recFood.toLowerCase());
      });

      if (recommendMatch) {
        warnings.push(`This food is recommended for people with ${ailmentName}.`);
      }
    });

    return warnings;
  };

  // Determine warning level of a food based on user ailments
  const getFoodWarningLevel = (food: FoodItem): 'high' | 'medium' | 'low' => {
    if (!userProfile.ailments.length) return 'low';

    let warningLevel: 'high' | 'medium' | 'low' = 'low';
    
    userProfile.ailments.forEach(ailmentName => {
      const ailment = ailments.find(a => a.name === ailmentName);
      if (!ailment) return;

      const lowerFoodName = food.name.toLowerCase();
      const isAvoidFood = ailment.avoidFoods.some(avoidFood => {
        return lowerFoodName.includes(avoidFood.toLowerCase());
      });

      if (isAvoidFood) {
        warningLevel = 'high';
      } else if (warningLevel !== 'high' && food.calories > 300) {
        warningLevel = 'medium';
      }
    });

    return warningLevel;
  };

  // Get UI color for warning level
  const getWarningLevelColor = (level: 'high' | 'medium' | 'low'): string => {
    switch (level) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  // Upload image from device
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setCapturedImage(reader.result as string);
      mockFoodRecognition();
    };
    reader.readAsDataURL(file);
  };

  // Keyboard event handler for modal closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (foodDetails) setFoodDetails(null);
        if (showAilmentsModal) setShowAilmentsModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [foodDetails, showAilmentsModal]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container-fluid py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">NutriSnap</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-fluid py-6 pb-24">
        {/* Camera Section */}
        {activeTab === 'camera' && (
          <div className="space-y-6">
            {!isCameraOpen && !capturedImage && (
              <div className="card flex flex-col items-center justify-center p-8 space-y-6">
                <div className="h-40 w-40 flex-center rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400">
                  <CameraIcon size={64} />
                </div>
                <h2 className="text-xl font-semibold text-center">Snap Your Food</h2>
                <p className="text-gray-600 dark:text-slate-400 text-center max-w-md">
                  Take a photo of your food to get nutritional information and personalized insights.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
                  <button
                    onClick={handleOpenCamera}
                    className="btn btn-primary flex-center gap-2"
                  >
                    <CameraIcon size={18} />
                    <span>Open Camera</span>
                  </button>
                  <label className="btn bg-white border border-gray-300 dark:bg-slate-700 dark:border-slate-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600 flex-center gap-2 cursor-pointer">
                    <Upload size={18} />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            )}

            {isCameraOpen && (
              <div className="card p-0 overflow-hidden">
                <div className="relative">
                  <div className="aspect-w-16 aspect-h-9 md:aspect-h-12 lg:aspect-h-9">
                    <Camera ref={cameraRef} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4 flex justify-center">
                    <button
                      onClick={handleCaptureImage}
                      className="w-16 h-16 rounded-full bg-white flex-center"
                      aria-label="Take photo"
                    >
                      <div className="w-12 h-12 rounded-full border-4 border-primary-600"></div>
                    </button>
                  </div>
                  <button
                    onClick={() => setIsCameraOpen(false)}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black bg-opacity-50 text-white flex-center"
                    aria-label="Close camera"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
            )}

            {capturedImage && (
              <div className="card space-y-6">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured food"
                    className="object-cover w-full h-full"
                  />
                </div>

                {isLoading ? (
                  <div className="flex-center flex-col py-8 space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                    <p className="text-gray-600 dark:text-slate-400">Analyzing your food...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="form-group">
                      <label className="form-label" htmlFor="foodName">Food Name</label>
                      <input
                        id="foodName"
                        type="text"
                        className="input"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="Food name"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="foodSelect">Detected Food</label>
                      <select
                        id="foodSelect"
                        className="input"
                        value={recognizedFood}
                        onChange={handleFoodSelection}
                      >
                        <option value="">Select food</option>
                        {Object.keys(foodDatabase).map(key => (
                          <option key={key} value={key}>{foodDatabase[key].name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="mealType">Meal Type</label>
                      <select
                        id="mealType"
                        className="input"
                        value={mealType}
                        onChange={(e) => setMealType(e.target.value as any)}
                      >
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                        <option value="snack">Snack</option>
                      </select>
                    </div>

                    {recognizedFood && (
                      <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg">
                        <h3 className="font-medium">Nutrition Information</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Calories</p>
                            <p className="font-semibold">{foodDatabase[recognizedFood]?.calories || 0} kcal</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Protein</p>
                            <p className="font-semibold">{foodDatabase[recognizedFood]?.protein || 0}g</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Carbs</p>
                            <p className="font-semibold">{foodDatabase[recognizedFood]?.carbs || 0}g</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 dark:text-slate-400">Fat</p>
                            <p className="font-semibold">{foodDatabase[recognizedFood]?.fat || 0}g</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => {
                          setCapturedImage(null);
                          setRecognizedFood('');
                        }}
                        className="btn bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addFoodToLog}
                        className="btn btn-primary"
                        disabled={!recognizedFood}
                      >
                        Add to Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Food Log Section */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            {/* Date Navigation */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => navigateWeek('prev')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  aria-label="Previous week"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold">{format(selectedDate, 'MMMM yyyy')}</h2>
                <button
                  onClick={() => navigateWeek('next')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  aria-label="Next week"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {getWeekDays().map((day, index) => {
                  const formattedDate = format(day, 'yyyy-MM-dd');
                  const hasLog = dailyLogs.some(log => log.date === formattedDate);
                  
                  return (
                    <button
                      key={index}
                      onClick={() => selectDay(day)}
                      className={`p-2 rounded-lg flex flex-col items-center ${isSameDay(day, selectedDate) ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' : hasLog ? 'bg-gray-100 dark:bg-slate-700' : ''}`}
                    >
                      <span className="text-xs">{format(day, 'EEE')}</span>
                      <span className={`text-lg ${isSameDay(day, selectedDate) ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {hasLog && !isSameDay(day, selectedDate) && (
                        <div className="h-1 w-1 bg-primary-500 rounded-full mt-1"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Daily Summary */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">{formatDate(selectedDate)}</h2>
              
              {getSelectedDateLog() ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Calories</p>
                      <div className="flex items-end gap-1">
                        <p className="text-xl font-semibold">{getSelectedDateLog()?.totalCalories || 0}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-500 mb-1">/ {userProfile.dailyCalorieGoal}</p>
                      </div>
                      <div className="h-1 bg-gray-200 dark:bg-slate-700 rounded-full mt-2">
                        <div 
                          className="h-1 bg-primary-500 rounded-full" 
                          style={{ width: `${Math.min(((getSelectedDateLog()?.totalCalories || 0) / userProfile.dailyCalorieGoal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Protein</p>
                      <p className="text-xl font-semibold">{getSelectedDateLog()?.totalProtein || 0}g</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Carbs</p>
                      <p className="text-xl font-semibold">{getSelectedDateLog()?.totalCarbs || 0}g</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-slate-400">Fat</p>
                      <p className="text-xl font-semibold">{getSelectedDateLog()?.totalFat || 0}g</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-slate-400 mb-4">No meals logged for this day</p>
                  <button 
                    onClick={() => setActiveTab('camera')} 
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>Add Meal</span>
                  </button>
                </div>
              )}
            </div>

            {/* Meals List */}
            {getSelectedDateLog() && getSelectedDateLog()?.meals.length ? (
              <div className="space-y-4">
                {['breakfast', 'lunch', 'dinner', 'snack'].map(type => {
                  const meals = getSelectedDateLog()?.meals.filter(meal => meal.mealType === type) || [];
                  if (!meals.length) return null;
                  
                  return (
                    <div key={type} className="card">
                      <h3 className="font-medium capitalize mb-4">{type}</h3>
                      <div className="space-y-4">
                        {meals.map(meal => {
                          const warningLevel = getFoodWarningLevel(meal);
                          const warningColor = getWarningLevelColor(warningLevel);
                          
                          return (
                            <div 
                              key={meal.id} 
                              className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                              onClick={() => viewFoodDetails(meal)}
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0">
                                <img 
                                  src={meal.imageUrl} 
                                  alt={meal.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-grow">
                                <h4 className="font-medium">{meal.name}</h4>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                                  <span>{meal.calories} kcal</span>
                                  <span>{format(parseISO(meal.timestamp), 'h:mm a')}</span>
                                </div>
                                {userProfile.ailments.length > 0 && (
                                  <div className={`text-sm mt-1 ${warningColor} flex items-center gap-1`}>
                                    {warningLevel === 'high' ? (
                                      <>
                                        <AlertTriangle size={14} />
                                        <span>Not recommended</span>
                                      </>
                                    ) : warningLevel === 'medium' ? (
                                      <>
                                        <Info size={14} />
                                        <span>Consume in moderation</span>
                                      </>
                                    ) : (
                                      <>
                                        <Heart size={14} />
                                        <span>Good choice</span>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteFoodFromLog(format(selectedDate, 'yyyy-MM-dd'), meal.id);
                                }}
                                className="p-2 text-gray-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400"
                                aria-label="Delete food"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => setActiveTab('camera')} 
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <Plus size={18} />
                    <span>Add More</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Insights Section */}
        {activeTab === 'insights' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Weekly Calorie Intake</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getWeeklyCalorieData()} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="calories" name="Calories" fill="#8884d8" />
                    <Bar dataKey="goal" name="Daily Goal" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Today's Nutrient Breakdown</h2>
              {getSelectedDateLog() && getSelectedDateLog()?.totalCalories > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsChart>
                        <Pie
                          data={getNutrientBreakdown()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getNutrientBreakdown().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center space-y-4">
                    <div>
                      <h3 className="font-medium">Recommended Daily Values</h3>
                      <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
                        Based on your profile and activity level, we recommend:
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-slate-400">Protein</p>
                        <p className="text-lg font-semibold">20-30%</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-slate-400">Carbs</p>
                        <p className="text-lg font-semibold">45-65%</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-slate-400">Fat</p>
                        <p className="text-lg font-semibold">20-35%</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-slate-400">No data available for today</p>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Health Insights</h2>
              {getSelectedDateLog() && getSelectedDateLog()?.totalCalories > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                    <div className="flex gap-3">
                      <div className="text-blue-500 dark:text-blue-400 mt-1">
                        <Info size={20} />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-700 dark:text-blue-400">Calorie Balance</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          {getSelectedDateLog()?.totalCalories && getSelectedDateLog()!.totalCalories > userProfile.dailyCalorieGoal
                            ? `You consumed ${getSelectedDateLog()!.totalCalories - userProfile.dailyCalorieGoal} calories more than your daily goal.`
                            : `You have ${userProfile.dailyCalorieGoal - (getSelectedDateLog()?.totalCalories || 0)} calories remaining for today.`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {userProfile.ailments.length > 0 && (
                    <div className="p-4 border border-purple-100 dark:border-purple-900 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                      <div className="flex gap-3">
                        <div className="text-purple-500 dark:text-purple-400 mt-1">
                          <Heart size={20} />
                        </div>
                        <div>
                          <h3 className="font-medium text-purple-700 dark:text-purple-400">Health Considerations</h3>
                          <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                            Based on your health profile, we've provided personalized warnings for each food item.
                          </p>
                          <div className="mt-2">
                            <button 
                              onClick={() => setShowAilmentsModal(true)}
                              className="text-sm text-purple-700 dark:text-purple-400 underline"
                            >
                              View your health conditions
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-slate-400">No insights available for today</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Section */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-6">Your Profile</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="form-group">
                    <label className="form-label" htmlFor="name">Name</label>
                    <input
                      id="name"
                      type="text"
                      className="input"
                      value={userProfile.name}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="age">Age</label>
                    <input
                      id="age"
                      type="number"
                      className="input"
                      value={userProfile.age}
                      onChange={(e) => setUserProfile({...userProfile, age: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="height">Height (cm)</label>
                    <input
                      id="height"
                      type="number"
                      className="input"
                      value={userProfile.height}
                      onChange={(e) => setUserProfile({...userProfile, height: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="weight">Weight (kg)</label>
                    <input
                      id="weight"
                      type="number"
                      className="input"
                      value={userProfile.weight}
                      onChange={(e) => setUserProfile({...userProfile, weight: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="gender">Gender</label>
                    <select
                      id="gender"
                      className="input"
                      value={userProfile.gender}
                      onChange={(e) => setUserProfile({...userProfile, gender: e.target.value as any})}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="activityLevel">Activity Level</label>
                    <select
                      id="activityLevel"
                      className="input"
                      value={userProfile.activityLevel}
                      onChange={(e) => setUserProfile({...userProfile, activityLevel: e.target.value as any})}
                    >
                      <option value="sedentary">Sedentary (little or no exercise)</option>
                      <option value="light">Light (exercise 1-3 days/week)</option>
                      <option value="moderate">Moderate (exercise 3-5 days/week)</option>
                      <option value="active">Active (exercise 6-7 days/week)</option>
                      <option value="very active">Very Active (hard exercise daily)</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label className="form-label mb-2">Health Conditions</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {ailments.map(ailment => (
                      <div 
                        key={ailment.id} 
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${userProfile.ailments.includes(ailment.name) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30' : 'border-gray-200 dark:border-slate-700'}`}
                        onClick={() => toggleAilment(ailment.name)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded border flex-center ${userProfile.ailments.includes(ailment.name) ? 'bg-primary-500 border-primary-500' : 'border-gray-400 dark:border-slate-500'}`}>
                            {userProfile.ailments.includes(ailment.name) && <Check size={12} className="text-white" />}
                          </div>
                          <span className="font-medium">{ailment.name}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="dailyCalorieGoal">Daily Calorie Goal</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="dailyCalorieGoal"
                      type="number"
                      className="input"
                      value={userProfile.dailyCalorieGoal}
                      onChange={(e) => setUserProfile({...userProfile, dailyCalorieGoal: parseInt(e.target.value) || 0})}
                    />
                    <button 
                      onClick={updateCalorieGoal}
                      className="btn btn-secondary whitespace-nowrap"
                    >
                      Calculate
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                    Based on your profile, we recommend approximately {calculateDailyCalorieNeed()} calories per day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="flex justify-around">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'camera' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400'}`}
          >
            <CameraIcon size={20} />
            <span className="text-xs mt-1">Snap</span>
          </button>
          <button
            onClick={() => setActiveTab('log')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'log' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400'}`}
          >
            <Utensils size={20} />
            <span className="text-xs mt-1">Log</span>
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'insights' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400'}`}
          >
            <BarChartIcon size={20} />
            <span className="text-xs mt-1">Insights</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center py-3 px-6 ${activeTab === 'profile' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-slate-400'}`}
          >
            <CameraIcon size={20} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </nav>

      {/* Food Details Modal */}
      {foodDetails && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[var(--z-modal-backdrop)] p-4"
          onClick={() => setFoodDetails(null)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto z-[var(--z-modal)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-slate-700">
              <img 
                src={foodDetails.imageUrl} 
                alt={foodDetails.name} 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{foodDetails.name}</h2>
                <button
                  onClick={() => setFoodDetails(null)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Calories</p>
                  <p className="font-semibold">{foodDetails.calories}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Protein</p>
                  <p className="font-semibold">{foodDetails.protein}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Carbs</p>
                  <p className="font-semibold">{foodDetails.carbs}g</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-slate-400">Fat</p>
                  <p className="font-semibold">{foodDetails.fat}g</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <Heart size={18} className="text-green-500" />
                  <span>Benefits</span>
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {foodDetails.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-slate-300">{benefit}</li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-4">
                <h3 className="font-medium mb-2 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  <span>Considerations</span>
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {foodDetails.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-slate-300">{warning}</li>
                  ))}
                </ul>
              </div>

              {userProfile.ailments.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                  <h3 className="font-medium mb-2">Health Insights</h3>
                  <div className="space-y-2">
                    {getFoodWarningsForAilments(foodDetails).map((warning, index) => (
                      <p key={index} className="text-sm p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded">
                        {warning}
                      </p>
                    ))}
                    {getFoodWarningsForAilments(foodDetails).length === 0 && (
                      <p className="text-sm p-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded">
                        No specific concerns found for your health conditions.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setFoodDetails(null)}
                  className="btn bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ailments Modal */}
      {showAilmentsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[var(--z-modal-backdrop)] p-4"
          onClick={() => setShowAilmentsModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-auto z-[var(--z-modal)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Your Health Conditions</h2>
                <button
                  onClick={() => setShowAilmentsModal(false)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200"
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
              
              {userProfile.ailments.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.ailments.map(ailmentName => {
                    const ailment = ailments.find(a => a.name === ailmentName);
                    if (!ailment) return null;
                    
                    return (
                      <div key={ailment.id} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                        <h3 className="font-medium">{ailment.name}</h3>
                        
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-red-600 dark:text-red-400">Foods to Avoid</h4>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {ailment.avoidFoods.map((food, index) => (
                              <span key={index} className="text-xs bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-2 py-1 rounded">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Recommended Foods</h4>
                          <div className="mt-1 flex flex-wrap gap-2">
                            {ailment.recommendedFoods.map((food, index) => (
                              <span key={index} className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded">
                                {food}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-slate-400 text-center py-4">
                  No health conditions selected. Update your profile to add health conditions.
                </p>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowAilmentsModal(false);
                    setActiveTab('profile');
                  }}
                  className="btn bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600 mr-2"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setShowAilmentsModal(false)}
                  className="btn btn-primary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 dark:text-slate-500 py-6 mt-8">
        <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
