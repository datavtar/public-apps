import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Filter,
  Heart,
  Plus,
  Search,
  ShoppingBag,
  Sun,
  Moon,
  Trash2,
  X
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import styles from './styles/styles.module.css';

// Types and interfaces
interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  type: MealType;
  ingredients: string[];
  instructions: string;
  prepTime: number;
  isFavorite: boolean;
  tags: string[];
}

interface DayPlan {
  date: string;
  breakfast: string | null;
  lunch: string | null;
  dinner: string | null;
  snacks: string[];
}

interface WeekPlan {
  id: string;
  name: string;
  startDate: string;
  days: DayPlan[];
  targetCalories: number;
}

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

type ActiveView = 'calendar' | 'meals' | 'shopping' | 'stats';

// Sample meals data with healthier options for weight loss
const sampleMeals: Meal[] = [
  {
    id: 'm1',
    name: 'Greek Yogurt with Berries',
    calories: 230,
    protein: 20,
    carbs: 25,
    fat: 5,
    type: 'breakfast',
    ingredients: ['1 cup Greek yogurt', '1/2 cup mixed berries', '1 tbsp honey', '1 tbsp chia seeds'],
    instructions: 'Mix all ingredients in a bowl and enjoy!',
    prepTime: 5,
    isFavorite: true,
    tags: ['high-protein', 'quick', 'no-cook']
  },
  {
    id: 'm2',
    name: 'Avocado Toast with Egg',
    calories: 320,
    protein: 15,
    carbs: 30,
    fat: 15,
    type: 'breakfast',
    ingredients: ['1 slice whole grain bread', '1/2 avocado', '1 egg', 'Salt and pepper to taste', 'Red pepper flakes'],
    instructions: 'Toast bread, mash avocado and spread on toast. Cook egg to your preference and place on top. Season with salt, pepper, and red pepper flakes.',
    prepTime: 10,
    isFavorite: false,
    tags: ['high-protein', 'healthy-fats']
  },
  {
    id: 'm3',
    name: 'Grilled Chicken Salad',
    calories: 350,
    protein: 35,
    carbs: 15,
    fat: 12,
    type: 'lunch',
    ingredients: ['4 oz grilled chicken breast', '2 cups mixed greens', '1/4 cup cherry tomatoes', '1/4 cucumber, sliced', '2 tbsp balsamic vinaigrette'],
    instructions: 'Grill chicken breast. Combine all vegetables in a bowl, add sliced chicken, and dress with vinaigrette.',
    prepTime: 15,
    isFavorite: true,
    tags: ['high-protein', 'low-carb']
  },
  {
    id: 'm4',
    name: 'Quinoa Bowl with Roasted Vegetables',
    calories: 380,
    protein: 12,
    carbs: 60,
    fat: 10,
    type: 'lunch',
    ingredients: ['1 cup cooked quinoa', '1 cup roasted vegetables (bell peppers, zucchini, etc.)', '1/4 avocado', '2 tbsp tahini dressing', 'Fresh herbs'],
    instructions: 'Cook quinoa as per package instructions. Roast vegetables at 400°F for 20 minutes. Combine and top with avocado and tahini dressing.',
    prepTime: 30,
    isFavorite: false,
    tags: ['vegan', 'fiber-rich']
  },
  {
    id: 'm5',
    name: 'Baked Salmon with Asparagus',
    calories: 410,
    protein: 40,
    carbs: 10,
    fat: 22,
    type: 'dinner',
    ingredients: ['5 oz salmon fillet', '1 cup asparagus', '1 tbsp olive oil', '1 lemon', 'Salt, pepper, and herbs to taste'],
    instructions: 'Preheat oven to 425°F. Place salmon and asparagus on a baking sheet, drizzle with olive oil, season, and add lemon slices. Bake for 12-15 minutes.',
    prepTime: 20,
    isFavorite: true,
    tags: ['omega-3', 'high-protein', 'low-carb']
  },
  {
    id: 'm6',
    name: 'Turkey Chili',
    calories: 370,
    protein: 35,
    carbs: 35,
    fat: 8,
    type: 'dinner',
    ingredients: ['1 lb ground turkey', '1 can diced tomatoes', '1 can black beans', '1 onion, chopped', '2 cloves garlic, minced', 'Chili spices to taste'],
    instructions: 'Brown turkey in a pot. Add onion and garlic, cook until soft. Add tomatoes, beans, and spices. Simmer for 30 minutes.',
    prepTime: 45,
    isFavorite: false,
    tags: ['high-protein', 'meal-prep-friendly']
  },
  {
    id: 'm7',
    name: 'Apple with Almond Butter',
    calories: 200,
    protein: 5,
    carbs: 25,
    fat: 10,
    type: 'snack',
    ingredients: ['1 medium apple', '1 tbsp almond butter'],
    instructions: 'Slice apple and serve with almond butter for dipping.',
    prepTime: 2,
    isFavorite: true,
    tags: ['quick', 'healthy-fats']
  },
  {
    id: 'm8',
    name: 'Veggie Sticks with Hummus',
    calories: 150,
    protein: 5,
    carbs: 15,
    fat: 8,
    type: 'snack',
    ingredients: ['1 cup mixed veggies (carrots, bell peppers, cucumber)', '3 tbsp hummus'],
    instructions: 'Cut vegetables into sticks and serve with hummus.',
    prepTime: 5,
    isFavorite: false,
    tags: ['quick', 'vegan']
  },
  {
    id: 'm9',
    name: 'Overnight Oats',
    calories: 300,
    protein: 15,
    carbs: 45,
    fat: 6,
    type: 'breakfast',
    ingredients: ['1/2 cup rolled oats', '1/2 cup almond milk', '1 tbsp maple syrup', '1 tbsp chia seeds', '1/4 cup berries'],
    instructions: 'Mix all ingredients in a jar, refrigerate overnight, and enjoy in the morning.',
    prepTime: 5,
    isFavorite: false,
    tags: ['meal-prep', 'fiber-rich']
  },
  {
    id: 'm10',
    name: 'Lentil Soup',
    calories: 320,
    protein: 18,
    carbs: 45,
    fat: 5,
    type: 'lunch',
    ingredients: ['1 cup cooked lentils', '2 cups vegetable broth', '1 carrot, diced', '1 celery stalk, diced', '1 small onion, diced', '2 cloves garlic, minced', 'Herbs and spices to taste'],
    instructions: 'Sauté onion, carrot, celery, and garlic until soft. Add lentils, broth, and seasonings. Simmer for 20 minutes.',
    prepTime: 30,
    isFavorite: false,
    tags: ['vegan', 'high-fiber']
  },
  {
    id: 'm11',
    name: 'Cauliflower Rice Stir Fry',
    calories: 280,
    protein: 20,
    carbs: 20,
    fat: 12,
    type: 'dinner',
    ingredients: ['2 cups cauliflower rice', '4 oz tofu or chicken, diced', '1 cup mixed vegetables', '1 tbsp soy sauce', '1 tsp sesame oil', '1 clove garlic, minced', '1 tsp ginger, minced'],
    instructions: 'Sauté garlic and ginger. Add protein and cook until done. Add vegetables and cauliflower rice, stir fry for 5 minutes. Season with soy sauce and sesame oil.',
    prepTime: 20,
    isFavorite: false,
    tags: ['low-carb', 'gluten-free']
  },
  {
    id: 'm12',
    name: 'Greek Salad',
    calories: 220,
    protein: 8,
    carbs: 15,
    fat: 14,
    type: 'lunch',
    ingredients: ['2 cups romaine lettuce', '1/4 cup cucumber, diced', '1/4 cup tomatoes, diced', '1/4 cup red onion, thinly sliced', '1/4 cup feta cheese', '10 kalamata olives', '2 tbsp olive oil', '1 tbsp red wine vinegar', 'Oregano to taste'],
    instructions: 'Combine all vegetables in a bowl. Top with feta and olives. Dress with olive oil, vinegar, and oregano.',
    prepTime: 10,
    isFavorite: false,
    tags: ['mediterranean', 'quick']
  }
];

// Sample initial week plan
const initialWeekPlan: WeekPlan = {
  id: 'week1',
  name: 'Weight Loss Week 1',
  startDate: new Date().toISOString(),
  targetCalories: 1500,
  days: Array(7).fill(null).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      date: date.toISOString(),
      breakfast: index % 7 === 0 ? 'm1' : index % 7 === 1 ? 'm2' : 'm9',
      lunch: index % 7 === 0 ? 'm3' : index % 7 === 1 ? 'm4' : 'm12',
      dinner: index % 7 === 0 ? 'm5' : index % 7 === 1 ? 'm6' : 'm11',
      snacks: [index % 2 === 0 ? 'm7' : 'm8']
    };
  })
};

// Generate initial shopping list based on the meal plan
const generateInitialShoppingList = (meals: Meal[], weekPlan: WeekPlan): ShoppingListItem[] => {
  const ingredientsMap = new Map<string, { quantity: number; unit: string }>();
  
  weekPlan.days.forEach(day => {
    const mealIds = [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter(Boolean) as string[];
    
    mealIds.forEach(mealId => {
      const meal = meals.find(m => m.id === mealId);
      if (meal) {
        meal.ingredients.forEach(ingredientStr => {
          // Simple parsing of ingredients like "1 cup rice" -> { name: "rice", quantity: 1, unit: "cup" }
          const match = ingredientStr.match(/^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/);
          if (match) {
            const [, quantityStr, unit, name] = match;
            const quantity = parseFloat(quantityStr);
            
            const key = `${name}_${unit}`;
            if (ingredientsMap.has(key)) {
              const existing = ingredientsMap.get(key)!;
              existing.quantity += quantity;
            } else {
              ingredientsMap.set(key, { quantity, unit });
            }
          } else {
            // Handle ingredients without clear quantity/unit
            ingredientsMap.set(ingredientStr, { quantity: 1, unit: 'item' });
          }
        });
      }
    });
  });
  
  return Array.from(ingredientsMap.entries()).map(([key, value], index) => {
    const [name, unit] = key.includes('_') ? key.split('_') : [key, value.unit];
    return {
      id: `sl${index}`,
      name,
      quantity: value.quantity,
      unit: value.unit,
      checked: false
    };
  });
};

const initialShoppingList = generateInitialShoppingList(sampleMeals, initialWeekPlan);

const App: React.FC = () => {
  // State management
  const [meals, setMeals] = useState<Meal[]>(() => {
    const storedMeals = localStorage.getItem('mealPlannerMeals');
    return storedMeals ? JSON.parse(storedMeals) : sampleMeals;
  });
  
  const [weekPlans, setWeekPlans] = useState<WeekPlan[]>(() => {
    const storedPlans = localStorage.getItem('mealPlannerWeekPlans');
    return storedPlans ? JSON.parse(storedPlans) : [initialWeekPlan];
  });
  
  const [activeWeekPlan, setActiveWeekPlan] = useState<string>(() => {
    const storedActiveWeek = localStorage.getItem('mealPlannerActiveWeek');
    return storedActiveWeek || initialWeekPlan.id;
  });
  
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>(() => {
    const storedList = localStorage.getItem('mealPlannerShoppingList');
    return storedList ? JSON.parse(storedList) : initialShoppingList;
  });
  
  const [activeView, setActiveView] = useState<ActiveView>('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterMealType, setFilterMealType] = useState<MealType | 'all'>('all');
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedDarkMode = localStorage.getItem('mealPlannerDarkMode');
    return storedDarkMode === 'true' || 
      (storedDarkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [isAddMealModalOpen, setIsAddMealModalOpen] = useState(false);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({
    name: '',
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    type: 'breakfast',
    ingredients: [],
    instructions: '',
    prepTime: 0,
    isFavorite: false,
    tags: []
  });
  
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedMealTime, setSelectedMealTime] = useState<MealType | null>(null);
  const [isMealSelectorOpen, setIsMealSelectorOpen] = useState(false);
  
  // Dark mode effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('mealPlannerDarkMode', isDarkMode.toString());
  }, [isDarkMode]);
  
  // Persist data to localStorage
  useEffect(() => {
    localStorage.setItem('mealPlannerMeals', JSON.stringify(meals));
  }, [meals]);
  
  useEffect(() => {
    localStorage.setItem('mealPlannerWeekPlans', JSON.stringify(weekPlans));
  }, [weekPlans]);
  
  useEffect(() => {
    localStorage.setItem('mealPlannerActiveWeek', activeWeekPlan);
  }, [activeWeekPlan]);
  
  useEffect(() => {
    localStorage.setItem('mealPlannerShoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);
  
  // Handle Escape key for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAddMealModalOpen(false);
        setIsMealSelectorOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);
  
  // Functions
  const getCurrentWeekPlan = (): WeekPlan => {
    return weekPlans.find(plan => plan.id === activeWeekPlan) || weekPlans[0];
  };
  
  const getMealById = (id: string | null): Meal | undefined => {
    if (!id) return undefined;
    return meals.find(meal => meal.id === id);
  };
  
  const getWeekDayName = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
  };
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
  };
  
  const getDailyNutrition = (day: DayPlan): { calories: number; protein: number; carbs: number; fat: number } => {
    const mealIds = [day.breakfast, day.lunch, day.dinner, ...day.snacks].filter(Boolean) as string[];
    
    return mealIds.reduce((totals, mealId) => {
      const meal = getMealById(mealId);
      if (meal) {
        totals.calories += meal.calories;
        totals.protein += meal.protein;
        totals.carbs += meal.carbs;
        totals.fat += meal.fat;
      }
      return totals;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };
  
  const handleToggleFavorite = (mealId: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, isFavorite: !meal.isFavorite } : meal
    ));
  };
  
  const handleAddMeal = () => {
    const newMealWithId: Meal = {
      ...newMeal as Omit<Meal, 'id'>,
      id: `m${Date.now()}`,
      isFavorite: false
    } as Meal;
    
    setMeals([...meals, newMealWithId]);
    setIsAddMealModalOpen(false);
    setNewMeal({
      name: '',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      type: 'breakfast',
      ingredients: [],
      instructions: '',
      prepTime: 0,
      isFavorite: false,
      tags: []
    });
  };
  
  const handleDeleteMeal = (mealId: string) => {
    // First check if the meal is used in any week plan
    const isUsed = weekPlans.some(plan => 
      plan.days.some(day => 
        day.breakfast === mealId || 
        day.lunch === mealId || 
        day.dinner === mealId || 
        day.snacks.includes(mealId)
      )
    );
    
    if (isUsed) {
      alert('Cannot delete a meal that is used in a meal plan.');
      return;
    }
    
    setMeals(meals.filter(meal => meal.id !== mealId));
  };
  
  const handleAddToShoppingList = (ingredients: string[]) => {
    const newItems = ingredients.map((ingredientStr, index) => {
      // Simple parsing of ingredients like "1 cup rice" -> { name: "rice", quantity: 1, unit: "cup" }
      const match = ingredientStr.match(/^(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)$/);
      if (match) {
        const [, quantityStr, unit, name] = match;
        return {
          id: `sl${Date.now()}-${index}`,
          name,
          quantity: parseFloat(quantityStr),
          unit,
          checked: false
        };
      } else {
        // Handle ingredients without clear quantity/unit
        return {
          id: `sl${Date.now()}-${index}`,
          name: ingredientStr,
          quantity: 1,
          unit: 'item',
          checked: false
        };
      }
    });
    
    setShoppingList([...shoppingList, ...newItems]);
    alert('Items added to shopping list');
  };
  
  const handleToggleShoppingItem = (itemId: string) => {
    setShoppingList(shoppingList.map(item => 
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };
  
  const handleDeleteShoppingItem = (itemId: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== itemId));
  };
  
  const handleAssignMeal = (dayDate: string, mealType: MealType, mealId: string | null) => {
    setWeekPlans(weekPlans.map(plan => {
      if (plan.id === activeWeekPlan) {
        return {
          ...plan,
          days: plan.days.map(day => {
            if (day.date === dayDate) {
              if (mealType === 'snack') {
                // For snacks, we add to the array if adding, or remove if it's already there
                const updatedSnacks = mealId
                  ? [...day.snacks, mealId]
                  : day.snacks.filter(id => id !== selectedMealTime);
                return { ...day, snacks: updatedSnacks };
              } else {
                // For breakfast, lunch, dinner, we just replace
                return { ...day, [mealType]: mealId };
              }
            }
            return day;
          })
        };
      }
      return plan;
    }));
    
    // Close the meal selector
    setIsMealSelectorOpen(false);
    setSelectedDay(null);
    setSelectedMealTime(null);
  };
  
  const generateShoppingList = () => {
    const newShoppingList = generateInitialShoppingList(meals, getCurrentWeekPlan());
    setShoppingList(newShoppingList);
    setActiveView('shopping');
  };
  
  const handleNewIngredientChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const ingredientsText = e.target.value;
    setNewMeal({
      ...newMeal,
      ingredients: ingredientsText.split('\n').filter(line => line.trim() !== '')
    });
  };
  
  const handleNewTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsText = e.target.value;
    setNewMeal({
      ...newMeal,
      tags: tagsText.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
    });
  };
  
  // Filter meals for display
  const getFilteredMeals = () => {
    return meals.filter(meal => {
      const matchesSearch = searchTerm === '' ||
        meal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meal.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesTag = !filterTag || meal.tags.includes(filterTag);
      
      const matchesMealType = filterMealType === 'all' || meal.type === filterMealType;
      
      return matchesSearch && matchesTag && matchesMealType;
    });
  };
  
  // Nutrition data for charts
  const getNutritionData = (day: DayPlan) => {
    const nutrition = getDailyNutrition(day);
    return [
      { name: 'Protein', value: nutrition.protein, fill: '#8884d8' },
      { name: 'Carbs', value: nutrition.carbs, fill: '#82ca9d' },
      { name: 'Fat', value: nutrition.fat, fill: '#ffc658' }
    ];
  };
  
  const getWeeklyCaloriesData = () => {
    const currentPlan = getCurrentWeekPlan();
    return currentPlan.days.map(day => {
      const nutrition = getDailyNutrition(day);
      return {
        name: formatDate(day.date),
        calories: nutrition.calories,
        target: currentPlan.targetCalories
      };
    });
  };
  
  // Get all unique tags from meals
  const getAllTags = () => {
    const tagsSet = new Set<string>();
    meals.forEach(meal => {
      meal.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  };
  
  // JSX for different views
  const renderCalendarView = () => {
    const currentPlan = getCurrentWeekPlan();
    
    return (
      <div className="space-y-6">
        <div className="flex-between">
          <h2 className="text-xl font-bold">{currentPlan.name}</h2>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={generateShoppingList}
          >
            <ShoppingBag size={18} />
            Generate Shopping List
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPlan.days.map((day, index) => (
            <div key={index} className="card shadow-md">
              <div className="flex-between mb-4">
                <div>
                  <h3 className="font-bold text-lg">{getWeekDayName(day.date)}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{formatDate(day.date)}</p>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-semibold">{getDailyNutrition(day).calories} cal</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Target: {currentPlan.targetCalories} cal
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <MealSlot
                  title="Breakfast"
                  meal={getMealById(day.breakfast)}
                  onClick={() => {
                    setSelectedDay(day.date);
                    setSelectedMealTime('breakfast');
                    setIsMealSelectorOpen(true);
                  }}
                />
                
                <MealSlot
                  title="Lunch"
                  meal={getMealById(day.lunch)}
                  onClick={() => {
                    setSelectedDay(day.date);
                    setSelectedMealTime('lunch');
                    setIsMealSelectorOpen(true);
                  }}
                />
                
                <MealSlot
                  title="Dinner"
                  meal={getMealById(day.dinner)}
                  onClick={() => {
                    setSelectedDay(day.date);
                    setSelectedMealTime('dinner');
                    setIsMealSelectorOpen(true);
                  }}
                />
                
                <div>
                  <div className="text-sm font-medium mb-1">Snacks</div>
                  {day.snacks.length > 0 ? (
                    <ul className="space-y-1">
                      {day.snacks.map((snackId) => {
                        const snack = getMealById(snackId);
                        return snack ? (
                          <li key={snackId} className="flex items-center justify-between text-sm px-2 py-1 bg-gray-50 dark:bg-slate-700 rounded">
                            <span>{snack.name}</span>
                            <span className="text-gray-500 dark:text-gray-400">{snack.calories} cal</span>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <div 
                      className="text-sm text-gray-500 dark:text-gray-400 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-center"
                      onClick={() => {
                        setSelectedDay(day.date);
                        setSelectedMealTime('snack');
                        setIsMealSelectorOpen(true);
                      }}
                    >
                      + Add snack
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie
                        data={getNutritionData(day)}
                        cx="50%"
                        cy="50%"
                        outerRadius={40}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}g`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderMealsView = () => {
    const filteredMeals = getFilteredMeals();
    const allTags = getAllTags();
    
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex-grow w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search meals..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <button 
                className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center gap-1"
                onClick={() => document.getElementById('mealTypeFilter')?.click()}
              >
                <Filter size={16} />
                {filterMealType === 'all' ? 'All Types' : filterMealType.charAt(0).toUpperCase() + filterMealType.slice(1)}
                <ChevronDown size={16} />
              </button>
              <select
                id="mealTypeFilter"
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={filterMealType}
                onChange={(e) => setFilterMealType(e.target.value as MealType | 'all')}
              >
                <option value="all">All Types</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
            </div>
            
            <div className="relative">
              <button 
                className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center gap-1"
                onClick={() => document.getElementById('tagFilter')?.click()}
              >
                <Filter size={16} />
                {filterTag || 'All Tags'}
                <ChevronDown size={16} />
              </button>
              <select
                id="tagFilter"
                className="absolute inset-0 opacity-0 cursor-pointer"
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
            
            <button 
              className="btn btn-primary flex items-center gap-1"
              onClick={() => setIsAddMealModalOpen(true)}
            >
              <Plus size={16} />
              Add Meal
            </button>
          </div>
        </div>
        
        {filteredMeals.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No meals found. Try adjusting your filters or add a new meal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMeals.map(meal => (
              <div key={meal.id} className="card">
                <div className="flex-between mb-2">
                  <h3 className="font-bold text-lg">{meal.name}</h3>
                  <div className="flex items-center gap-1">
                    <button 
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 p-1"
                      onClick={() => handleDeleteMeal(meal.id)}
                      aria-label="Delete meal"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      className={`p-1 ${meal.isFavorite ? 'text-red-500 dark:text-red-400' : 'text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400'}`}
                      onClick={() => handleToggleFavorite(meal.id)}
                      aria-label={meal.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart size={18} fill={meal.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  <span className="badge badge-info">{meal.type}</span>
                  {meal.tags.map(tag => (
                    <span key={tag} className="badge bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-4 gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-md mb-3">
                  <div className="text-center">
                    <div className="text-sm font-semibold">{meal.calories}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">cal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{meal.protein}g</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">protein</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{meal.carbs}g</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">{meal.fat}g</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">fat</div>
                  </div>
                </div>
                
                <details className="mb-3">
                  <summary className="font-medium cursor-pointer">Ingredients</summary>
                  <ul className="mt-2 pl-5 text-sm list-disc space-y-1">
                    {meal.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                  <div className="mt-2 flex justify-end">
                    <button 
                      className="btn btn-sm bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600 flex items-center gap-1"
                      onClick={() => handleAddToShoppingList(meal.ingredients)}
                    >
                      <ShoppingBag size={14} />
                      Add to Shopping List
                    </button>
                  </div>
                </details>
                
                <details>
                  <summary className="font-medium cursor-pointer">Instructions</summary>
                  <p className="mt-2 text-sm">{meal.instructions}</p>
                </details>
                
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Prep time: {meal.prepTime} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  const renderShoppingListView = () => {
    const uncheckedItems = shoppingList.filter(item => !item.checked);
    const checkedItems = shoppingList.filter(item => item.checked);
    
    return (
      <div className="space-y-6">
        <div className="flex-between mb-4">
          <h2 className="text-xl font-bold">Shopping List</h2>
          <div className="flex gap-2">
            <button 
              className="btn bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center gap-1"
              onClick={() => {
                const text = shoppingList
                  .map(item => `${item.quantity} ${item.unit} ${item.name} ${item.checked ? '(✓)' : ''}`)
                  .join('\n');
                
                // Create a download link
                const element = document.createElement('a');
                const file = new Blob([text], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = 'shopping-list.txt';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
            >
              <Download size={16} />
              Export List
            </button>
            <button 
              className="btn btn-primary"
              onClick={generateShoppingList}
            >
              Regenerate List
            </button>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium mb-4">To Buy ({uncheckedItems.length} items)</h3>
          
          {uncheckedItems.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">All items are checked off!</p>
          ) : (
            <ul className="space-y-2">
              {uncheckedItems.map(item => (
                <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleShoppingItem(item.id)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span>{item.quantity} {item.unit} {item.name}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteShoppingItem(item.id)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {checkedItems.length > 0 && (
          <div className="card bg-gray-50 dark:bg-slate-800">
            <div className="flex-between mb-4">
              <h3 className="font-medium">Checked Items ({checkedItems.length})</h3>
              <button 
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                onClick={() => setShoppingList(shoppingList.filter(item => !item.checked))}
              >
                Clear checked
              </button>
            </div>
            
            <ul className="space-y-2">
              {checkedItems.map(item => (
                <li key={item.id} className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleShoppingItem(item.id)}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                    />
                    <span className="line-through text-gray-500 dark:text-gray-400">
                      {item.quantity} {item.unit} {item.name}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteShoppingItem(item.id)}
                    className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                    aria-label="Delete item"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };
  
  const renderStatsView = () => {
    const weeklyCaloriesData = getWeeklyCaloriesData();
    const currentPlan = getCurrentWeekPlan();
    
    // Calculate averages
    const weekNutrition = currentPlan.days.reduce(
      (totals, day) => {
        const dayNutrition = getDailyNutrition(day);
        totals.calories += dayNutrition.calories;
        totals.protein += dayNutrition.protein;
        totals.carbs += dayNutrition.carbs;
        totals.fat += dayNutrition.fat;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    const averages = {
      calories: Math.round(weekNutrition.calories / 7),
      protein: Math.round(weekNutrition.protein / 7),
      carbs: Math.round(weekNutrition.carbs / 7),
      fat: Math.round(weekNutrition.fat / 7)
    };
    
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Nutrition Stats</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat-card">
            <div className="stat-title">Avg. Daily Calories</div>
            <div className="stat-value">{averages.calories}</div>
            <div className="stat-desc">
              {averages.calories < currentPlan.targetCalories ? 'Under target' : 'Over target'}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Avg. Daily Protein</div>
            <div className="stat-value">{averages.protein}g</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Avg. Daily Carbs</div>
            <div className="stat-value">{averages.carbs}g</div>
          </div>
          
          <div className="stat-card">
            <div className="stat-title">Avg. Daily Fat</div>
            <div className="stat-value">{averages.fat}g</div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium mb-4">Weekly Calories vs Target</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyCaloriesData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="calories" name="Actual Calories" fill="#8884d8" />
                <Bar dataKey="target" name="Target Calories" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-medium mb-4">Average Macronutrient Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Protein', value: averages.protein * 4, fill: '#8884d8' }, // 4 calories per gram
                    { name: 'Carbs', value: averages.carbs * 4, fill: '#82ca9d' },     // 4 calories per gram
                    { name: 'Fat', value: averages.fat * 9, fill: '#ffc658' }        // 9 calories per gram
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell key="protein" fill="#8884d8" />
                  <Cell key="carbs" fill="#82ca9d" />
                  <Cell key="fat" fill="#ffc658" />
                </Pie>
                <Tooltip formatter={(value) => [`${value} calories`, 'Calories from']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  // Component for meal slot in calendar view
  const MealSlot: React.FC<{ title: string; meal: Meal | undefined; onClick: () => void }> = ({ title, meal, onClick }) => {
    return (
      <div className="group">
        <div className="text-sm font-medium mb-1">{title}</div>
        {meal ? (
          <div 
            className="flex items-center justify-between text-sm p-2 bg-gray-50 dark:bg-slate-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600"
            onClick={onClick}
          >
            <div className="font-medium">{meal.name}</div>
            <div className="text-gray-500 dark:text-gray-400">{meal.calories} cal</div>
          </div>
        ) : (
          <div 
            className="text-sm text-gray-500 dark:text-gray-400 p-2 border border-dashed border-gray-300 dark:border-gray-600 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 text-center"
            onClick={onClick}
          >
            + Add {title.toLowerCase()}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10 theme-transition">
        <div className="container-fluid py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Calendar size={24} className="text-primary-600 mr-2" />
              <h1 className="text-xl font-bold">Healthy Meal Planner</h1>
            </div>
            
            <div className="flex items-center space-x-1 md:space-x-4">
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'calendar' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'}`}
                onClick={() => setActiveView('calendar')}
              >
                Calendar
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'meals' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'}`}
                onClick={() => setActiveView('meals')}
              >
                Meals
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'shopping' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'}`}
                onClick={() => setActiveView('shopping')}
              >
                Shopping
              </button>
              <button 
                className={`px-3 py-2 rounded-md text-sm font-medium ${activeView === 'stats' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-700'}`}
                onClick={() => setActiveView('stats')}
              >
                Stats
              </button>
              
              <button 
                className="ml-2 p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700"
                onClick={() => setIsDarkMode(!isDarkMode)}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container-fluid py-6">
        {activeView === 'calendar' && renderCalendarView()}
        {activeView === 'meals' && renderMealsView()}
        {activeView === 'shopping' && renderShoppingListView()}
        {activeView === 'stats' && renderStatsView()}
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 py-4 border-t border-gray-200 dark:border-gray-700 mt-auto theme-transition">
        <div className="container-fluid">
          <p className="text-center text-gray-500 text-sm dark:text-gray-400">
            Copyright © 2025 of Datavtar Private Limited. All rights reserved.
          </p>
        </div>
      </footer>
      
      {/* Add Meal Modal */}
      {isAddMealModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAddMealModalOpen(false)}>
          <div className="modal-content max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">Add New Meal</h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsAddMealModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="form-label" htmlFor="mealName">Meal Name</label>
                <input 
                  id="mealName"
                  type="text" 
                  className="input" 
                  value={newMeal.name} 
                  onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="mealType">Meal Type</label>
                <select 
                  id="mealType"
                  className="input" 
                  value={newMeal.type} 
                  onChange={(e) => setNewMeal({...newMeal, type: e.target.value as MealType})}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              
              <div>
                <label className="form-label" htmlFor="calories">Calories</label>
                <input 
                  id="calories"
                  type="number" 
                  className="input" 
                  value={newMeal.calories} 
                  onChange={(e) => setNewMeal({...newMeal, calories: parseInt(e.target.value, 10) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="prepTime">Prep Time (minutes)</label>
                <input 
                  id="prepTime"
                  type="number" 
                  className="input" 
                  value={newMeal.prepTime} 
                  onChange={(e) => setNewMeal({...newMeal, prepTime: parseInt(e.target.value, 10) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="protein">Protein (g)</label>
                <input 
                  id="protein"
                  type="number" 
                  className="input" 
                  value={newMeal.protein} 
                  onChange={(e) => setNewMeal({...newMeal, protein: parseInt(e.target.value, 10) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="carbs">Carbs (g)</label>
                <input 
                  id="carbs"
                  type="number" 
                  className="input" 
                  value={newMeal.carbs} 
                  onChange={(e) => setNewMeal({...newMeal, carbs: parseInt(e.target.value, 10) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="fat">Fat (g)</label>
                <input 
                  id="fat"
                  type="number" 
                  className="input" 
                  value={newMeal.fat} 
                  onChange={(e) => setNewMeal({...newMeal, fat: parseInt(e.target.value, 10) || 0})}
                />
              </div>
              
              <div>
                <label className="form-label" htmlFor="tags">Tags (comma separated)</label>
                <input 
                  id="tags"
                  type="text" 
                  className="input" 
                  placeholder="high-protein, low-carb, vegan, etc."
                  onChange={handleNewTagsChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="form-label" htmlFor="ingredients">Ingredients (one per line)</label>
                <textarea 
                  id="ingredients"
                  className="input h-24" 
                  placeholder="1 cup Greek yogurt
1/2 cup berries
1 tbsp honey"
                  onChange={handleNewIngredientChange}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <label className="form-label" htmlFor="instructions">Instructions</label>
                <textarea 
                  id="instructions"
                  className="input h-24" 
                  value={newMeal.instructions} 
                  onChange={(e) => setNewMeal({...newMeal, instructions: e.target.value})}
                ></textarea>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                onClick={() => setIsAddMealModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAddMeal}
                disabled={!newMeal.name || !newMeal.ingredients.length}
              >
                Add Meal
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Meal Selector Modal */}
      {isMealSelectorOpen && (
        <div className="modal-backdrop" onClick={() => setIsMealSelectorOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-lg font-medium">
                Select {selectedMealTime === 'breakfast' ? 'Breakfast' : 
                    selectedMealTime === 'lunch' ? 'Lunch' : 
                    selectedMealTime === 'dinner' ? 'Dinner' : 'Snack'}
              </h3>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setIsMealSelectorOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative my-4">
              <input
                type="text"
                placeholder="Search meals..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {meals
                .filter(meal => 
                  (selectedMealTime === 'snack' ? meal.type === 'snack' : meal.type === selectedMealTime) &&
                  (searchTerm === '' || meal.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(meal => (
                  <div 
                    key={meal.id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0"
                    onClick={() => handleAssignMeal(selectedDay!, selectedMealTime!, meal.id)}
                  >
                    <div>
                      <div className="font-medium">{meal.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {meal.calories} cal | P: {meal.protein}g | C: {meal.carbs}g | F: {meal.fat}g
                      </div>
                    </div>
                    {meal.isFavorite && <Heart size={16} className="text-red-500" fill="currentColor" />}
                  </div>
                ))}
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-200 dark:hover:bg-slate-600"
                onClick={() => setIsMealSelectorOpen(false)}
              >
                Cancel
              </button>
              {!(selectedMealTime === 'snack') && (
                <button 
                  className="btn bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                  onClick={() => {
                    handleAssignMeal(selectedDay!, selectedMealTime!, null);
                  }}
                >
                  Remove Meal
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;