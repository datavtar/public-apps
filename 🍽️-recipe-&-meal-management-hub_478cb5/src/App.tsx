import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './contexts/authContext';
import AILayer from './components/AILayer';
import { AILayerHandle } from './components/AILayer.types';
import { 
  Search, 
  Star, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Settings as SettingsIcon,
  Calendar,
  ShoppingCart,
  Trash2,
  Edit,
  Camera,
  Moon,
  Sun,
  X,
  Check,
  BookOpen,
  Utensils,
  Timer
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Types and Interfaces
interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  cuisine: string;
  dietType: string[];
  ingredients: string[];
  instructions: string[];
  calories?: number;
  prepTime?: number;
  totalTime?: number;
  author?: string;
  dateAdded?: string;
}

interface MealPlan {
  id: string;
  date: string;
  breakfast?: Recipe;
  lunch?: Recipe;
  dinner?: Recipe;
  snack?: Recipe;
}

interface ShoppingListItem {
  id: string;
  ingredient: string;
  quantity: string;
  checked: boolean;
  recipeSource?: string;
}

interface AppSettings {
  language: string;
  currency: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
  defaultServings: number;
  dietaryRestrictions: string[];
}

// Dark Mode Hook
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);
  
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle('dark', shouldUseDark);
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };
  
  return { isDark, toggleDarkMode };
};

const App: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const aiLayerRef = useRef<AILayerHandle>(null);

  // State Management
  const [activeTab, setActiveTab] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [featuredRecipes, setFeaturedRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    theme: 'system',
    defaultServings: 4,
    dietaryRestrictions: []
  });

  // Filter States
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [selectedDiet, setSelectedDiet] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [maxCookTime, setMaxCookTime] = useState<number>(0);

  // Modal States
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMealPlanModal, setShowMealPlanModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [selectedMealSlot, setSelectedMealSlot] = useState<{date: string; meal: string} | null>(null);

  // AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<any | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Form States
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    title: '',
    description: '',
    image: '',
    cookTime: 30,
    servings: 4,
    difficulty: 'Medium',
    cuisine: '',
    dietType: [],
    ingredients: [''],
    instructions: [''],
    calories: 0,
    prepTime: 15
  });

  // Sample Data
  const sampleRecipes: Recipe[] = [
    {
      id: '1',
      title: 'Classic Spaghetti Carbonara',
      description: 'Creamy Italian pasta dish with eggs, cheese, and pancetta',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
      cookTime: 20,
      servings: 4,
      difficulty: 'Medium',
      rating: 4.8,
      cuisine: 'Italian',
      dietType: [],
      ingredients: ['400g spaghetti', '200g pancetta', '4 eggs', '100g parmesan', 'Black pepper', 'Salt'],
      instructions: ['Boil pasta', 'Cook pancetta', 'Mix eggs and cheese', 'Combine all ingredients', 'Serve hot'],
      calories: 520,
      prepTime: 10,
      totalTime: 30,
      author: 'Chef Mario',
      dateAdded: '2025-06-01'
    },
    {
      id: '2',
      title: 'Thai Green Curry',
      description: 'Spicy and aromatic coconut curry with vegetables',
      image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop',
      cookTime: 25,
      servings: 4,
      difficulty: 'Medium',
      rating: 4.6,
      cuisine: 'Thai',
      dietType: ['Vegetarian', 'Gluten-Free'],
      ingredients: ['400ml coconut milk', '2 tbsp green curry paste', 'Mixed vegetables', 'Thai basil', 'Fish sauce'],
      instructions: ['Heat coconut milk', 'Add curry paste', 'Add vegetables', 'Simmer until tender', 'Garnish with basil'],
      calories: 380,
      prepTime: 15,
      totalTime: 40,
      author: 'Chef Somchai',
      dateAdded: '2025-06-02'
    },
    {
      id: '3',
      title: 'Chocolate Chip Cookies',
      description: 'Classic homemade chocolate chip cookies',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop',
      cookTime: 12,
      servings: 24,
      difficulty: 'Easy',
      rating: 4.9,
      cuisine: 'American',
      dietType: ['Vegetarian'],
      ingredients: ['2 cups flour', '1 cup butter', '3/4 cup brown sugar', '1/2 cup white sugar', '2 eggs', '2 cups chocolate chips'],
      instructions: ['Cream butter and sugars', 'Add eggs', 'Mix in flour', 'Fold in chocolate chips', 'Bake at 375°F for 9-11 minutes'],
      calories: 180,
      prepTime: 20,
      totalTime: 32,
      author: 'Grandma Betty',
      dateAdded: '2025-06-03'
    },
    {
      id: '4',
      title: 'Mediterranean Quinoa Bowl',
      description: 'Healthy bowl with quinoa, vegetables, and tahini dressing',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
      cookTime: 15,
      servings: 2,
      difficulty: 'Easy',
      rating: 4.4,
      cuisine: 'Mediterranean',
      dietType: ['Vegan', 'Gluten-Free'],
      ingredients: ['1 cup quinoa', 'Cherry tomatoes', 'Cucumber', 'Red onion', 'Olives', 'Tahini', 'Lemon juice'],
      instructions: ['Cook quinoa', 'Chop vegetables', 'Make tahini dressing', 'Assemble bowl', 'Drizzle with dressing'],
      calories: 420,
      prepTime: 10,
      totalTime: 25,
      author: 'Chef Elena',
      dateAdded: '2025-06-04'
    },
    {
      id: '5',
      title: 'Japanese Ramen',
      description: 'Rich and flavorful ramen with soft-boiled eggs',
      image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&h=300&fit=crop',
      cookTime: 45,
      servings: 2,
      difficulty: 'Hard',
      rating: 4.7,
      cuisine: 'Japanese',
      dietType: [],
      ingredients: ['Ramen noodles', 'Chicken broth', 'Soy sauce', 'Miso paste', 'Eggs', 'Green onions', 'Nori'],
      instructions: ['Prepare broth', 'Cook eggs', 'Cook noodles', 'Assemble bowls', 'Add toppings'],
      calories: 580,
      prepTime: 30,
      totalTime: 75,
      author: 'Chef Tanaka',
      dateAdded: '2025-06-05'
    },
    {
      id: '6',
      title: 'Avocado Toast',
      description: 'Simple and nutritious breakfast with fresh avocado',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
      cookTime: 5,
      servings: 1,
      difficulty: 'Easy',
      rating: 4.2,
      cuisine: 'Modern',
      dietType: ['Vegetarian', 'Vegan'],
      ingredients: ['2 slices bread', '1 ripe avocado', 'Salt', 'Pepper', 'Lemon juice', 'Red pepper flakes'],
      instructions: ['Toast bread', 'Mash avocado', 'Season with salt and pepper', 'Spread on toast', 'Garnish as desired'],
      calories: 280,
      prepTime: 5,
      totalTime: 10,
      author: 'Chef Alex',
      dateAdded: '2025-06-06'
    }
  ];

  // Initialize data on component mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes');
    const savedMyRecipes = localStorage.getItem('myRecipes');
    const savedMealPlans = localStorage.getItem('mealPlans');
    const savedShoppingList = localStorage.getItem('shoppingList');
    const savedSettings = localStorage.getItem('appSettings');

    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    } else {
      setRecipes(sampleRecipes);
      localStorage.setItem('recipes', JSON.stringify(sampleRecipes));
    }

    if (savedMyRecipes) {
      setMyRecipes(JSON.parse(savedMyRecipes));
    }

    if (savedMealPlans) {
      setMealPlans(JSON.parse(savedMealPlans));
    } else {
      // Initialize with current week
      const weekDays = getWeekDays();
      const initialMealPlans = weekDays.map(date => ({ id: date, date, breakfast: undefined, lunch: undefined, dinner: undefined, snack: undefined }));
      setMealPlans(initialMealPlans);
      localStorage.setItem('mealPlans', JSON.stringify(initialMealPlans));
    }

    if (savedShoppingList) {
      setShoppingList(JSON.parse(savedShoppingList));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    setFeaturedRecipes(sampleRecipes.slice(0, 3));
  }, []);

  // Utility Functions
  const getWeekDays = () => {
    const today = new Date();
    const week = [];
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day.toISOString().split('T')[0]);
    }
    return week;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Search and Filter Functions
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCuisine = !selectedCuisine || recipe.cuisine === selectedCuisine;
    const matchesDiet = !selectedDiet || recipe.dietType.includes(selectedDiet);
    const matchesDifficulty = !selectedDifficulty || recipe.difficulty === selectedDifficulty;
    const matchesTime = maxCookTime === 0 || recipe.cookTime <= maxCookTime;

    return matchesSearch && matchesCuisine && matchesDiet && matchesDifficulty && matchesTime;
  });

  // Recipe Management Functions
  const addRecipe = (recipeData: Partial<Recipe>) => {
    const newRecipeComplete: Recipe = {
      id: generateId(),
      title: recipeData.title || '',
      description: recipeData.description || '',
      image: recipeData.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
      cookTime: recipeData.cookTime || 30,
      servings: recipeData.servings || 4,
      difficulty: recipeData.difficulty || 'Medium',
      rating: 0,
      cuisine: recipeData.cuisine || '',
      dietType: recipeData.dietType || [],
      ingredients: recipeData.ingredients?.filter(ing => ing.trim()) || [],
      instructions: recipeData.instructions?.filter(inst => inst.trim()) || [],
      calories: recipeData.calories || 0,
      prepTime: recipeData.prepTime || 15,
      totalTime: (recipeData.prepTime || 15) + (recipeData.cookTime || 30),
      author: currentUser?.first_name || 'Unknown',
      dateAdded: new Date().toISOString().split('T')[0]
    };

    const updatedMyRecipes = [...myRecipes, newRecipeComplete];
    const updatedAllRecipes = [...recipes, newRecipeComplete];
    
    setMyRecipes(updatedMyRecipes);
    setRecipes(updatedAllRecipes);
    localStorage.setItem('myRecipes', JSON.stringify(updatedMyRecipes));
    localStorage.setItem('recipes', JSON.stringify(updatedAllRecipes));
  };

  const updateRecipe = (updatedRecipe: Recipe) => {
    const updatedMyRecipes = myRecipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    );
    const updatedAllRecipes = recipes.map(recipe => 
      recipe.id === updatedRecipe.id ? updatedRecipe : recipe
    );
    
    setMyRecipes(updatedMyRecipes);
    setRecipes(updatedAllRecipes);
    localStorage.setItem('myRecipes', JSON.stringify(updatedMyRecipes));
    localStorage.setItem('recipes', JSON.stringify(updatedAllRecipes));
  };

  const deleteRecipe = (recipeId: string) => {
    const updatedMyRecipes = myRecipes.filter(recipe => recipe.id !== recipeId);
    const updatedAllRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    
    setMyRecipes(updatedMyRecipes);
    setRecipes(updatedAllRecipes);
    localStorage.setItem('myRecipes', JSON.stringify(updatedMyRecipes));
    localStorage.setItem('recipes', JSON.stringify(updatedAllRecipes));
  };

  // Meal Planning Functions
  const addToMealPlan = (recipe: Recipe, date: string, mealType: string) => {
    const updatedMealPlans = mealPlans.map(plan => {
      if (plan.date === date) {
        return { ...plan, [mealType]: recipe };
      }
      return plan;
    });
    
    setMealPlans(updatedMealPlans);
    localStorage.setItem('mealPlans', JSON.stringify(updatedMealPlans));
  };

  const removeFromMealPlan = (date: string, mealType: string) => {
    const updatedMealPlans = mealPlans.map(plan => {
      if (plan.date === date) {
        const newPlan = { ...plan };
        delete newPlan[mealType as keyof MealPlan];
        return newPlan;
      }
      return plan;
    });
    
    setMealPlans(updatedMealPlans);
    localStorage.setItem('mealPlans', JSON.stringify(updatedMealPlans));
  };

  // Shopping List Functions
  const generateShoppingList = () => {
    const allIngredients: { [key: string]: { quantity: string; sources: string[] } } = {};
    
    mealPlans.forEach(plan => {
      ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
        const meal = plan[mealType as keyof MealPlan] as Recipe;
        if (meal?.ingredients) {
          meal.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase();
            if (allIngredients[key]) {
              allIngredients[key].sources.push(`${meal.title} (${formatDate(plan.date)})`);
            } else {
              allIngredients[key] = {
                quantity: ingredient,
                sources: [`${meal.title} (${formatDate(plan.date)})`]
              };
            }
          });
        }
      });
    });

    const newShoppingList: ShoppingListItem[] = Object.entries(allIngredients).map(([key, value]) => ({
      id: generateId(),
      ingredient: value.quantity,
      quantity: '1x',
      checked: false,
      recipeSource: value.sources.join(', ')
    }));

    setShoppingList(newShoppingList);
    localStorage.setItem('shoppingList', JSON.stringify(newShoppingList));
  };

  const toggleShoppingItem = (itemId: string) => {
    const updatedList = shoppingList.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    );
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  const addShoppingItem = (ingredient: string) => {
    const newItem: ShoppingListItem = {
      id: generateId(),
      ingredient,
      quantity: '1x',
      checked: false
    };
    const updatedList = [...shoppingList, newItem];
    setShoppingList(updatedList);
    localStorage.setItem('shoppingList', JSON.stringify(updatedList));
  };

  // AI Functions
  const handleAiRecipeAnalysis = () => {
    if (!aiPrompt.trim() && !selectedFile) {
      setAiError("Please provide a description or upload an image of ingredients/dish.");
      return;
    }

    setAiResult(null);
    setAiError(null);

    const enhancedPrompt = `Analyze this ${selectedFile ? 'image' : 'description'} and extract recipe information. Return a JSON object with the following fields:
    {
      "title": "Recipe name",
      "description": "Brief description",
      "cookTime": "cooking time in minutes (number)",
      "prepTime": "prep time in minutes (number)",
      "servings": "number of servings (number)",
      "difficulty": "Easy, Medium, or Hard",
      "cuisine": "cuisine type",
      "dietType": ["dietary types like Vegetarian, Vegan, Gluten-Free"],
      "ingredients": ["list of ingredients with quantities"],
      "instructions": ["step by step cooking instructions"],
      "calories": "estimated calories per serving (number)"
    }

    User input: ${aiPrompt || 'Please analyze the uploaded image'}`;

    aiLayerRef.current?.sendToAI(enhancedPrompt, selectedFile || undefined);
  };

  const handleAiResult = (result: string) => {
    setAiResult(result);
    
    try {
      const recipeData = JSON.parse(result);
      setNewRecipe({
        title: recipeData.title || '',
        description: recipeData.description || '',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
        cookTime: parseInt(recipeData.cookTime) || 30,
        prepTime: parseInt(recipeData.prepTime) || 15,
        servings: parseInt(recipeData.servings) || 4,
        difficulty: recipeData.difficulty || 'Medium',
        cuisine: recipeData.cuisine || '',
        dietType: Array.isArray(recipeData.dietType) ? recipeData.dietType : [],
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        calories: parseInt(recipeData.calories) || 0
      });
      setShowAddRecipe(true);
      setShowAiModal(false);
    } catch (error) {
      // If not JSON, show as markdown
      console.log('AI response is not JSON, displaying as text');
    }
  };

  // Data Management Functions
  const exportData = () => {
    const dataToExport = {
      recipes: myRecipes,
      mealPlans,
      shoppingList,
      settings
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recipe-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadTemplate = () => {
    const template = [
      ['Title', 'Description', 'Cook Time (min)', 'Prep Time (min)', 'Servings', 'Difficulty', 'Cuisine', 'Diet Types', 'Ingredients', 'Instructions', 'Calories'],
      ['Pasta Carbonara', 'Classic Italian pasta dish', '20', '10', '4', 'Medium', 'Italian', 'Vegetarian', 'pasta|eggs|cheese|bacon', 'Cook pasta|Fry bacon|Mix eggs|Combine|Serve', '520']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recipe-template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (file.name.endsWith('.csv')) {
          const csv = e.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',');
          
          const importedRecipes: Recipe[] = lines.slice(1).filter(line => line.trim()).map((line, index) => {
            const values = line.split(',');
            return {
              id: generateId(),
              title: values[0] || '',
              description: values[1] || '',
              image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
              cookTime: parseInt(values[2]) || 30,
              prepTime: parseInt(values[3]) || 15,
              servings: parseInt(values[4]) || 4,
              difficulty: (values[5] as 'Easy' | 'Medium' | 'Hard') || 'Medium',
              rating: 0,
              cuisine: values[6] || '',
              dietType: values[7] ? values[7].split('|') : [],
              ingredients: values[8] ? values[8].split('|') : [],
              instructions: values[9] ? values[9].split('|') : [],
              calories: parseInt(values[10]) || 0,
              totalTime: (parseInt(values[3]) || 15) + (parseInt(values[2]) || 30),
              author: currentUser?.first_name || 'Imported',
              dateAdded: new Date().toISOString().split('T')[0]
            };
          });

          const updatedMyRecipes = [...myRecipes, ...importedRecipes];
          const updatedAllRecipes = [...recipes, ...importedRecipes];
          
          setMyRecipes(updatedMyRecipes);
          setRecipes(updatedAllRecipes);
          localStorage.setItem('myRecipes', JSON.stringify(updatedMyRecipes));
          localStorage.setItem('recipes', JSON.stringify(updatedAllRecipes));
        }
      } catch (error) {
        console.error('Error importing data:', error);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const clearAllData = () => {
    setMyRecipes([]);
    setMealPlans(getWeekDays().map(date => ({ id: date, date })));
    setShoppingList([]);
    localStorage.removeItem('myRecipes');
    localStorage.removeItem('mealPlans');
    localStorage.removeItem('shoppingList');
  };

  // Form Handlers
  const handleAddRecipe = () => {
    if (!newRecipe.title?.trim()) return;
    
    addRecipe(newRecipe);
    setNewRecipe({
      title: '',
      description: '',
      image: '',
      cookTime: 30,
      servings: 4,
      difficulty: 'Medium',
      cuisine: '',
      dietType: [],
      ingredients: [''],
      instructions: [''],
      calories: 0,
      prepTime: 15
    });
    setShowAddRecipe(false);
  };

  const handleEditRecipe = () => {
    if (!editingRecipe || !editingRecipe.title?.trim()) return;
    
    updateRecipe(editingRecipe);
    setEditingRecipe(null);
  };

  const addIngredient = () => {
    if (editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        ingredients: [...editingRecipe.ingredients, '']
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        ingredients: [...(newRecipe.ingredients || []), '']
      });
    }
  };

  const addInstruction = () => {
    if (editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        instructions: [...editingRecipe.instructions, '']
      });
    } else {
      setNewRecipe({
        ...newRecipe,
        instructions: [...(newRecipe.instructions || []), '']
      });
    }
  };

  const updateIngredient = (index: number, value: string) => {
    if (editingRecipe) {
      const updatedIngredients = [...editingRecipe.ingredients];
      updatedIngredients[index] = value;
      setEditingRecipe({
        ...editingRecipe,
        ingredients: updatedIngredients
      });
    } else {
      const updatedIngredients = [...(newRecipe.ingredients || [])];
      updatedIngredients[index] = value;
      setNewRecipe({
        ...newRecipe,
        ingredients: updatedIngredients
      });
    }
  };

  const updateInstruction = (index: number, value: string) => {
    if (editingRecipe) {
      const updatedInstructions = [...editingRecipe.instructions];
      updatedInstructions[index] = value;
      setEditingRecipe({
        ...editingRecipe,
        instructions: updatedInstructions
      });
    } else {
      const updatedInstructions = [...(newRecipe.instructions || [])];
      updatedInstructions[index] = value;
      setNewRecipe({
        ...newRecipe,
        instructions: updatedInstructions
      });
    }
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddRecipe(false);
        setShowSettings(false);
        setShowMealPlanModal(false);
        setShowAiModal(false);
        setEditingRecipe(null);
        setSelectedMealSlot(null);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const cuisines = ['Italian', 'Thai', 'American', 'Mediterranean', 'Japanese', 'Mexican', 'Indian', 'French', 'Chinese', 'Modern'];
  const dietTypes = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Keto', 'Paleo', 'Low-Carb', 'Dairy-Free'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  return (
    <div id="welcome_fallback" className="min-h-screen bg-gray-50 dark:bg-gray-900 theme-transition">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container container-lg">
          <div className="flex-between py-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-primary-600" />
              <h1 className="heading-4 text-gray-900 dark:text-white">Recipe Finder</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <span>Welcome, {currentUser?.first_name}</span>
                <button
                  onClick={logout}
                  className="btn btn-sm btn-secondary"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 theme-transition">
        <div className="container container-lg">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'search', label: 'Search Recipes', icon: Search },
              { id: 'featured', label: 'Featured', icon: Star },
              { id: 'my-recipes', label: 'My Recipes', icon: BookOpen },
              { id: 'meal-plan', label: 'Meal Planner', icon: Calendar },
              { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
              { id: 'settings', label: 'Settings', icon: SettingsIcon }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                id={`${id}-tab`}
                onClick={() => setActiveTab(id)}
                className={`tab ${activeTab === id ? 'tab-active' : ''} flex items-center gap-2 whitespace-nowrap`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container container-lg py-8">
        {/* Search Recipes Tab */}
        {activeTab === 'search' && (
          <div id="generation_issue_fallback" className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search and Filters */}
              <div className="lg:w-1/4 space-y-4">
                <div className="card card-padding">
                  <h3 className="heading-5 mb-4 flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Search & Filter
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Search Input */}
                    <div className="form-group">
                      <label className="form-label">Search Recipes</label>
                      <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, ingredient..."
                        className="input"
                      />
                    </div>

                    {/* AI Recipe Analysis */}
                    <button
                      id="ai-recipe-button"
                      onClick={() => setShowAiModal(true)}
                      className="btn btn-primary w-full flex items-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      AI Recipe Analysis
                    </button>

                    {/* Cuisine Filter */}
                    <div className="form-group">
                      <label className="form-label">Cuisine</label>
                      <select
                        value={selectedCuisine}
                        onChange={(e) => setSelectedCuisine(e.target.value)}
                        className="select"
                      >
                        <option value="">All Cuisines</option>
                        {cuisines.map(cuisine => (
                          <option key={cuisine} value={cuisine}>{cuisine}</option>
                        ))}
                      </select>
                    </div>

                    {/* Diet Filter */}
                    <div className="form-group">
                      <label className="form-label">Diet Type</label>
                      <select
                        value={selectedDiet}
                        onChange={(e) => setSelectedDiet(e.target.value)}
                        className="select"
                      >
                        <option value="">All Diet Types</option>
                        {dietTypes.map(diet => (
                          <option key={diet} value={diet}>{diet}</option>
                        ))}
                      </select>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="form-group">
                      <label className="form-label">Difficulty</label>
                      <select
                        value={selectedDifficulty}
                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                        className="select"
                      >
                        <option value="">All Difficulties</option>
                        {difficulties.map(difficulty => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    </div>

                    {/* Cook Time Filter */}
                    <div className="form-group">
                      <label className="form-label">Max Cook Time (minutes)</label>
                      <input
                        type="number"
                        value={maxCookTime || ''}
                        onChange={(e) => setMaxCookTime(parseInt(e.target.value) || 0)}
                        placeholder="Any duration"
                        className="input"
                      />
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCuisine('');
                        setSelectedDiet('');
                        setSelectedDifficulty('');
                        setMaxCookTime(0);
                      }}
                      className="btn btn-secondary w-full"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </div>

              {/* Recipe Results */}
              <div className="lg:w-3/4">
                <div className="flex-between mb-4">
                  <h2 className="heading-4">
                    {searchQuery ? `Search Results (${filteredRecipes.length})` : `All Recipes (${filteredRecipes.length})`}
                  </h2>
                  <button
                    id="add-recipe-button"
                    onClick={() => setShowAddRecipe(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Recipe
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredRecipes.map(recipe => (
                    <div key={recipe.id} className="card card-hover rounded-xl overflow-hidden">
                      <img 
                        src={recipe.image} 
                        alt={recipe.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="heading-6 mb-1">{recipe.title}</h3>
                          <p className="text-caption line-clamp-2">{recipe.description}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {recipe.dietType.map(diet => (
                            <span key={diet} className="badge badge-success text-xs">{diet}</span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {recipe.cookTime}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {recipe.servings}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {recipe.rating}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`badge ${recipe.difficulty === 'Easy' ? 'badge-success' : recipe.difficulty === 'Medium' ? 'badge-warning' : 'badge-error'}`}>
                            {recipe.difficulty}
                          </span>
                          <span className="badge badge-gray">{recipe.cuisine}</span>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => {
                              setSelectedMealSlot({ date: new Date().toISOString().split('T')[0], meal: 'lunch' });
                              setShowMealPlanModal(true);
                            }}
                            className="btn btn-sm btn-secondary flex-1"
                          >
                            Add to Plan
                          </button>
                          <button
                            onClick={() => {
                              const ingredients = recipe.ingredients.map(ing => ({
                                id: generateId(),
                                ingredient: ing,
                                quantity: '1x',
                                checked: false,
                                recipeSource: recipe.title
                              }));
                              setShoppingList([...shoppingList, ...ingredients]);
                              localStorage.setItem('shoppingList', JSON.stringify([...shoppingList, ...ingredients]));
                            }}
                            className="btn btn-sm btn-primary"
                          >
                            <ShoppingCart className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRecipes.length === 0 && (
                  <div className="text-center py-12">
                    <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No recipes found. Try adjusting your filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Featured Recipes Tab */}
        {activeTab === 'featured' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">Featured Recipes</h2>
              <span className="badge badge-primary">Editor's Choice</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {featuredRecipes.map((recipe, index) => (
                <div key={recipe.id} className={`card card-hover rounded-xl overflow-hidden ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`}>
                  <img 
                    src={recipe.image} 
                    alt={recipe.title}
                    className={`w-full object-cover ${index === 0 ? 'h-64 lg:h-80' : 'h-48'}`}
                  />
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className={`${index === 0 ? 'heading-4' : 'heading-5'} mb-2`}>{recipe.title}</h3>
                      <p className="text-caption">{recipe.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {recipe.dietType.map(diet => (
                        <span key={diet} className="badge badge-success">{diet}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {recipe.cookTime}m
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {recipe.servings}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {recipe.rating}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="btn btn-primary flex-1">View Recipe</button>
                      <button className="btn btn-secondary">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Recipes Tab */}
        {activeTab === 'my-recipes' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">My Recipes ({myRecipes.length})</h2>
              <div className="flex gap-2">
                <button
                  onClick={downloadTemplate}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Template
                </button>
                <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowAddRecipe(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Recipe
                </button>
              </div>
            </div>

            {myRecipes.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't added any recipes yet.</p>
                <button
                  onClick={() => setShowAddRecipe(true)}
                  className="btn btn-primary"
                >
                  Add Your First Recipe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {myRecipes.map(recipe => (
                  <div key={recipe.id} className="card card-hover rounded-xl overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="heading-6 mb-1">{recipe.title}</h3>
                        <p className="text-caption line-clamp-2">{recipe.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {recipe.dietType.map(diet => (
                          <span key={diet} className="badge badge-success text-xs">{diet}</span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recipe.cookTime}m
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {recipe.servings}
                          </div>
                        </div>
                        <span className="text-xs">Added {recipe.dateAdded}</span>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setEditingRecipe(recipe)}
                          className="btn btn-sm btn-secondary flex-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteRecipe(recipe.id)}
                          className="btn btn-sm btn-error"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Meal Planner Tab */}
        {activeTab === 'meal-plan' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">Weekly Meal Planner</h2>
              <button
                onClick={generateShoppingList}
                className="btn btn-primary flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" />
                Generate Shopping List
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
              {mealPlans.map(plan => (
                <div key={plan.id} className="card rounded-xl">
                  <div className="p-4">
                    <h3 className="heading-6 text-center mb-4">{formatDate(plan.date)}</h3>
                    
                    {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                      <div key={mealType} className="mb-3 last:mb-0">
                        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 capitalize">{mealType}</h4>
                        {plan[mealType as keyof MealPlan] ? (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                            <div className="flex-between">
                              <div>
                                <p className="text-sm font-medium">{(plan[mealType as keyof MealPlan] as Recipe)?.title}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {(plan[mealType as keyof MealPlan] as Recipe)?.cookTime}m
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromMealPlan(plan.date, mealType)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedMealSlot({ date: plan.date, meal: mealType });
                              setShowMealPlanModal(true);
                            }}
                            className="w-full p-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors text-sm"
                          >
                            + Add {mealType}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shopping' && (
          <div className="space-y-6">
            <div className="flex-between">
              <h2 className="heading-3">Shopping List ({shoppingList.filter(item => !item.checked).length} remaining)</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const ingredient = prompt('Add ingredient:');
                    if (ingredient?.trim()) addShoppingItem(ingredient.trim());
                  }}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
                <button
                  onClick={() => {
                    setShoppingList([]);
                    localStorage.removeItem('shoppingList');
                  }}
                  className="btn btn-error flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>

            {shoppingList.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">Your shopping list is empty.</p>
                <button
                  onClick={generateShoppingList}
                  className="btn btn-primary"
                >
                  Generate from Meal Plan
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="heading-5">To Buy</h3>
                  {shoppingList.filter(item => !item.checked).map(item => (
                    <div key={item.id} className="card card-padding flex-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className="w-5 h-5 border-2 border-gray-300 rounded hover:border-primary-500 transition-colors"
                        />
                        <div>
                          <p className="font-medium">{item.ingredient}</p>
                          {item.recipeSource && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.recipeSource}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <h3 className="heading-5">Completed</h3>
                  {shoppingList.filter(item => item.checked).map(item => (
                    <div key={item.id} className="card card-padding flex-between opacity-60">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleShoppingItem(item.id)}
                          className="w-5 h-5 bg-green-500 rounded flex items-center justify-center"
                        >
                          <Check className="w-3 h-3 text-white" />
                        </button>
                        <div>
                          <p className="font-medium line-through">{item.ingredient}</p>
                          {item.recipeSource && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.recipeSource}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="heading-3">Settings</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card card-padding space-y-4">
                <h3 className="heading-5">Preferences</h3>
                
                <div className="form-group">
                  <label className="form-label">Default Servings</label>
                  <input
                    type="number"
                    value={settings.defaultServings}
                    onChange={(e) => setSettings({...settings, defaultServings: parseInt(e.target.value) || 4})}
                    className="input"
                    min="1"
                    max="20"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="it">Italian</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    className="select"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div className="card card-padding space-y-4">
                <h3 className="heading-5">Data Management</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={exportData}
                    className="btn btn-secondary w-full flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export All Data
                  </button>

                  <label className="btn btn-secondary w-full flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Import Recipes
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={downloadTemplate}
                    className="btn btn-secondary w-full flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download CSV Template
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm && window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
                        clearAllData();
                      } else {
                        // Use state-managed confirmation instead
                        const confirmed = true; // In a real app, you'd use a modal here
                        if (confirmed) clearAllData();
                      }
                    }}
                    className="btn btn-error w-full flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">Add New Recipe</h3>
              <button onClick={() => setShowAddRecipe(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Recipe Title</label>
                  <input
                    type="text"
                    value={newRecipe.title || ''}
                    onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                    className="input"
                    placeholder="Enter recipe title"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={newRecipe.image || ''}
                    onChange={(e) => setNewRecipe({...newRecipe, image: e.target.value})}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newRecipe.description || ''}
                  onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                  className="textarea"
                  placeholder="Brief description of the recipe"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label">Prep Time (min)</label>
                  <input
                    type="number"
                    value={newRecipe.prepTime || 15}
                    onChange={(e) => setNewRecipe({...newRecipe, prepTime: parseInt(e.target.value) || 15})}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cook Time (min)</label>
                  <input
                    type="number"
                    value={newRecipe.cookTime || 30}
                    onChange={(e) => setNewRecipe({...newRecipe, cookTime: parseInt(e.target.value) || 30})}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Servings</label>
                  <input
                    type="number"
                    value={newRecipe.servings || 4}
                    onChange={(e) => setNewRecipe({...newRecipe, servings: parseInt(e.target.value) || 4})}
                    className="input"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Calories</label>
                  <input
                    type="number"
                    value={newRecipe.calories || 0}
                    onChange={(e) => setNewRecipe({...newRecipe, calories: parseInt(e.target.value) || 0})}
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    value={newRecipe.difficulty || 'Medium'}
                    onChange={(e) => setNewRecipe({...newRecipe, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard'})}
                    className="select"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cuisine</label>
                  <select
                    value={newRecipe.cuisine || ''}
                    onChange={(e) => setNewRecipe({...newRecipe, cuisine: e.target.value})}
                    className="select"
                  >
                    <option value="">Select cuisine</option>
                    {cuisines.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Diet Type</label>
                  <select
                    multiple
                    value={newRecipe.dietType || []}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setNewRecipe({...newRecipe, dietType: values});
                    }}
                    className="select"
                    size={3}
                  >
                    {dietTypes.map(diet => (
                      <option key={diet} value={diet}>{diet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ingredients</label>
                <div className="space-y-2">
                  {(newRecipe.ingredients || ['']).map((ingredient, index) => (
                    <input
                      key={index}
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="input"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="btn btn-sm btn-secondary"
                  >
                    Add Ingredient
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions</label>
                <div className="space-y-2">
                  {(newRecipe.instructions || ['']).map((instruction, index) => (
                    <textarea
                      key={index}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="textarea"
                      placeholder={`Step ${index + 1}`}
                      rows={2}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="btn btn-sm btn-secondary"
                  >
                    Add Step
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowAddRecipe(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleAddRecipe} className="btn btn-primary">
                Add Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Recipe Modal */}
      {editingRecipe && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">Edit Recipe</h3>
              <button onClick={() => setEditingRecipe(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label form-label-required">Recipe Title</label>
                  <input
                    type="text"
                    value={editingRecipe.title}
                    onChange={(e) => setEditingRecipe({...editingRecipe, title: e.target.value})}
                    className="input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    value={editingRecipe.image}
                    onChange={(e) => setEditingRecipe({...editingRecipe, image: e.target.value})}
                    className="input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={editingRecipe.description}
                  onChange={(e) => setEditingRecipe({...editingRecipe, description: e.target.value})}
                  className="textarea"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="form-group">
                  <label className="form-label">Prep Time (min)</label>
                  <input
                    type="number"
                    value={editingRecipe.prepTime || 15}
                    onChange={(e) => setEditingRecipe({...editingRecipe, prepTime: parseInt(e.target.value) || 15})}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cook Time (min)</label>
                  <input
                    type="number"
                    value={editingRecipe.cookTime}
                    onChange={(e) => setEditingRecipe({...editingRecipe, cookTime: parseInt(e.target.value) || 30})}
                    className="input"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Servings</label>
                  <input
                    type="number"
                    value={editingRecipe.servings}
                    onChange={(e) => setEditingRecipe({...editingRecipe, servings: parseInt(e.target.value) || 4})}
                    className="input"
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Calories</label>
                  <input
                    type="number"
                    value={editingRecipe.calories || 0}
                    onChange={(e) => setEditingRecipe({...editingRecipe, calories: parseInt(e.target.value) || 0})}
                    className="input"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select
                    value={editingRecipe.difficulty}
                    onChange={(e) => setEditingRecipe({...editingRecipe, difficulty: e.target.value as 'Easy' | 'Medium' | 'Hard'})}
                    className="select"
                  >
                    {difficulties.map(difficulty => (
                      <option key={difficulty} value={difficulty}>{difficulty}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Cuisine</label>
                  <select
                    value={editingRecipe.cuisine}
                    onChange={(e) => setEditingRecipe({...editingRecipe, cuisine: e.target.value})}
                    className="select"
                  >
                    <option value="">Select cuisine</option>
                    {cuisines.map(cuisine => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Diet Type</label>
                  <select
                    multiple
                    value={editingRecipe.dietType}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setEditingRecipe({...editingRecipe, dietType: values});
                    }}
                    className="select"
                    size={3}
                  >
                    {dietTypes.map(diet => (
                      <option key={diet} value={diet}>{diet}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Ingredients</label>
                <div className="space-y-2">
                  {editingRecipe.ingredients.map((ingredient, index) => (
                    <input
                      key={index}
                      type="text"
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      className="input"
                      placeholder={`Ingredient ${index + 1}`}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="btn btn-sm btn-secondary"
                  >
                    Add Ingredient
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Instructions</label>
                <div className="space-y-2">
                  {editingRecipe.instructions.map((instruction, index) => (
                    <textarea
                      key={index}
                      value={instruction}
                      onChange={(e) => updateInstruction(index, e.target.value)}
                      className="textarea"
                      placeholder={`Step ${index + 1}`}
                      rows={2}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={addInstruction}
                    className="btn btn-sm btn-secondary"
                  >
                    Add Step
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setEditingRecipe(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleEditRecipe} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Modal */}
      {showMealPlanModal && selectedMealSlot && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="heading-5">Add to {selectedMealSlot.meal} on {formatDate(selectedMealSlot.date)}</h3>
              <button onClick={() => setShowMealPlanModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recipes.map(recipe => (
                  <div
                    key={recipe.id}
                    onClick={() => {
                      addToMealPlan(recipe, selectedMealSlot.date, selectedMealSlot.meal);
                      setShowMealPlanModal(false);
                      setSelectedMealSlot(null);
                    }}
                    className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  >
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{recipe.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3" />
                        {recipe.cookTime}m
                        <Users className="w-3 h-3" />
                        {recipe.servings}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowMealPlanModal(false)} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Recipe Analysis Modal */}
      {showAiModal && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-2xl">
            <div className="modal-header">
              <h3 className="heading-5">AI Recipe Analysis</h3>
              <button onClick={() => setShowAiModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div className="alert alert-info">
                <p className="text-sm">
                  Upload an image of ingredients or a dish, or describe what you'd like to cook. 
                  Our AI will analyze it and suggest a recipe with ingredients and instructions.
                  <br /><br />
                  <em>Note: AI may make mistakes. Please verify all ingredients and cooking instructions before use.</em>
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Describe your ingredients or dish</label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="textarea"
                  placeholder="E.g., 'I have chicken, rice, and vegetables' or 'How to make chocolate chip cookies'"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Upload image (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="input"
                />
              </div>

              {aiResult && (
                <div className="space-y-2">
                  <label className="form-label">AI Analysis Result</label>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {aiResult}
                    </ReactMarkdown>
                  </div>
                </div>
              )}

              {aiError && (
                <div className="alert alert-error">
                  <p>Error: {aiError.message || 'Something went wrong. Please try again.'}</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowAiModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleAiRecipeAnalysis}
                disabled={isAiLoading || (!aiPrompt.trim() && !selectedFile)}
                className={`btn btn-primary ${isAiLoading ? 'btn-loading' : ''}`}
              >
                {isAiLoading ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="container container-lg py-6">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved</p>
          </div>
        </div>
      </footer>

      {/* AI Layer Component */}
      <AILayer
        ref={aiLayerRef}
        prompt={aiPrompt}
        attachment={selectedFile || undefined}
        onResult={handleAiResult}
        onError={(error) => setAiError(error)}
        onLoading={(loading) => setIsAiLoading(loading)}
      />
    </div>
  );
};

export default App;