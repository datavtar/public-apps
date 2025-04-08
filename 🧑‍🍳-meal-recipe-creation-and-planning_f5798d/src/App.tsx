import React, { useState, useEffect } from 'react';
import {
  Book,
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  ChevronDown,
  Calendar,
  Check,
  Clock,
  ArrowLeftRight,
  Utensils,
  Receipt,
  FileText,
  ArrowDown,
  ArrowUp,
  ChevronUp,
  X,
  Coffee,
  Pizza,
  Moon,
  Sun
} from 'lucide-react';
import styles from './styles/styles.module.css';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

type Instruction = {
  id: string;
  step: number;
  description: string;
};

type NutritionInfo = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

type Recipe = {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: Instruction[];
  prepTime: number;
  cookTime: number;
  servings: number;
  cuisine: string;
  category: string;
  tags: string[];
  imageUrl: string;
  isFavorite: boolean;
  dateCreated: string;
  lastModified: string;
  nutritionInfo: NutritionInfo;
};

type MealPlan = {
  id: string;
  name: string;
  description: string;
  dates: string[];
  meals: {
    id: string;
    date: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
    recipeId: string;
    notes: string;
  }[];
  dateCreated: string;
  lastModified: string;
};

type ShoppingItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  isChecked: boolean;
};

const CUISINES = [
  'Italian',
  'French',
  'Mexican',
  'Indian',
  'Chinese',
  'Japanese',
  'Mediterranean',
  'American',
  'Thai',
  'Greek',
  'Spanish',
  'Korean',
  'Vietnamese',
  'Turkish',
  'Moroccan',
  'Other'
];

const CATEGORIES = [
  'Appetizer',
  'Soup',
  'Salad',
  'Main Course',
  'Side Dish',
  'Dessert',
  'Breakfast',
  'Bread',
  'Beverage',
  'Snack',
  'Sauce',
  'Other'
];

const MEAL_TYPES = [
  'breakfast',
  'lunch',
  'dinner',
  'snack'
];

const UNITS = [
  'g',
  'kg',
  'ml',
  'l',
  'tsp',
  'tbsp',
  'cup',
  'oz',
  'lb',
  'pinch',
  'piece',
  'slice',
  'clove',
  'whole',
  'bunch',
  'other'
];

const App: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [activeTab, setActiveTab] = useState<'recipes' | 'mealPlans' | 'shoppingList'>('recipes');
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState<boolean>(false);
  const [isMealPlanModalOpen, setIsMealPlanModalOpen] = useState<boolean>(false);
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null);
  const [currentMealPlan, setCurrentMealPlan] = useState<MealPlan | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCuisine, setFilterCuisine] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'name' | 'dateCreated'>('dateCreated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [recipeTemplateUrl, setRecipeTemplateUrl] = useState<string>('');

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const savedRecipes = localStorage.getItem('chefRecipes');
      if (savedRecipes) {
        setRecipes(JSON.parse(savedRecipes));
      } else {
        // Initialize with some sample data
        setRecipes(sampleRecipes);
        localStorage.setItem('chefRecipes', JSON.stringify(sampleRecipes));
      }

      const savedMealPlans = localStorage.getItem('chefMealPlans');
      if (savedMealPlans) {
        setMealPlans(JSON.parse(savedMealPlans));
      } else {
        setMealPlans(sampleMealPlans);
        localStorage.setItem('chefMealPlans', JSON.stringify(sampleMealPlans));
      }

      const savedShoppingList = localStorage.getItem('chefShoppingList');
      if (savedShoppingList) {
        setShoppingList(JSON.parse(savedShoppingList));
      }

      const savedDarkMode = localStorage.getItem('chefDarkMode');
      if (savedDarkMode) {
        setIsDarkMode(JSON.parse(savedDarkMode));
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
        localStorage.setItem('chefDarkMode', JSON.stringify(prefersDark));
      }

      // Create recipe template file
      createRecipeTemplate();
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('chefRecipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('chefMealPlans', JSON.stringify(mealPlans));
  }, [mealPlans]);

  useEffect(() => {
    localStorage.setItem('chefShoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  useEffect(() => {
    localStorage.setItem('chefDarkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Helper function to generate a unique ID
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  // Create recipe template file for download
  const createRecipeTemplate = () => {
    const template = {
      name: "Recipe Name",
      description: "Description of the recipe",
      ingredients: [
        { name: "Ingredient 1", quantity: 1, unit: "cup" },
        { name: "Ingredient 2", quantity: 2, unit: "tbsp" }
      ],
      instructions: [
        { step: 1, description: "First step instruction" },
        { step: 2, description: "Second step instruction" }
      ],
      prepTime: 15,
      cookTime: 30,
      servings: 4,
      cuisine: "Italian",
      category: "Main Course",
      tags: ["pasta", "quick", "vegetarian"],
      nutritionInfo: {
        calories: 450,
        protein: 12,
        carbs: 55,
        fat: 15
      }
    };
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    setRecipeTemplateUrl(url);
    return url;
  };

  // Filter and sort recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCuisine = filterCuisine === 'All' || recipe.cuisine === filterCuisine;
    const matchesCategory = filterCategory === 'All' || recipe.category === filterCategory;
    
    return matchesSearch && matchesCuisine && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      return sortOrder === 'asc' 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return sortOrder === 'asc'
        ? new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
        : new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
    }
  });

  // Create a new recipe
  const handleCreateRecipe = () => {
    const newRecipe: Recipe = {
      id: generateId(),
      name: '',
      description: '',
      ingredients: [],
      instructions: [],
      prepTime: 0,
      cookTime: 0,
      servings: 1,
      cuisine: 'Italian',
      category: 'Main Course',
      tags: [],
      imageUrl: '',
      isFavorite: false,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    };
    setCurrentRecipe(newRecipe);
    setIsRecipeModalOpen(true);
  };

  // Edit a recipe
  const handleEditRecipe = (recipe: Recipe) => {
    setCurrentRecipe({...recipe});
    setIsRecipeModalOpen(true);
  };

  // Delete a recipe
  const handleDeleteRecipe = (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(recipes.filter(recipe => recipe.id !== id));
      
      // Also remove from meal plans
      const updatedMealPlans = mealPlans.map(plan => {
        return {
          ...plan,
          meals: plan.meals.filter(meal => meal.recipeId !== id)
        };
      });
      setMealPlans(updatedMealPlans);
    }
  };

  // Save recipe
  const handleSaveRecipe = (recipe: Recipe) => {
    if (!recipe.name) {
      alert('Recipe name is required');
      return;
    }
    
    const now = new Date().toISOString();
    const updatedRecipe = {
      ...recipe,
      lastModified: now
    };
    
    if (recipes.some(r => r.id === recipe.id)) {
      setRecipes(recipes.map(r => r.id === recipe.id ? updatedRecipe : r));
    } else {
      setRecipes([...recipes, updatedRecipe]);
    }
    
    setIsRecipeModalOpen(false);
    setCurrentRecipe(null);
  };

  // Add ingredient to recipe
  const handleAddIngredient = () => {
    if (currentRecipe) {
      const newIngredient: Ingredient = {
        id: generateId(),
        name: '',
        quantity: 1,
        unit: 'g'
      };
      
      setCurrentRecipe({
        ...currentRecipe,
        ingredients: [...currentRecipe.ingredients, newIngredient]
      });
    }
  };

  // Remove ingredient from recipe
  const handleRemoveIngredient = (id: string) => {
    if (currentRecipe) {
      setCurrentRecipe({
        ...currentRecipe,
        ingredients: currentRecipe.ingredients.filter(ing => ing.id !== id)
      });
    }
  };

  // Add instruction to recipe
  const handleAddInstruction = () => {
    if (currentRecipe) {
      const newStep = currentRecipe.instructions.length + 1;
      const newInstruction: Instruction = {
        id: generateId(),
        step: newStep,
        description: ''
      };
      
      setCurrentRecipe({
        ...currentRecipe,
        instructions: [...currentRecipe.instructions, newInstruction]
      });
    }
  };

  // Remove instruction from recipe
  const handleRemoveInstruction = (id: string) => {
    if (currentRecipe) {
      const filteredInstructions = currentRecipe.instructions.filter(ins => ins.id !== id);
      
      // Reorder steps after removal
      const reorderedInstructions = filteredInstructions.map((ins, index) => ({
        ...ins,
        step: index + 1
      }));
      
      setCurrentRecipe({
        ...currentRecipe,
        instructions: reorderedInstructions
      });
    }
  };

  // Create a new meal plan
  const handleCreateMealPlan = () => {
    const newMealPlan: MealPlan = {
      id: generateId(),
      name: '',
      description: '',
      dates: [],
      meals: [],
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setCurrentMealPlan(newMealPlan);
    setIsMealPlanModalOpen(true);
  };

  // Edit a meal plan
  const handleEditMealPlan = (mealPlan: MealPlan) => {
    setCurrentMealPlan({...mealPlan});
    setIsMealPlanModalOpen(true);
  };

  // Delete a meal plan
  const handleDeleteMealPlan = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      setMealPlans(mealPlans.filter(plan => plan.id !== id));
    }
  };

  // Save meal plan
  const handleSaveMealPlan = (mealPlan: MealPlan) => {
    if (!mealPlan.name) {
      alert('Meal plan name is required');
      return;
    }
    
    const now = new Date().toISOString();
    const updatedMealPlan = {
      ...mealPlan,
      lastModified: now
    };
    
    if (mealPlans.some(p => p.id === mealPlan.id)) {
      setMealPlans(mealPlans.map(p => p.id === mealPlan.id ? updatedMealPlan : p));
    } else {
      setMealPlans([...mealPlans, updatedMealPlan]);
    }
    
    setIsMealPlanModalOpen(false);
    setCurrentMealPlan(null);
  };

  // Add a date to meal plan
  const handleAddDateToMealPlan = (dateStr: string) => {
    if (currentMealPlan && dateStr && !currentMealPlan.dates.includes(dateStr)) {
      setCurrentMealPlan({
        ...currentMealPlan,
        dates: [...currentMealPlan.dates, dateStr].sort()
      });
    }
  };

  // Remove a date from meal plan
  const handleRemoveDateFromMealPlan = (dateStr: string) => {
    if (currentMealPlan) {
      setCurrentMealPlan({
        ...currentMealPlan,
        dates: currentMealPlan.dates.filter(d => d !== dateStr),
        meals: currentMealPlan.meals.filter(meal => meal.date !== dateStr)
      });
    }
  };

  // Add a meal to meal plan
  const handleAddMealToMealPlan = (date: string, mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (currentMealPlan && recipes.length > 0) {
      const newMeal = {
        id: generateId(),
        date,
        type: mealType,
        recipeId: recipes[0].id,
        notes: ''
      };
      
      setCurrentMealPlan({
        ...currentMealPlan,
        meals: [...currentMealPlan.meals, newMeal]
      });
    } else if (recipes.length === 0) {
      alert('You need to create some recipes first!');
    }
  };

  // Remove a meal from meal plan
  const handleRemoveMealFromMealPlan = (mealId: string) => {
    if (currentMealPlan) {
      setCurrentMealPlan({
        ...currentMealPlan,
        meals: currentMealPlan.meals.filter(meal => meal.id !== mealId)
      });
    }
  };

  // Generate shopping list from meal plan
  const handleGenerateShoppingList = (mealPlanId: string) => {
    const plan = mealPlans.find(p => p.id === mealPlanId);
    if (!plan) return;
    
    const items: Record<string, ShoppingItem> = {};
    
    plan.meals.forEach(meal => {
      const recipe = recipes.find(r => r.id === meal.recipeId);
      if (!recipe) return;
      
      recipe.ingredients.forEach(ing => {
        const key = `${ing.name}-${ing.unit}`;
        if (items[key]) {
          items[key].quantity += ing.quantity;
        } else {
          items[key] = {
            id: generateId(),
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            isChecked: false
          };
        }
      });
    });
    
    setShoppingList(Object.values(items));
    setActiveTab('shoppingList');
  };

  // Toggle shopping item check
  const handleToggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? {...item, isChecked: !item.isChecked} : item
    ));
  };

  // Clear shopping list
  const handleClearShoppingList = () => {
    if (window.confirm('Are you sure you want to clear the shopping list?')) {
      setShoppingList([]);
    }
  };

  // Sample recipes for initial data
  const sampleRecipes: Recipe[] = [
    {
      id: 'sample1',
      name: 'Pasta Carbonara',
      description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
      ingredients: [
        { id: 'ing1', name: 'Spaghetti', quantity: 400, unit: 'g' },
        { id: 'ing2', name: 'Pancetta', quantity: 150, unit: 'g' },
        { id: 'ing3', name: 'Eggs', quantity: 3, unit: 'whole' },
        { id: 'ing4', name: 'Parmesan Cheese', quantity: 50, unit: 'g' },
        { id: 'ing5', name: 'Black Pepper', quantity: 1, unit: 'tsp' },
        { id: 'ing6', name: 'Salt', quantity: 1, unit: 'tsp' }
      ],
      instructions: [
        { id: 'inst1', step: 1, description: 'Bring a large pot of salted water to boil and cook spaghetti according to package instructions.' },
        { id: 'inst2', step: 2, description: 'Meanwhile, in a large skillet, cook pancetta until crispy.' },
        { id: 'inst3', step: 3, description: 'In a bowl, whisk eggs and grated cheese together.' },
        { id: 'inst4', step: 4, description: 'Drain pasta, reserving some pasta water, and immediately add to the skillet with pancetta.' },
        { id: 'inst5', step: 5, description: 'Remove from heat and quickly stir in egg and cheese mixture, creating a creamy sauce.' },
        { id: 'inst6', step: 6, description: 'Add some reserved pasta water if needed to achieve desired consistency.' },
        { id: 'inst7', step: 7, description: 'Season with freshly ground black pepper and serve immediately.' }
      ],
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      cuisine: 'Italian',
      category: 'Main Course',
      tags: ['pasta', 'italian', 'quick', 'eggs'],
      imageUrl: '',
      isFavorite: true,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      nutritionInfo: {
        calories: 450,
        protein: 22,
        carbs: 55,
        fat: 18
      }
    },
    {
      id: 'sample2',
      name: 'Greek Salad',
      description: 'Fresh Mediterranean salad with tomatoes, cucumbers, olives, and feta cheese.',
      ingredients: [
        { id: 'ing1', name: 'Tomatoes', quantity: 4, unit: 'whole' },
        { id: 'ing2', name: 'Cucumber', quantity: 1, unit: 'whole' },
        { id: 'ing3', name: 'Red Onion', quantity: 1, unit: 'whole' },
        { id: 'ing4', name: 'Kalamata Olives', quantity: 100, unit: 'g' },
        { id: 'ing5', name: 'Feta Cheese', quantity: 200, unit: 'g' },
        { id: 'ing6', name: 'Olive Oil', quantity: 3, unit: 'tbsp' },
        { id: 'ing7', name: 'Lemon Juice', quantity: 1, unit: 'tbsp' },
        { id: 'ing8', name: 'Dried Oregano', quantity: 1, unit: 'tsp' },
        { id: 'ing9', name: 'Salt', quantity: 1, unit: 'tsp' },
        { id: 'ing10', name: 'Black Pepper', quantity: 0.5, unit: 'tsp' }
      ],
      instructions: [
        { id: 'inst1', step: 1, description: 'Dice tomatoes, cucumber, and red onion into bite-sized pieces.' },
        { id: 'inst2', step: 2, description: 'Combine vegetables in a large bowl with olives.' },
        { id: 'inst3', step: 3, description: 'Crumble feta cheese over the top.' },
        { id: 'inst4', step: 4, description: 'In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper.' },
        { id: 'inst5', step: 5, description: 'Pour dressing over the salad and toss gently to combine.' },
        { id: 'inst6', step: 6, description: 'Let sit for 10 minutes before serving to allow flavors to meld.' }
      ],
      prepTime: 15,
      cookTime: 0,
      servings: 4,
      cuisine: 'Greek',
      category: 'Salad',
      tags: ['salad', 'greek', 'healthy', 'vegetarian'],
      imageUrl: '',
      isFavorite: false,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      nutritionInfo: {
        calories: 280,
        protein: 8,
        carbs: 12,
        fat: 22
      }
    }
  ];

  // Sample meal plans for initial data
  const sampleMealPlans: MealPlan[] = [
    {
      id: 'mealplan1',
      name: 'Weekly Mediterranean Plan',
      description: 'A week of healthy Mediterranean dishes',
      dates: [
        '2025-01-01',
        '2025-01-02',
        '2025-01-03',
      ],
      meals: [
        {
          id: 'meal1',
          date: '2025-01-01',
          type: 'dinner',
          recipeId: 'sample1',
          notes: 'Add extra cheese'
        },
        {
          id: 'meal2',
          date: '2025-01-02',
          type: 'lunch',
          recipeId: 'sample2',
          notes: ''
        },
        {
          id: 'meal3',
          date: '2025-01-03',
          type: 'dinner',
          recipeId: 'sample1',
          notes: 'Use gluten-free pasta'
        }
      ],
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    }
  ];

  // Function to calculate total nutrition for a meal plan
  const calculateMealPlanNutrition = (plan: MealPlan) => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    plan.meals.forEach(meal => {
      const recipe = recipes.find(r => r.id === meal.recipeId);
      if (recipe) {
        totalCalories += recipe.nutritionInfo.calories;
        totalProtein += recipe.nutritionInfo.protein;
        totalCarbs += recipe.nutritionInfo.carbs;
        totalFat += recipe.nutritionInfo.fat;
      }
    });
    
    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat
    };
  };

  // Generate nutrition data for charts
  const generateNutritionChartData = (recipe: Recipe) => {
    return [
      { name: 'Protein', value: recipe.nutritionInfo.protein, fill: '#4ade80' },
      { name: 'Carbs', value: recipe.nutritionInfo.carbs, fill: '#60a5fa' },
      { name: 'Fat', value: recipe.nutritionInfo.fat, fill: '#f87171' }
    ];
  };

  // Generate recipe distribution by category for charts
  const generateCategoryChartData = () => {
    const categoryCount: Record<string, number> = {};
    
    recipes.forEach(recipe => {
      if (categoryCount[recipe.category]) {
        categoryCount[recipe.category]++;
      } else {
        categoryCount[recipe.category] = 1;
      }
    });
    
    return Object.entries(categoryCount).map(([name, value]) => ({ name, value }));
  };

  // Close modals with ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isRecipeModalOpen) {
          setIsRecipeModalOpen(false);
          setCurrentRecipe(null);
        }
        if (isMealPlanModalOpen) {
          setIsMealPlanModalOpen(false);
          setCurrentMealPlan(null);
        }
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isRecipeModalOpen, isMealPlanModalOpen]);

  return (
    <div className="theme-transition-all min-h-screen bg-gray-100 dark:bg-slate-900 text-gray-900 dark:text-white">
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <div className="container-fluid py-4">
          <div className="flex-between">
            <div className="flex items-center gap-3">
              <Utensils className="text-primary-600 dark:text-primary-400" size={28} />
              <h1 className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">Chef's Planner</h1>
            </div>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-slate-700" />
              )}
            </button>
          </div>

          <nav className="mt-6">
            <ul className="flex border-b dark:border-slate-700">
              <li className="mr-1">
                <button
                  onClick={() => setActiveTab('recipes')}
                  className={`btn ${activeTab === 'recipes' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'} px-4 py-2 font-medium`}
                  role="tab"
                  aria-selected={activeTab === 'recipes'}
                >
                  <div className="flex items-center gap-2">
                    <Book size={18} />
                    <span>Recipes</span>
                  </div>
                </button>
              </li>
              <li className="mr-1">
                <button
                  onClick={() => setActiveTab('mealPlans')}
                  className={`btn ${activeTab === 'mealPlans' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'} px-4 py-2 font-medium`}
                  role="tab"
                  aria-selected={activeTab === 'mealPlans'}
                >
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>Meal Plans</span>
                  </div>
                </button>
              </li>
              <li className="mr-1">
                <button
                  onClick={() => setActiveTab('shoppingList')}
                  className={`btn ${activeTab === 'shoppingList' 
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 border-b-2 border-primary-500' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'} px-4 py-2 font-medium`}
                  role="tab"
                  aria-selected={activeTab === 'shoppingList'}
                >
                  <div className="flex items-center gap-2">
                    <Receipt size={18} />
                    <span>Shopping List</span>
                  </div>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container-fluid py-6">
        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div className="fade-in">
            <div className="flex-between flex-wrap gap-4 mb-6">
              <h2 className="text-2xl font-bold">My Recipes</h2>
              <div className="flex flex-wrap gap-3">
                <a 
                  href={recipeTemplateUrl} 
                  download="recipe_template.json"
                  className="btn btn-secondary text-sm flex items-center gap-2"
                >
                  <FileText size={16} />
                  Download Template
                </a>
                <button
                  onClick={handleCreateRecipe}
                  className="btn btn-primary text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Recipe
                </button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="btn bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Filter size={16} />
                  <span>Filter</span>
                  {isFilterOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (sortBy === 'name') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('name');
                        setSortOrder('asc');
                      }
                    }}
                    className={`btn px-3 py-1.5 ${sortBy === 'name' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'} border border-gray-300 dark:border-slate-600`}
                  >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
                  </button>
                  
                  <button
                    onClick={() => {
                      if (sortBy === 'dateCreated') {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy('dateCreated');
                        setSortOrder('desc');
                      }
                    }}
                    className={`btn px-3 py-1.5 ${sortBy === 'dateCreated' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'} border border-gray-300 dark:border-slate-600`}
                  >
                    Date {sortBy === 'dateCreated' && (sortOrder === 'asc' ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
                  </button>
                </div>
              </div>
            </div>

            {isFilterOpen && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6 fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cuisine-filter" className="form-label">Cuisine</label>
                    <select
                      id="cuisine-filter"
                      value={filterCuisine}
                      onChange={(e) => setFilterCuisine(e.target.value)}
                      className="input"
                    >
                      <option value="All">All Cuisines</option>
                      {CUISINES.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="category-filter" className="form-label">Category</label>
                    <select
                      id="category-filter"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="input"
                    >
                      <option value="All">All Categories</option>
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {filteredRecipes.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-lg text-gray-500 dark:text-gray-400">No recipes found. Add your first recipe!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map(recipe => (
                  <div key={recipe.id} className="card hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold">{recipe.name}</h3>
                      {recipe.isFavorite && (
                        <span className="badge badge-warning">Favorite</span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-3">{recipe.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{recipe.cuisine}</span>
                      <span className="badge bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{recipe.category}</span>
                      {recipe.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">#{tag}</span>
                      ))}
                      {recipe.tags.length > 2 && (
                        <span className="badge bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">+{recipe.tags.length - 2} more</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>Prep: {recipe.prepTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>Cook: {recipe.cookTime} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Utensils size={16} />
                        <span>Serves {recipe.servings}</span>
                      </div>
                    </div>

                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={generateNutritionChartData(recipe)}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}g`}
                          >
                            {generateNutritionChartData(recipe).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value}g`, 'Amount']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md mb-4">
                      <h4 className="font-medium mb-2">Nutrition (per serving)</h4>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Calories</p>
                          <p className="font-medium">{recipe.nutritionInfo.calories}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Protein</p>
                          <p className="font-medium">{recipe.nutritionInfo.protein}g</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                          <p className="font-medium">{recipe.nutritionInfo.carbs}g</p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-gray-400">Fat</p>
                          <p className="font-medium">{recipe.nutritionInfo.fat}g</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-auto">
                      <button
                        onClick={() => handleEditRecipe(recipe)}
                        className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRecipe(recipe.id)}
                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {recipes.length > 0 && (
              <div className="mt-8 p-4 bg-white dark:bg-slate-800 rounded-lg shadow">
                <h3 className="text-xl font-bold mb-4">Recipe Statistics</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={generateCategoryChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Number of Recipes" fill="#60a5fa" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meal Plans Tab */}
        {activeTab === 'mealPlans' && (
          <div className="fade-in">
            <div className="flex-between mb-6">
              <h2 className="text-2xl font-bold">Meal Plans</h2>
              <button
                onClick={handleCreateMealPlan}
                className="btn btn-primary text-sm flex items-center gap-2"
              >
                <Plus size={16} />
                Create Plan
              </button>
            </div>

            {mealPlans.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-lg text-gray-500 dark:text-gray-400">No meal plans yet. Create your first meal plan!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mealPlans.map(plan => {
                  const nutrition = calculateMealPlanNutrition(plan);
                  return (
                    <div key={plan.id} className="card hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold">{plan.name}</h3>
                      </div>
                      
                      <p className="text-gray-600 dark:text-gray-300 mb-4">{plan.description}</p>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Dates</h4>
                        <div className="flex flex-wrap gap-2">
                          {plan.dates.map(date => (
                            <span key={date} className="badge bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {new Date(date).toLocaleDateString()}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Meals</h4>
                        {plan.meals.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400">No meals added yet</p>
                        ) : (
                          <div className="space-y-3">
                            {plan.dates.map(date => (
                              <div key={date} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-md">
                                <h5 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
                                  {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                </h5>
                                
                                <div className="space-y-2">
                                  {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => {
                                    const meal = plan.meals.find(m => m.date === date && m.type === mealType);
                                    if (!meal) return null;
                                    
                                    const recipe = recipes.find(r => r.id === meal.recipeId);
                                    if (!recipe) return null;
                                    
                                    return (
                                      <div key={meal.id} className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="capitalize text-gray-700 dark:text-gray-300">{meal.type}:</span>
                                            <span className="font-medium">{recipe.name}</span>
                                          </div>
                                          {meal.notes && (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{meal.notes}</p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md mb-4">
                        <h4 className="font-medium mb-2">Total Nutrition</h4>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Calories</p>
                            <p className="font-medium">{nutrition.calories}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Protein</p>
                            <p className="font-medium">{nutrition.protein}g</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Carbs</p>
                            <p className="font-medium">{nutrition.carbs}g</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Fat</p>
                            <p className="font-medium">{nutrition.fat}g</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 justify-end mt-auto">
                        <button
                          onClick={() => handleGenerateShoppingList(plan.id)}
                          className="btn btn-sm bg-green-500 hover:bg-green-600 text-white flex items-center gap-1"
                        >
                          <Receipt size={14} />
                          Generate Shopping List
                        </button>
                        <button
                          onClick={() => handleEditMealPlan(plan)}
                          className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white flex items-center gap-1"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMealPlan(plan.id)}
                          className="btn btn-sm bg-red-500 hover:bg-red-600 text-white flex items-center gap-1"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Shopping List Tab */}
        {activeTab === 'shoppingList' && (
          <div className="fade-in">
            <div className="flex-between mb-6">
              <h2 className="text-2xl font-bold">Shopping List</h2>
              {shoppingList.length > 0 && (
                <button
                  onClick={handleClearShoppingList}
                  className="btn bg-red-500 hover:bg-red-600 text-white text-sm"
                >
                  Clear List
                </button>
              )}
            </div>

            {shoppingList.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  Your shopping list is empty. Generate a list from a meal plan!
                </p>
              </div>
            ) : (
              <div className="card">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {shoppingList.map(item => (
                    <li key={item.id} className="py-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.isChecked}
                        onChange={() => handleToggleShoppingItem(item.id)}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 rounded"
                        id={`item-${item.id}`}
                      />
                      <label 
                        htmlFor={`item-${item.id}`}
                        className={`flex-1 ${item.isChecked ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}
                      >
                        <span className="font-medium">{item.name}</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">
                          {item.quantity} {item.unit}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Recipe Modal */}
      {isRecipeModalOpen && currentRecipe && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsRecipeModalOpen(false);
            setCurrentRecipe(null);
          }}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {currentRecipe.id.startsWith('sample') ? 'Edit Recipe' : 'Create Recipe'}
              </h2>
              <button 
                onClick={() => {
                  setIsRecipeModalOpen(false);
                  setCurrentRecipe(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="form-group">
                  <label htmlFor="recipe-name" className="form-label">Recipe Name</label>
                  <input
                    id="recipe-name"
                    type="text"
                    value={currentRecipe.name}
                    onChange={(e) => setCurrentRecipe({...currentRecipe, name: e.target.value})}
                    className="input"
                    placeholder="e.g. Spaghetti Carbonara"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="recipe-description" className="form-label">Description</label>
                  <textarea
                    id="recipe-description"
                    value={currentRecipe.description}
                    onChange={(e) => setCurrentRecipe({...currentRecipe, description: e.target.value})}
                    className="input min-h-[100px]"
                    placeholder="Brief description of the recipe"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="recipe-prep-time" className="form-label">Prep Time (minutes)</label>
                    <input
                      id="recipe-prep-time"
                      type="number"
                      min="0"
                      value={currentRecipe.prepTime}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, prepTime: parseInt(e.target.value) || 0})}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="recipe-cook-time" className="form-label">Cook Time (minutes)</label>
                    <input
                      id="recipe-cook-time"
                      type="number"
                      min="0"
                      value={currentRecipe.cookTime}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, cookTime: parseInt(e.target.value) || 0})}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="recipe-servings" className="form-label">Servings</label>
                    <input
                      id="recipe-servings"
                      type="number"
                      min="1"
                      value={currentRecipe.servings}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, servings: parseInt(e.target.value) || 1})}
                      className="input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="recipe-is-favorite" className="form-label flex items-center gap-2">
                      <input
                        id="recipe-is-favorite"
                        type="checkbox"
                        checked={currentRecipe.isFavorite}
                        onChange={(e) => setCurrentRecipe({...currentRecipe, isFavorite: e.target.checked})}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <span>Favorite Recipe</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label htmlFor="recipe-cuisine" className="form-label">Cuisine</label>
                    <select
                      id="recipe-cuisine"
                      value={currentRecipe.cuisine}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, cuisine: e.target.value})}
                      className="input"
                    >
                      {CUISINES.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="recipe-category" className="form-label">Category</label>
                    <select
                      id="recipe-category"
                      value={currentRecipe.category}
                      onChange={(e) => setCurrentRecipe({...currentRecipe, category: e.target.value})}
                      className="input"
                    >
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="recipe-tags" className="form-label">Tags (comma separated)</label>
                  <input
                    id="recipe-tags"
                    type="text"
                    value={currentRecipe.tags.join(', ')}
                    onChange={(e) => setCurrentRecipe({
                      ...currentRecipe, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
                    })}
                    className="input"
                    placeholder="e.g. quick, vegetarian, pasta"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Nutrition Information (per serving)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label htmlFor="nutrition-calories" className="form-label">Calories</label>
                      <input
                        id="nutrition-calories"
                        type="number"
                        min="0"
                        value={currentRecipe.nutritionInfo.calories}
                        onChange={(e) => setCurrentRecipe({
                          ...currentRecipe, 
                          nutritionInfo: {
                            ...currentRecipe.nutritionInfo,
                            calories: parseInt(e.target.value) || 0
                          }
                        })}
                        className="input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nutrition-protein" className="form-label">Protein (g)</label>
                      <input
                        id="nutrition-protein"
                        type="number"
                        min="0"
                        value={currentRecipe.nutritionInfo.protein}
                        onChange={(e) => setCurrentRecipe({
                          ...currentRecipe, 
                          nutritionInfo: {
                            ...currentRecipe.nutritionInfo,
                            protein: parseInt(e.target.value) || 0
                          }
                        })}
                        className="input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nutrition-carbs" className="form-label">Carbs (g)</label>
                      <input
                        id="nutrition-carbs"
                        type="number"
                        min="0"
                        value={currentRecipe.nutritionInfo.carbs}
                        onChange={(e) => setCurrentRecipe({
                          ...currentRecipe, 
                          nutritionInfo: {
                            ...currentRecipe.nutritionInfo,
                            carbs: parseInt(e.target.value) || 0
                          }
                        })}
                        className="input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="nutrition-fat" className="form-label">Fat (g)</label>
                      <input
                        id="nutrition-fat"
                        type="number"
                        min="0"
                        value={currentRecipe.nutritionInfo.fat}
                        onChange={(e) => setCurrentRecipe({
                          ...currentRecipe, 
                          nutritionInfo: {
                            ...currentRecipe.nutritionInfo,
                            fat: parseInt(e.target.value) || 0
                          }
                        })}
                        className="input"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Ingredients</h3>
                    <button
                      onClick={handleAddIngredient}
                      className="btn btn-sm bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Ingredient
                    </button>
                  </div>
                  
                  {currentRecipe.ingredients.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No ingredients added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {currentRecipe.ingredients.map((ingredient, index) => (
                        <div key={ingredient.id} className="flex items-center gap-2">
                          <div className="flex-1 grid grid-cols-3 gap-2">
                            <input
                              type="text"
                              value={ingredient.name}
                              onChange={(e) => {
                                const updatedIngredients = [...currentRecipe.ingredients];
                                updatedIngredients[index] = {
                                  ...updatedIngredients[index],
                                  name: e.target.value
                                };
                                setCurrentRecipe({...currentRecipe, ingredients: updatedIngredients});
                              }}
                              className="input col-span-2"
                              placeholder="Ingredient name"
                            />
                            <div className="flex">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={ingredient.quantity}
                                onChange={(e) => {
                                  const updatedIngredients = [...currentRecipe.ingredients];
                                  updatedIngredients[index] = {
                                    ...updatedIngredients[index],
                                    quantity: parseFloat(e.target.value) || 0
                                  };
                                  setCurrentRecipe({...currentRecipe, ingredients: updatedIngredients});
                                }}
                                className="input rounded-r-none w-16"
                              />
                              <select
                                value={ingredient.unit}
                                onChange={(e) => {
                                  const updatedIngredients = [...currentRecipe.ingredients];
                                  updatedIngredients[index] = {
                                    ...updatedIngredients[index],
                                    unit: e.target.value
                                  };
                                  setCurrentRecipe({...currentRecipe, ingredients: updatedIngredients});
                                }}
                                className="input rounded-l-none border-l-0"
                              >
                                {UNITS.map(unit => (
                                  <option key={unit} value={unit}>{unit}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveIngredient(ingredient.id)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Remove ingredient"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Instructions</h3>
                    <button
                      onClick={handleAddInstruction}
                      className="btn btn-sm bg-primary-500 hover:bg-primary-600 text-white flex items-center gap-1"
                    >
                      <Plus size={14} />
                      Add Step
                    </button>
                  </div>
                  
                  {currentRecipe.instructions.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No instructions added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {currentRecipe.instructions.map((instruction, index) => (
                        <div key={instruction.id} className="flex items-start gap-2">
                          <div className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full font-medium min-w-[28px] text-center">
                            {instruction.step}
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={instruction.description}
                              onChange={(e) => {
                                const updatedInstructions = [...currentRecipe.instructions];
                                updatedInstructions[index] = {
                                  ...updatedInstructions[index],
                                  description: e.target.value
                                };
                                setCurrentRecipe({...currentRecipe, instructions: updatedInstructions});
                              }}
                              className="input min-h-[80px] w-full"
                              placeholder={`Step ${instruction.step} description`}
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveInstruction(instruction.id)}
                            className="text-red-500 hover:text-red-700 pt-2"
                            aria-label="Remove instruction"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsRecipeModalOpen(false);
                  setCurrentRecipe(null);
                }}
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveRecipe(currentRecipe)}
                className="btn btn-primary"
              >
                Save Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Modal */}
      {isMealPlanModalOpen && currentMealPlan && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setIsMealPlanModalOpen(false);
            setCurrentMealPlan(null);
          }}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {currentMealPlan.id.startsWith('mealplan') ? 'Edit Meal Plan' : 'Create Meal Plan'}
              </h2>
              <button 
                onClick={() => {
                  setIsMealPlanModalOpen(false);
                  setCurrentMealPlan(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="form-group">
                  <label htmlFor="meal-plan-name" className="form-label">Plan Name</label>
                  <input
                    id="meal-plan-name"
                    type="text"
                    value={currentMealPlan.name}
                    onChange={(e) => setCurrentMealPlan({...currentMealPlan, name: e.target.value})}
                    className="input"
                    placeholder="e.g. Weekly Family Menu"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="meal-plan-description" className="form-label">Description</label>
                  <textarea
                    id="meal-plan-description"
                    value={currentMealPlan.description}
                    onChange={(e) => setCurrentMealPlan({...currentMealPlan, description: e.target.value})}
                    className="input min-h-[100px]"
                    placeholder="Brief description of this meal plan"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="meal-plan-add-date" className="form-label">Add Date</label>
                  <div className="flex gap-2">
                    <input
                      id="meal-plan-add-date"
                      type="date"
                      className="input flex-1"
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddDateToMealPlan(e.target.value);
                          // Clear the input
                          e.target.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Selected Dates</label>
                  <div className="flex flex-wrap gap-2">
                    {currentMealPlan.dates.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No dates selected yet</p>
                    ) : (
                      currentMealPlan.dates.map(date => (
                        <div key={date} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm">
                          <span>{new Date(date).toLocaleDateString()}</span>
                          <button
                            onClick={() => handleRemoveDateFromMealPlan(date)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                            aria-label="Remove date"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3">Planned Meals</h3>

                {currentMealPlan.dates.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">Add dates to your meal plan first</p>
                ) : (
                  <div className="space-y-4">
                    {currentMealPlan.dates.map(date => (
                      <div key={date} className="bg-gray-50 dark:bg-slate-700 p-3 rounded-md">
                        <h4 className="font-medium mb-2">
                          {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </h4>

                        {MEAL_TYPES.map(mealType => {
                          const meal = currentMealPlan.meals.find(m => m.date === date && m.type === mealType);
                          
                          return meal ? (
                            <div key={meal.id} className="mb-3 pl-2 border-l-2 border-primary-500 dark:border-primary-400">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium capitalize">{mealType}</h5>
                                <button
                                  onClick={() => handleRemoveMealFromMealPlan(meal.id)}
                                  className="text-red-500 hover:text-red-700"
                                  aria-label={`Remove ${mealType}`}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 gap-2 mt-2">
                                <div className="form-group">
                                  <select
                                    value={meal.recipeId}
                                    onChange={(e) => {
                                      const updatedMeals = currentMealPlan.meals.map(m => 
                                        m.id === meal.id ? {...m, recipeId: e.target.value} : m
                                      );
                                      setCurrentMealPlan({...currentMealPlan, meals: updatedMeals});
                                    }}
                                    className="input"
                                  >
                                    {recipes.map(recipe => (
                                      <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="form-group">
                                  <input
                                    type="text"
                                    value={meal.notes}
                                    onChange={(e) => {
                                      const updatedMeals = currentMealPlan.meals.map(m => 
                                        m.id === meal.id ? {...m, notes: e.target.value} : m
                                      );
                                      setCurrentMealPlan({...currentMealPlan, meals: updatedMeals});
                                    }}
                                    className="input"
                                    placeholder="Notes (optional)"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div key={mealType} className="mb-3">
                              <button
                                onClick={() => handleAddMealToMealPlan(date, mealType as 'breakfast' | 'lunch' | 'dinner' | 'snack')}
                                className="btn btn-sm bg-gray-200 hover:bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 text-gray-700 dark:text-gray-200 flex items-center gap-1 w-full justify-center"
                              >
                                <Plus size={14} />
                                <span className="capitalize">Add {mealType}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setIsMealPlanModalOpen(false);
                  setCurrentMealPlan(null);
                }}
                className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveMealPlan(currentMealPlan)}
                className="btn btn-primary"
              >
                Save Meal Plan
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-white dark:bg-slate-800 mt-12 py-6 shadow-inner">
        <div className="container-fluid text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>Copyright © 2025 of Datavtar Private Limited. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
