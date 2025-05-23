import React, { useState, useEffect, useRef } from 'react';
import { Camera } from 'react-camera-pro';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Camera as CameraIcon,
  Upload,
  X,
  Info,
  Heart,
  Brain,
  Stethoscope,
  Calendar,
  ChevronDown,
  Plus,
  Trash2,
  Edit,
  Check,
  ArrowLeft,
  Settings,
  ChartBar,
  User,
  ShoppingBag,
  Coffee
} from 'lucide-react';
import styles from './styles/styles.module.css';

type Food = {
  id: string;
  name: string;
  image: string;
  calories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  benefits: string[];
  warnings: string[];
  timestamp: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
};

type DailyLog = {
  date: string;
  foods: Food[];
  totalCalories: number;
  targetCalories: number;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
};

type UserProfile = {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthConditions: string[];
  targetCalories: number;
};

type FoodDatabase = {
  [key: string]: {
    name: string;
    calories: number;
    nutrients: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    benefits: string[];
    warnings: {
      [condition: string]: string[];
    };
  };
};

const App: React.FC = () => {
  const [view, setView] = useState<'camera' | 'results' | 'logs' | 'profile' | 'settings'>('logs');
  const [image, setImage] = useState<string | null>(null);
  const [currentFood, setCurrentFood] = useState<Food | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    age: 30,
    weight: 70,
    height: 170,
    gender: 'male',
    activityLevel: 'moderate',
    healthConditions: ['None'],
    targetCalories: 2000
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [showAddHealthCondition, setShowAddHealthCondition] = useState(false);
  const [newHealthCondition, setNewHealthCondition] = useState('');
  const [showMobileNav, setShowMobileNav] = useState(false);

  const cameraRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // Mock food database
  const foodDatabase: FoodDatabase = {
    'apple': {
      name: 'Apple',
      calories: 95,
      nutrients: { protein: 0.5, carbs: 25, fat: 0.3, fiber: 4 },
      benefits: ['Rich in antioxidants', 'Supports heart health', 'Good source of fiber'],
      warnings: {
        'diabetes': ['Monitor blood sugar as apples contain natural sugars'],
        'IBS': ['May cause bloating in some individuals'],
        'None': []
      }
    },
    'banana': {
      name: 'Banana',
      calories: 105,
      nutrients: { protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1 },
      benefits: ['Good source of potassium', 'Supports digestive health', 'Energy booster'],
      warnings: {
        'diabetes': ['High in natural sugars, consume in moderation'],
        'kidney disease': ['High potassium content may be concerning for kidney patients'],
        'None': []
      }
    },
    'chicken_salad': {
      name: 'Chicken Salad',
      calories: 310,
      nutrients: { protein: 25, carbs: 10, fat: 20, fiber: 5 },
      benefits: ['High in protein', 'Nutrient-dense', 'Supports muscle maintenance'],
      warnings: {
        'high cholesterol': ['Monitor fat intake'],
        'hypertension': ['Check sodium content in dressing'],
        'None': []
      }
    },
    'burger': {
      name: 'Hamburger',
      calories: 550,
      nutrients: { protein: 25, carbs: 40, fat: 30, fiber: 2 },
      benefits: ['Good source of protein', 'Provides B vitamins'],
      warnings: {
        'heart disease': ['High in saturated fat and sodium'],
        'hypertension': ['High sodium content'],
        'diabetes': ['High carb content from the bun'],
        'obesity': ['High calorie and fat content'],
        'None': ['High in calories and fat']
      }
    },
    'pizza': {
      name: 'Pizza Slice',
      calories: 285,
      nutrients: { protein: 12, carbs: 36, fat: 10, fiber: 2 },
      benefits: ['Contains lycopene from tomato sauce', 'Provides calcium from cheese'],
      warnings: {
        'heart disease': ['High in saturated fat and sodium'],
        'hypertension': ['High sodium content'],
        'diabetes': ['High carb content from the crust'],
        'lactose intolerance': ['Contains dairy'],
        'celiac disease': ['Contains gluten from wheat flour'],
        'None': ['High in sodium and refined carbs']
      }
    },
    'salad': {
      name: 'Garden Salad',
      calories: 120,
      nutrients: { protein: 3, carbs: 12, fat: 7, fiber: 4 },
      benefits: ['High in vitamins and minerals', 'Good source of fiber', 'Low calorie option'],
      warnings: {
        'None': []
      }
    },
    'salmon': {
      name: 'Grilled Salmon',
      calories: 280,
      nutrients: { protein: 39, carbs: 0, fat: 13, fiber: 0 },
      benefits: ['Rich in omega-3 fatty acids', 'High-quality protein', 'Contains vitamin D'],
      warnings: {
        'seafood allergy': ['Avoid if allergic to fish'],
        'gout': ['Contains purines which may trigger gout'],
        'None': []
      }
    },
    'pasta': {
      name: 'Pasta with Tomato Sauce',
      calories: 320,
      nutrients: { protein: 12, carbs: 65, fat: 3, fiber: 4 },
      benefits: ['Good source of energy', 'Tomato sauce provides lycopene'],
      warnings: {
        'diabetes': ['High in carbohydrates'],
        'celiac disease': ['Contains gluten if made from wheat'],
        'None': ['High in carbohydrates']
      }
    },
    'ice_cream': {
      name: 'Ice Cream',
      calories: 270,
      nutrients: { protein: 4, carbs: 32, fat: 14, fiber: 0 },
      benefits: ['Good source of calcium', 'Source of joy and pleasure'],
      warnings: {
        'diabetes': ['High in sugar'],
        'lactose intolerance': ['Contains dairy'],
        'high cholesterol': ['Contains saturated fat'],
        'obesity': ['High in calories and sugar'],
        'None': ['High in sugar and fat']
      }
    },
    'oatmeal': {
      name: 'Oatmeal',
      calories: 160,
      nutrients: { protein: 6, carbs: 27, fat: 3, fiber: 4 },
      benefits: ['High in fiber', 'May lower cholesterol', 'Provides sustained energy'],
      warnings: {
        'celiac disease': ['Ensure oats are certified gluten-free'],
        'None': []
      }
    }
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedLogs = localStorage.getItem('nutriSnapLogs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    } else {
      // Initialize with current day
      const today = new Date().toISOString().split('T')[0];
      setLogs([{
        date: today,
        foods: [],
        totalCalories: 0,
        targetCalories: 2000,
        nutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0 }
      }]);
    }

    const savedProfile = localStorage.getItem('nutriSnapProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('nutriSnapLogs', JSON.stringify(logs));
  }, [logs]);

  // Save profile to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nutriSnapProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Find current log or create if it doesn't exist
  const getCurrentLog = (): DailyLog => {
    const existingLog = logs.find(log => log.date === selectedDate);
    if (existingLog) {
      return existingLog;
    }

    // Create new log for the selected date
    const newLog: DailyLog = {
      date: selectedDate,
      foods: [],
      totalCalories: 0,
      targetCalories: userProfile.targetCalories,
      nutrients: { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    };

    setLogs(prevLogs => [...prevLogs, newLog]);
    return newLog;
  };

  const updateDailyLog = (log: DailyLog) => {
    setLogs(prevLogs => prevLogs.map(l => l.date === log.date ? log : l));
  };

  const addFoodToLog = (food: Food) => {
    const currentLog = getCurrentLog();
    
    const updatedFoods = [...currentLog.foods, food];
    const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0);
    
    const updatedNutrients = updatedFoods.reduce(
      (sum, food) => ({
        protein: sum.protein + food.nutrients.protein,
        carbs: sum.carbs + food.nutrients.carbs,
        fat: sum.fat + food.nutrients.fat,
        fiber: sum.fiber + food.nutrients.fiber
      }),
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const updatedLog = {
      ...currentLog,
      foods: updatedFoods,
      totalCalories,
      nutrients: updatedNutrients
    };

    updateDailyLog(updatedLog);
    setView('logs');
  };

  const removeFoodFromLog = (foodId: string) => {
    const currentLog = getCurrentLog();
    const updatedFoods = currentLog.foods.filter(food => food.id !== foodId);
    
    const totalCalories = updatedFoods.reduce((sum, food) => sum + food.calories, 0);
    
    const updatedNutrients = updatedFoods.reduce(
      (sum, food) => ({
        protein: sum.protein + food.nutrients.protein,
        carbs: sum.carbs + food.nutrients.carbs,
        fat: sum.fat + food.nutrients.fat,
        fiber: sum.fiber + food.nutrients.fiber
      }),
      { protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const updatedLog = {
      ...currentLog,
      foods: updatedFoods,
      totalCalories,
      nutrients: updatedNutrients
    };

    updateDailyLog(updatedLog);
  };

  const mockFoodRecognition = (imageBlob: string): Food => {
    // Simulate food recognition with a random food from the database
    const foodKeys = Object.keys(foodDatabase);
    const randomFoodKey = foodKeys[Math.floor(Math.random() * foodKeys.length)];
    const foodData = foodDatabase[randomFoodKey];
    
    // Get relevant warnings based on user's health conditions
    const relevantWarnings: string[] = [];
    
    if (userProfile.healthConditions.includes('None')) {
      if (foodData.warnings['None'] && foodData.warnings['None'].length > 0) {
        relevantWarnings.push(...foodData.warnings['None']);
      }
    } else {
      userProfile.healthConditions.forEach(condition => {
        if (foodData.warnings[condition.toLowerCase()]) {
          relevantWarnings.push(...foodData.warnings[condition.toLowerCase()]);
        }
      });
    }
    
    return {
      id: Date.now().toString(),
      name: foodData.name,
      image: imageBlob,
      calories: foodData.calories,
      nutrients: foodData.nutrients,
      benefits: foodData.benefits,
      warnings: relevantWarnings,
      timestamp: Date.now(),
      mealType
    };
  };

  const handleCapture = async () => {
    if (cameraRef.current) {
      setIsLoading(true);
      try {
        const photo = cameraRef.current.takePhoto();
        setImage(photo);
        
        // Simulate API processing delay
        setTimeout(() => {
          const recognizedFood = mockFoodRecognition(photo);
          setCurrentFood(recognizedFood);
          setView('results');
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error capturing photo:', error);
        setIsLoading(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      setImage(imageDataUrl);
      
      // Simulate API processing delay
      setTimeout(() => {
        const recognizedFood = mockFoodRecognition(imageDataUrl);
        setCurrentFood(recognizedFood);
        setView('results');
        setIsLoading(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const calculateCalorieNeeds = (profile: UserProfile): number => {
    // Harris-Benedict Equation for BMR
    let bmr: number;
    if (profile.gender === 'male') {
      bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
    } else {
      bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
    }
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    return Math.round(bmr * activityMultipliers[profile.activityLevel]);
  };

  const handleSaveProfile = () => {
    if (tempProfile) {
      const calculatedCalories = calculateCalorieNeeds(tempProfile);
      setUserProfile({
        ...tempProfile,
        targetCalories: calculatedCalories
      });
      setEditingProfile(false);
    }
  };

  const handleCancelProfileEdit = () => {
    setTempProfile(null);
    setEditingProfile(false);
  };

  const handleHealthConditionAdd = () => {
    if (newHealthCondition && tempProfile) {
      // Remove 'None' if it exists and we're adding a real condition
      const updatedConditions = tempProfile.healthConditions.includes('None') ? 
        [newHealthCondition] : 
        [...tempProfile.healthConditions, newHealthCondition];
      
      setTempProfile({
        ...tempProfile,
        healthConditions: updatedConditions
      });
      setNewHealthCondition('');
      setShowAddHealthCondition(false);
    }
  };

  const handleHealthConditionRemove = (condition: string) => {
    if (tempProfile) {
      const updatedConditions = tempProfile.healthConditions.filter(c => c !== condition);
      
      // If removing all conditions, add 'None'
      if (updatedConditions.length === 0) {
        updatedConditions.push('None');
      }
      
      setTempProfile({
        ...tempProfile,
        healthConditions: updatedConditions
      });
    }
  };

  const handleAddFoodToLog = () => {
    if (currentFood) {
      addFoodToLog(currentFood);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const getCurrentDateLog = (): DailyLog => {
    return getCurrentLog();
  };

  const nutrientData = (log: DailyLog) => [
    { name: 'Protein', value: log.nutrients.protein },
    { name: 'Carbs', value: log.nutrients.carbs },
    { name: 'Fat', value: log.nutrients.fat },
    { name: 'Fiber', value: log.nutrients.fiber },
  ];

  const renderProfile = () => {
    if (editingProfile) {
      return (
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Name</label>
              <input
                id="name"
                type="text"
                className="input"
                value={tempProfile?.name || ''}
                onChange={(e) => setTempProfile(prev => prev ? {...prev, name: e.target.value} : null)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="age" className="form-label">Age</label>
              <input
                id="age"
                type="number"
                className="input"
                value={tempProfile?.age || 0}
                onChange={(e) => setTempProfile(prev => 
                  prev ? {...prev, age: parseInt(e.target.value) || 0} : null
                )}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="weight" className="form-label">Weight (kg)</label>
              <input
                id="weight"
                type="number"
                className="input"
                value={tempProfile?.weight || 0}
                onChange={(e) => setTempProfile(prev => 
                  prev ? {...prev, weight: parseFloat(e.target.value) || 0} : null
                )}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="height" className="form-label">Height (cm)</label>
              <input
                id="height"
                type="number"
                className="input"
                value={tempProfile?.height || 0}
                onChange={(e) => setTempProfile(prev => 
                  prev ? {...prev, height: parseFloat(e.target.value) || 0} : null
                )}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="gender" className="form-label">Gender</label>
              <select
                id="gender"
                className="input"
                value={tempProfile?.gender || 'male'}
                onChange={(e) => setTempProfile(prev => 
                  prev ? {...prev, gender: e.target.value as 'male' | 'female' | 'other'} : null
                )}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="activityLevel" className="form-label">Activity Level</label>
              <select
                id="activityLevel"
                className="input"
                value={tempProfile?.activityLevel || 'moderate'}
                onChange={(e) => setTempProfile(prev => 
                  prev ? {...prev, activityLevel: e.target.value as UserProfile['activityLevel']} : null
                )}
              >
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Lightly active (light exercise 1-3 days/week)</option>
                <option value="moderate">Moderately active (moderate exercise 3-5 days/week)</option>
                <option value="active">Active (hard exercise 6-7 days/week)</option>
                <option value="very_active">Very active (very hard exercise & physical job)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Health Conditions</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tempProfile?.healthConditions.map((condition, index) => (
                  <div key={index} className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full">
                    <span className="text-sm">{condition}</span>
                    <button
                      className="ml-2 text-primary-800 hover:text-primary-900"
                      onClick={() => handleHealthConditionRemove(condition)}
                      aria-label={`Remove ${condition}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {!showAddHealthCondition ? (
                  <button
                    className="flex items-center text-primary-600 hover:text-primary-700 px-3 py-1 rounded-full border border-dashed border-primary-300 hover:border-primary-400"
                    onClick={() => setShowAddHealthCondition(true)}
                  >
                    <Plus size={14} className="mr-1" />
                    <span className="text-sm">Add</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      className="input input-sm py-1 px-2 text-sm"
                      placeholder="e.g. Diabetes"
                      value={newHealthCondition}
                      onChange={(e) => setNewHealthCondition(e.target.value)}
                    />
                    <button
                      className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600 p-1"
                      onClick={handleHealthConditionAdd}
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="btn btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 p-1"
                      onClick={() => {
                        setShowAddHealthCondition(false);
                        setNewHealthCondition('');
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <button
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300"
                onClick={handleCancelProfileEdit}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveProfile}
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">User Profile</h2>
          <button
            className="btn btn-sm bg-primary-500 text-white hover:bg-primary-600"
            onClick={() => {
              setTempProfile({...userProfile});
              setEditingProfile(true);
            }}
          >
            <Edit size={16} className="mr-1" />
            Edit
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Name</p>
            <p className="font-medium">{userProfile.name}</p>
          </div>
          
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Age</p>
            <p className="font-medium">{userProfile.age} years</p>
          </div>
          
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Weight</p>
            <p className="font-medium">{userProfile.weight} kg</p>
          </div>
          
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Height</p>
            <p className="font-medium">{userProfile.height} cm</p>
          </div>
          
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Gender</p>
            <p className="font-medium capitalize">{userProfile.gender}</p>
          </div>
          
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Activity Level</p>
            <p className="font-medium capitalize">{userProfile.activityLevel.replace('_', ' ')}</p>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-gray-600 dark:text-gray-300 text-sm">Health Conditions</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {userProfile.healthConditions.map((condition, index) => (
                <span key={index} className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                  {condition}
                </span>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <p className="text-gray-600 dark:text-gray-300 text-sm">Daily Calorie Target</p>
            <p className="font-medium text-lg">{userProfile.targetCalories} calories</p>
          </div>
        </div>
      </div>
    );
  };

  const renderCameraView = () => (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-full max-w-md mx-auto mb-4 relative rounded-lg overflow-hidden bg-gray-900 shadow-lg">
        <Camera ref={cameraRef} facingMode="environment" aspectRatio="cover" />
      </div>
      
      <div className="flex justify-center gap-4 w-full max-w-md">
        <button
          className="btn btn-lg bg-white text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md w-16 h-16"
          onClick={() => setView('logs')}
        >
          <ArrowLeft size={24} />
        </button>
        
        <button
          className="btn btn-lg bg-primary-500 text-white hover:bg-primary-600 rounded-full flex items-center justify-center shadow-md w-16 h-16"
          onClick={handleCapture}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className={styles.spinner}></div>
          ) : (
            <CameraIcon size={24} />
          )}
        </button>
        
        <button
          className="btn btn-lg bg-white text-gray-800 hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md w-16 h-16"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          <Upload size={24} />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </button>
      </div>
      
      <div className="mt-6 w-full max-w-md">
        <label className="form-label">Meal Type</label>
        <select
          className="input"
          value={mealType}
          onChange={(e) => setMealType(e.target.value as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
      </div>
    </div>
  );

  const renderResultsView = () => {
    if (!currentFood || !image) return null;
    
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="card bg-white dark:bg-slate-800 overflow-hidden">
          <div className="h-48 overflow-hidden">
            <img src={image} alt="Food" className="w-full h-full object-cover" />
          </div>
          
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{currentFood.name}</h2>
            
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Calories</p>
                <p className="text-xl font-bold">{currentFood.calories} kcal</p>
              </div>
              
              <div className="text-right">
                <p className="text-gray-600 dark:text-gray-300 text-sm">Meal Type</p>
                <p className="text-lg font-medium capitalize">{currentFood.mealType}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Nutrients</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                  <p className="font-medium text-blue-700 dark:text-blue-300">{currentFood.nutrients.protein}g</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">Protein</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-2 rounded">
                  <p className="font-medium text-green-700 dark:text-green-300">{currentFood.nutrients.carbs}g</p>
                  <p className="text-xs text-green-600 dark:text-green-400">Carbs</p>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded">
                  <p className="font-medium text-yellow-700 dark:text-yellow-300">{currentFood.nutrients.fat}g</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">Fat</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-2 rounded">
                  <p className="font-medium text-purple-700 dark:text-purple-300">{currentFood.nutrients.fiber}g</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Fiber</p>
                </div>
              </div>
            </div>
            
            {currentFood.benefits.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Heart size={18} className="mr-2 text-green-500" />
                  Benefits
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {currentFood.benefits.map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
            
            {currentFood.warnings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2 flex items-center">
                  <Stethoscope size={18} className="mr-2 text-red-500" />
                  Health Considerations
                </h3>
                <ul className="list-disc pl-5 space-y-1">
                  {currentFood.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-gray-700 dark:text-gray-300">{warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex justify-between gap-3">
              <button
                className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                onClick={() => {
                  setCurrentFood(null);
                  setImage(null);
                  setView('camera');
                }}
              >
                Retake
              </button>
              <button
                className="btn btn-primary flex-1"
                onClick={handleAddFoodToLog}
              >
                Add to Log
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLogsView = () => {
    const currentLog = getCurrentDateLog();
    const caloriePercentage = Math.min(100, Math.round((currentLog.totalCalories / currentLog.targetCalories) * 100));
    
    const mealTypeFoods = {
      breakfast: currentLog.foods.filter(food => food.mealType === 'breakfast'),
      lunch: currentLog.foods.filter(food => food.mealType === 'lunch'),
      dinner: currentLog.foods.filter(food => food.mealType === 'dinner'),
      snack: currentLog.foods.filter(food => food.mealType === 'snack')
    };
    
    return (
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold">Nutrition Log</h2>
            <div className="flex items-center">
              <Calendar size={16} className="mr-1 text-gray-500" />
              <input
                type="date"
                className="border-none p-0 bg-transparent text-gray-700 dark:text-gray-300"
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
          </div>
          
          <button
            className="btn btn-primary flex items-center"
            onClick={() => setView('camera')}
          >
            <CameraIcon size={18} className="mr-1" />
            Add Food
          </button>
        </div>
        
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-medium mb-4">Daily Summary</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-gray-600 dark:text-gray-300">Calories</p>
                  <p className="font-medium">{currentLog.totalCalories} / {currentLog.targetCalories} kcal</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${caloriePercentage > 100 ? 'bg-red-500' : 'bg-primary-500'}`}
                    style={{ width: `${caloriePercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Protein</p>
                  <p className="font-medium">{currentLog.nutrients.protein}g</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Carbs</p>
                  <p className="font-medium">{currentLog.nutrients.carbs}g</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Fat</p>
                  <p className="font-medium">{currentLog.nutrients.fat}g</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">Fiber</p>
                  <p className="font-medium">{currentLog.nutrients.fiber}g</p>
                </div>
              </div>
            </div>
            
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nutrientData(currentLog)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {nutrientData(currentLog).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {currentLog.totalCalories > 0 && (
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Macronutrient Distribution</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: 'Current',
                        protein: currentLog.nutrients.protein * 4, // 4 calories per gram
                        carbs: currentLog.nutrients.carbs * 4, // 4 calories per gram
                        fat: currentLog.nutrients.fat * 9, // 9 calories per gram
                      },
                      {
                        name: 'Ideal',
                        protein: currentLog.targetCalories * 0.3, // 30% from protein
                        carbs: currentLog.targetCalories * 0.45, // 45% from carbs
                        fat: currentLog.targetCalories * 0.25, // 25% from fat
                      },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="protein" name="Protein" stackId="a" fill="#0088FE" />
                    <Bar dataKey="carbs" name="Carbs" stackId="a" fill="#00C49F" />
                    <Bar dataKey="fat" name="Fat" stackId="a" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
        
        <div className="space-y-6">
          {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => {
            const foods = mealTypeFoods[meal as keyof typeof mealTypeFoods];
            if (foods.length === 0) return null;
            
            return (
              <div key={meal} className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-medium mb-3 capitalize">{meal}</h3>
                
                <div className="space-y-3">
                  {foods.map((food) => (
                    <div key={food.id} className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-3">
                      <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0">
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{food.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{food.calories} kcal</p>
                      </div>
                      
                      <button
                        className="btn-sm bg-gray-200 text-gray-700 hover:bg-gray-300 rounded p-1"
                        onClick={() => removeFoodFromLog(food.id)}
                        aria-label={`Remove ${food.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-right">
                    Total: {foods.reduce((sum, food) => sum + food.calories, 0)} kcal
                  </p>
                </div>
              </div>
            );
          })}
          
          {Object.values(mealTypeFoods).every(foods => foods.length === 0) && (
            <div className="text-center py-10">
              <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <Coffee size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">No meals logged today</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">Start tracking your nutrition by adding a meal</p>
              <button
                className="btn btn-primary inline-flex items-center"
                onClick={() => setView('camera')}
              >
                <CameraIcon size={18} className="mr-1" />
                Add Food
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="card bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-xl font-bold mb-4">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Toggle dark/light theme</p>
              </div>
              <div className="theme-toggle" onClick={() => {
                document.documentElement.classList.toggle('dark');
              }}>
                <span className="theme-toggle-thumb"></span>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium">Clear All Data</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Remove all saved logs and preferences</p>
              </div>
              <button
                className="btn btn-sm bg-red-500 text-white hover:bg-red-600"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                    localStorage.removeItem('nutriSnapLogs');
                    localStorage.removeItem('nutriSnapProfile');
                    window.location.reload();
                  }
                }}
              >
                Clear
              </button>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
              <div>
                <p className="font-medium">App Version</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current version</p>
              </div>
              <span className="text-sm text-gray-500">1.0.0</span>
            </div>
          </div>
        </div>
        
        {renderProfile()}
      </div>
    );
  };

  const renderCurrentView = () => {
    switch (view) {
      case 'camera':
        return renderCameraView();
      case 'results':
        return renderResultsView();
      case 'logs':
        return renderLogsView();
      case 'profile':
      case 'settings':
        return renderSettingsView();
      default:
        return renderLogsView();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm py-4 px-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">NutriSnap</span>
          </div>
          
          <div className="md:hidden">
            <button 
              className="p-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setShowMobileNav(!showMobileNav)}
              aria-label="Toggle navigation menu"
            >
              <ChevronDown size={20} />
            </button>
          </div>
          
          <nav className="hidden md:flex items-center gap-1">
            <button
              className={`btn ${view === 'logs' ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} flex items-center gap-1`}
              onClick={() => setView('logs')}
            >
              <Calendar size={18} />
              <span>Log</span>
            </button>
            
            <button
              className={`btn ${view === 'settings' ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} flex items-center gap-1`}
              onClick={() => setView('settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </nav>
        </div>
        
        {/* Mobile Navigation */}
        {showMobileNav && (
          <div className="mt-4 md:hidden">
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`btn py-2 ${view === 'logs' ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} flex items-center justify-center gap-1`}
                onClick={() => {
                  setView('logs');
                  setShowMobileNav(false);
                }}
              >
                <Calendar size={18} />
                <span>Log</span>
              </button>
              
              <button
                className={`btn py-2 ${view === 'settings' ? 'btn-primary' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'} flex items-center justify-center gap-1`}
                onClick={() => {
                  setView('settings');
                  setShowMobileNav(false);
                }}
              >
                <Settings size={18} />
                <span>Settings</span>
              </button>
            </div>
          </div>
        )}
      </header>
      
      {/* Main Content */}
      <main className="p-4 pb-24">
        {renderCurrentView()}
      </main>
      
      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-center text-gray-600 dark:text-gray-400 text-sm">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg flex items-center">
            <div className={styles.spinner}></div>
            <p className="ml-3 text-lg font-medium">Analyzing food...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;