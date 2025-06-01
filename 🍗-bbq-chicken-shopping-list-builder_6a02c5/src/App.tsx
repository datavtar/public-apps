import React, { useState, useEffect } from 'react';
import { Users, ShoppingCart, Download, RotateCcw, Check, Plus, Minus, Sun, Moon, Flame, Timer, ChefHat } from 'lucide-react';
import styles from './styles/styles.module.css';

interface Ingredient {
  id: string;
  name: string;
  baseQuantity: number;
  unit: string;
  category: 'chicken' | 'marinade' | 'sides' | 'seasonings' | 'beverages' | 'extras';
  essential: boolean;
  checked?: boolean;
}

interface ShoppingListItem extends Ingredient {
  adjustedQuantity: number;
}

const App: React.FC = () => {
  const [portionSize, setPortionSize] = useState<number>(4);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode === 'true' || 
        (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const baseIngredients: Ingredient[] = [
    // Chicken
    { id: '1', name: 'Whole Chicken (3-4 lbs each)', baseQuantity: 1, unit: 'whole', category: 'chicken', essential: true },
    { id: '2', name: 'Chicken Thighs (bone-in)', baseQuantity: 8, unit: 'pieces', category: 'chicken', essential: false },
    { id: '3', name: 'Chicken Wings', baseQuantity: 2, unit: 'lbs', category: 'chicken', essential: false },
    
    // Marinade & Seasonings
    { id: '4', name: 'BBQ Sauce', baseQuantity: 1, unit: 'bottle', category: 'marinade', essential: true },
    { id: '5', name: 'Olive Oil', baseQuantity: 0.5, unit: 'cup', category: 'marinade', essential: true },
    { id: '6', name: 'Apple Cider Vinegar', baseQuantity: 0.25, unit: 'cup', category: 'marinade', essential: true },
    { id: '7', name: 'Brown Sugar', baseQuantity: 0.25, unit: 'cup', category: 'seasonings', essential: true },
    { id: '8', name: 'Paprika', baseQuantity: 2, unit: 'tbsp', category: 'seasonings', essential: true },
    { id: '9', name: 'Garlic Powder', baseQuantity: 1, unit: 'tbsp', category: 'seasonings', essential: true },
    { id: '10', name: 'Onion Powder', baseQuantity: 1, unit: 'tbsp', category: 'seasonings', essential: true },
    { id: '11', name: 'Salt', baseQuantity: 1, unit: 'tbsp', category: 'seasonings', essential: true },
    { id: '12', name: 'Black Pepper', baseQuantity: 1, unit: 'tsp', category: 'seasonings', essential: true },
    { id: '13', name: 'Cayenne Pepper', baseQuantity: 0.5, unit: 'tsp', category: 'seasonings', essential: false },
    { id: '14', name: 'Smoked Paprika', baseQuantity: 1, unit: 'tsp', category: 'seasonings', essential: false },
    
    // Sides
    { id: '15', name: 'Corn on the Cob', baseQuantity: 4, unit: 'ears', category: 'sides', essential: false },
    { id: '16', name: 'Potatoes (for grilling)', baseQuantity: 4, unit: 'medium', category: 'sides', essential: false },
    { id: '17', name: 'Bell Peppers', baseQuantity: 2, unit: 'peppers', category: 'sides', essential: false },
    { id: '18', name: 'Zucchini', baseQuantity: 2, unit: 'medium', category: 'sides', essential: false },
    { id: '19', name: 'Mushrooms', baseQuantity: 1, unit: 'lb', category: 'sides', essential: false },
    { id: '20', name: 'Coleslaw Mix', baseQuantity: 1, unit: 'bag', category: 'sides', essential: false },
    
    // Beverages
    { id: '21', name: 'Beer', baseQuantity: 6, unit: 'bottles', category: 'beverages', essential: false },
    { id: '22', name: 'Soda/Soft Drinks', baseQuantity: 2, unit: 'liters', category: 'beverages', essential: false },
    { id: '23', name: 'Lemonade', baseQuantity: 1, unit: 'pitcher', category: 'beverages', essential: false },
    
    // Extras
    { id: '24', name: 'Charcoal/Wood Chips', baseQuantity: 1, unit: 'bag', category: 'extras', essential: true },
    { id: '25', name: 'Aluminum Foil', baseQuantity: 1, unit: 'roll', category: 'extras', essential: true },
    { id: '26', name: 'Paper Towels', baseQuantity: 1, unit: 'roll', category: 'extras', essential: true },
    { id: '27', name: 'Wet Wipes', baseQuantity: 1, unit: 'pack', category: 'extras', essential: false },
    { id: '28', name: 'Disposable Plates', baseQuantity: 8, unit: 'plates', category: 'extras', essential: false },
  ];

  const categoryLabels = {
    chicken: 'Chicken',
    marinade: 'Marinades & Sauces',
    seasonings: 'Seasonings & Spices',
    sides: 'Side Dishes',
    beverages: 'Beverages',
    extras: 'BBQ Essentials & Extras'
  };

  const categoryIcons = {
    chicken: ChefHat,
    marinade: Flame,
    seasonings: Timer,
    sides: Plus,
    beverages: ShoppingCart,
    extras: ShoppingCart
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const savedList = localStorage.getItem('bbqShoppingList');
    const savedPortion = localStorage.getItem('bbqPortionSize');
    
    if (savedPortion) {
      setPortionSize(parseInt(savedPortion));
    }
    
    if (savedList) {
      try {
        const parsedList = JSON.parse(savedList);
        setShoppingList(parsedList);
      } catch (error) {
        console.error('Error parsing saved shopping list:', error);
        generateShoppingList(portionSize);
      }
    } else {
      generateShoppingList(portionSize);
    }
  }, []);

  useEffect(() => {
    generateShoppingList(portionSize);
    localStorage.setItem('bbqPortionSize', portionSize.toString());
  }, [portionSize]);

  useEffect(() => {
    localStorage.setItem('bbqShoppingList', JSON.stringify(shoppingList));
  }, [shoppingList]);

  const generateShoppingList = (portions: number) => {
    const multiplier = portions / 4; // Base recipe is for 4 people
    
    const adjustedList = baseIngredients.map(ingredient => {
      let adjustedQuantity = ingredient.baseQuantity * multiplier;
      
      // Round to reasonable numbers
      if (ingredient.unit === 'whole' || ingredient.unit === 'pieces' || ingredient.unit === 'ears' || 
          ingredient.unit === 'peppers' || ingredient.unit === 'medium' || ingredient.unit === 'bottles' || 
          ingredient.unit === 'bag' || ingredient.unit === 'roll' || ingredient.unit === 'pack' || 
          ingredient.unit === 'plates' || ingredient.unit === 'pitcher') {
        adjustedQuantity = Math.ceil(adjustedQuantity);
      } else if (ingredient.unit === 'lbs' || ingredient.unit === 'liters') {
        adjustedQuantity = Math.round(adjustedQuantity * 2) / 2; // Round to nearest 0.5
      } else {
        adjustedQuantity = Math.round(adjustedQuantity * 100) / 100; // Round to 2 decimal places
      }
      
      return {
        ...ingredient,
        adjustedQuantity,
        checked: shoppingList.find(item => item.id === ingredient.id)?.checked || false
      };
    });
    
    setShoppingList(adjustedList);
  };

  const toggleItemCheck = (id: string) => {
    setShoppingList(prev => 
      prev.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const exportList = () => {
    const csvContent = [
      ['Item', 'Quantity', 'Unit', 'Category', 'Status'].join(','),
      ...shoppingList.map(item => [
        `"${item.name}"`,
        item.adjustedQuantity,
        `"${item.unit}"`,
        `"${categoryLabels[item.category]}"`,
        item.checked ? 'Checked' : 'Unchecked'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bbq-shopping-list-${portionSize}-people.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetList = () => {
    if (window.confirm('Are you sure you want to reset the shopping list? This will uncheck all items.')) {
      setShoppingList(prev => 
        prev.map(item => ({ ...item, checked: false }))
      );
    }
  };

  const getCheckedCount = () => {
    return shoppingList.filter(item => item.checked).length;
  };

  const getTotalCount = () => {
    return shoppingList.length;
  };

  const formatQuantity = (quantity: number, unit: string) => {
    if (quantity === Math.floor(quantity)) {
      return `${quantity} ${unit}${quantity > 1 && !unit.endsWith('s') ? 's' : ''}`;
    }
    return `${quantity} ${unit}${quantity > 1 && !unit.endsWith('s') ? 's' : ''}`;
  };

  const groupedIngredients = shoppingList.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, ShoppingListItem[]>);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-slate-900 dark:to-slate-800 transition-all duration-300 ${styles.container}`}>
      <div className="container-wide py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-orange-500 text-white rounded-full">
              <Flame className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              BBQ Chicken Shopping List
            </h1>
          </div>
          <p className="text-gray-600 dark:text-slate-300 text-lg max-w-2xl mx-auto">
            Plan your perfect barbecue with our interactive shopping list that adjusts quantities based on your guest count.
          </p>
        </div>

        {/* Controls */}
        <div className="card-responsive mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            {/* Portion Size Selector */}
            <div className="flex-1 w-full md:w-auto">
              <label className="form-label flex items-center gap-2 mb-3">
                <Users className="w-4 h-4" />
                Number of People
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPortionSize(Math.max(2, portionSize - 2))}
                  className="btn bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800 p-2"
                  aria-label="Decrease portion size"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="text-center min-w-[120px]">
                  <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                    {portionSize}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400">
                    people
                  </div>
                </div>
                <button
                  onClick={() => setPortionSize(Math.min(20, portionSize + 2))}
                  className="btn bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800 p-2"
                  aria-label="Increase portion size"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Portion Buttons */}
            <div className="flex gap-2 flex-wrap justify-center">
              {[2, 4, 6, 8, 10, 12].map(size => (
                <button
                  key={size}
                  onClick={() => setPortionSize(size)}
                  className={`btn px-3 py-2 text-sm transition-all ${
                    portionSize === size
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-700 hover:bg-orange-50 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="btn bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 p-2"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={exportList}
                className="btn btn-primary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={resetList}
                className="btn bg-gray-500 text-white hover:bg-gray-600 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="card-responsive mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Shopping Progress
            </h3>
            <span className="text-sm text-gray-500 dark:text-slate-400">
              {getCheckedCount()} of {getTotalCount()} items
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(getCheckedCount() / getTotalCount()) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-300 mt-2">
            {getCheckedCount() === getTotalCount() 
              ? '🎉 All items checked! You\'re ready to BBQ!' 
              : `${getTotalCount() - getCheckedCount()} items remaining`
            }
          </p>
        </div>

        {/* Shopping List */}
        <div className="grid gap-6">
          {Object.entries(groupedIngredients).map(([category, items]) => {
            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            return (
              <div key={category} className="card-responsive">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300 rounded-lg">
                    <CategoryIcon className="w-5 h-5" />
                  </div>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                  <span className="text-sm font-normal text-gray-500 dark:text-slate-400">
                    ({items.filter(item => item.checked).length}/{items.length})
                  </span>
                </h3>
                
                <div className="grid gap-3">
                  {items.map(item => (
                    <div 
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 ${
                        item.checked 
                          ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700' 
                          : 'bg-white border-gray-200 dark:bg-slate-800 dark:border-slate-600'
                      } hover:shadow-md cursor-pointer`}
                      onClick={() => toggleItemCheck(item.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleItemCheck(item.id);
                        }
                      }}
                    >
                      <div className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        item.checked
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 dark:border-slate-500'
                      }`}>
                        {item.checked && <Check className="w-4 h-4" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`font-medium transition-all ${
                          item.checked 
                            ? 'text-gray-500 line-through dark:text-slate-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-slate-400">
                          {formatQuantity(item.adjustedQuantity, item.unit)}
                        </div>
                      </div>
                      
                      {item.essential && (
                        <div className="badge bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 text-xs">
                          Essential
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tips */}
        <div className="card-responsive mt-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            BBQ Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-slate-300">
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <strong className="text-orange-700 dark:text-orange-300">Preparation:</strong> Marinate chicken for at least 2-4 hours, preferably overnight for best flavor.
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <strong className="text-red-700 dark:text-red-300">Safety:</strong> Use a meat thermometer - chicken should reach 165°F (74°C) internal temperature.
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <strong className="text-yellow-700 dark:text-yellow-300">Timing:</strong> Allow 20-25 minutes per pound for whole chicken, 15-20 minutes for pieces.
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <strong className="text-green-700 dark:text-green-300">Flavor:</strong> Baste with BBQ sauce only in the last 10-15 minutes to prevent burning.
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 dark:text-slate-400 mt-12 pt-6 border-t border-gray-200 dark:border-slate-700">
          Copyright © 2025 Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;