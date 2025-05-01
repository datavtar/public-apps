import React, { useState, useEffect } from 'react';
import { X, Moon, Sun } from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Type for calculator operations
  type Operation = '+' | '-' | '*' | '/' | null;

  // Calculator state
  const [display, setDisplay] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ calculation: string, result: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Load history and theme preference from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('calculatorHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }

      const savedDarkMode = localStorage.getItem('calculatorDarkMode');
      if (savedDarkMode) {
        const isDarkMode = savedDarkMode === 'true';
        setDarkMode(isDarkMode);
        if (isDarkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If user has dark mode preference in their OS
        setDarkMode(true);
        document.documentElement.classList.add('dark');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('calculatorHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error saving history to localStorage:', error);
    }
  }, [history]);

  // Save dark mode preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('calculatorDarkMode', String(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
    }
  }, [darkMode]);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Function to handle number input
  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  // Function to handle decimal point
  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Function to handle operations
  const handleOperation = (nextOperation: Operation) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(display);
    } else if (operation) {
      const result = performCalculation();
      setDisplay(String(result));
      setFirstOperand(String(result));

      // Add to history
      const calculation = `${firstOperand} ${operation} ${display}`; // Note: display here is the *previous* display before calculation
      // To get the second operand for history, we might need to store it explicitly if needed
      // Using current display for history might be slightly confusing, but matches the original logic
      setHistory(prev => [{ calculation, result: String(result) }, ...prev.slice(0, 9)]);
    }

    setWaitingForSecondOperand(true);
    setOperation(nextOperation);
  };

  // Function to perform calculation
  const performCalculation = (): number => {
    const firstNumber = parseFloat(firstOperand || '0');
    const secondNumber = parseFloat(display);

    if (isNaN(firstNumber) || isNaN(secondNumber)) return 0;

    let result = 0;
    switch (operation) {
      case '+':
        result = firstNumber + secondNumber;
        break;
      case '-':
        result = firstNumber - secondNumber;
        break;
      case '*':
        result = firstNumber * secondNumber;
        break;
      case '/':
        result = secondNumber !== 0 ? firstNumber / secondNumber : 0; // Consider handling division by zero more explicitly (e.g., display 'Error')
        break;
      default:
        return secondNumber;
    }

    // Handle potential floating point inaccuracies
    const precision = 1000000;
    return Math.round(result * precision) / precision;
  };

  // Function to calculate result
  const calculateResult = () => {
    if (!firstOperand || !operation || waitingForSecondOperand) {
      // Don't calculate if we are waiting for the second operand or if there's no operation set
      return;
    }

    const result = performCalculation();
    const calculationString = `${firstOperand} ${operation} ${display}`; // Capture calculation before resetting state

    setDisplay(String(result));

    // Add to history
    setHistory(prev => [{ calculation: calculationString, result: String(result) }, ...prev.slice(0, 9)]);

    // Reset for next calculation
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
  };

  // Function to clear the calculator
  const clearCalculator = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
  };

  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
    // No need to remove from localStorage here, the useEffect for history will handle it
    // localStorage.removeItem('calculatorHistory');
  };

  // Function to toggle history display
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  // Function to handle clicking a history item (renamed from useHistoryItem)
  const handleHistoryItemClick = (result: string) => {
    setDisplay(result);
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
    setShowHistory(false);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 theme-transition ${styles.calculatorBackground}`}>
      <div className="container-narrow flex justify-end mb-4">
        <button
          onClick={toggleDarkMode}
          className="theme-toggle"
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          data-testid="theme-toggle"
        >
          <span className="theme-toggle-thumb"></span>
          <span className="sr-only">{darkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
          {darkMode ?
            <Sun className="ml-6 text-yellow-400" size={16} /> :
            <Moon className="ml-1 text-slate-700" size={16} />}
        </button>
      </div>

      <div className={`${styles.calculator} card dark:bg-slate-800 w-full max-w-md mx-auto rounded-xl shadow-lg overflow-hidden`}>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl sm:text-2xl font-bold dark:text-white">Calculator</h1>
            <button
              onClick={toggleHistory}
              className="btn btn-sm bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              aria-label="Toggle history"
              data-testid="history-toggle"
            >
              {showHistory ? 'Hide History' : 'Show History'}
            </button>
          </div>

          {showHistory && (
            <div className="mb-4 p-2 bg-gray-100 dark:bg-slate-700 rounded-md max-h-48 overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-sm font-medium dark:text-white">Calculation History</h2>
                <button
                  onClick={clearHistory}
                  className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  aria-label="Clear history"
                  data-testid="clear-history"
                >
                  Clear All
                </button>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 italic">No calculations yet</p>
              ) : (
                <ul className="space-y-1">
                  {history.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm p-2 bg-white dark:bg-slate-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 flex justify-between"
                      onClick={() => handleHistoryItemClick(item.result)} // Updated function call
                      data-testid={`history-item-${index}`}
                    >
                      <span className="text-gray-600 dark:text-slate-400">{item.calculation}</span>
                      <span className="font-medium">{item.result}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <div className={`${styles.display} bg-white dark:bg-slate-900 p-4 rounded-lg mb-4 shadow-inner`}>
            <div className="text-right">
              {firstOperand && operation && !waitingForSecondOperand && (
                 <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                   {/* Display pending operation only if we are not waiting for the second operand yet */} 
                   {/* This part might need adjustment based on desired UX */} 
                 </div>
              )}
               {firstOperand && operation && waitingForSecondOperand && (
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {firstOperand} {operation}
                </div>
              )}
              <div className="text-3xl sm:text-4xl font-bold dark:text-white" data-testid="display">
                {display}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={clearCalculator}
              className="btn col-span-2 bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 font-bold"
              data-testid="clear"
            >
              Clear
            </button>
            <button
              onClick={() => handleOperation('/')}
              className={`btn ${operation === '/' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="divide"
            >
              ÷
            </button>
            <button
              onClick={() => handleOperation('*')}
              className={`btn ${operation === '*' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="multiply"
            >
              ×
            </button>

            <button
              onClick={() => inputDigit('7')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="seven"
            >
              7
            </button>
            <button
              onClick={() => inputDigit('8')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="eight"
            >
              8
            </button>
            <button
              onClick={() => inputDigit('9')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="nine"
            >
              9
            </button>
            <button
              onClick={() => handleOperation('-')}
              className={`btn ${operation === '-' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="subtract"
            >
              −
            </button>

            <button
              onClick={() => inputDigit('4')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="four"
            >
              4
            </button>
            <button
              onClick={() => inputDigit('5')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="five"
            >
              5
            </button>
            <button
              onClick={() => inputDigit('6')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="six"
            >
              6
            </button>
            <button
              onClick={() => handleOperation('+')}
              className={`btn ${operation === '+' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="add"
            >
              +
            </button>

            <button
              onClick={() => inputDigit('1')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="one"
            >
              1
            </button>
            <button
              onClick={() => inputDigit('2')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="two"
            >
              2
            </button>
            <button
              onClick={() => inputDigit('3')}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="three"
            >
              3
            </button>
            <button
              onClick={calculateResult}
              className={`btn row-span-2 bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 font-bold ${styles.equalsButton}`}
              data-testid="equals"
            >
              =
            </button>

            <button
              onClick={() => inputDigit('0')}
              className="btn col-span-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="zero"
            >
              0
            </button>
            <button
              onClick={inputDecimal}
              className="btn bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white"
              data-testid="decimal"
            >
              .
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;