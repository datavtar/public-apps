import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Info } from 'lucide-react';
import styles from './styles/styles.module.css';

const App: React.FC = () => {
  // Type for calculator operations
  type Operation = '+' | '-' | '*' | '/' | '^' | 'sqrt' | 'sin' | 'cos' | 'tan' | 'log' | 'ln' | null;

  // Type for memory operations
  type MemoryOperation = 'MC' | 'MR' | 'M+' | 'M-' | 'MS';

  // Scientific calculator state
  const [display, setDisplay] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<Operation>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const [history, setHistory] = useState<Array<{ calculation: string, result: string }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [showFunctionPanel, setShowFunctionPanel] = useState<boolean>(false);
  const [degreeMode, setDegreeMode] = useState<boolean>(true); // true for degree, false for radian
  const [inputExpression, setInputExpression] = useState<string>('');

  // Constants for scientific calculations
  const DEG_TO_RAD = Math.PI / 180;

  // Load history, theme preference, and memory from localStorage on component mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('scientificCalculatorHistory');
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

      const savedMemory = localStorage.getItem('scientificCalculatorMemory');
      if (savedMemory) {
        setMemory(parseFloat(savedMemory));
      }

      const savedDegreeMode = localStorage.getItem('scientificCalculatorDegreeMode');
      if (savedDegreeMode) {
        setDegreeMode(savedDegreeMode === 'true');
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('scientificCalculatorHistory', JSON.stringify(history));
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

  // Save memory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scientificCalculatorMemory', String(memory));
    } catch (error) {
      console.error('Error saving memory to localStorage:', error);
    }
  }, [memory]);

  // Save degree mode to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scientificCalculatorDegreeMode', String(degreeMode));
    } catch (error) {
      console.error('Error saving degree mode to localStorage:', error);
    }
  }, [degreeMode]);

  // Close tooltip on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTooltip(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Function to toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Function to toggle degree/radian mode
  const toggleDegreeMode = () => {
    setDegreeMode(prev => !prev);
  };

  // Function to handle number input
  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
      setInputExpression(prev => prev + digit);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
      if (inputExpression === '' || inputExpression === '0') {
        setInputExpression(digit);
      } else {
        setInputExpression(prev => prev + digit);
      }
    }
  };

  // Function to handle decimal point
  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      setInputExpression(prev => prev + '0.');
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
      setInputExpression(prev => prev + '.');
    }
  };

  // Function to handle operations
  const handleOperation = (nextOperation: Operation) => {
    // If it's a unary operation (e.g., sqrt, sin, cos, tan), calculate immediately
    if (nextOperation === 'sqrt' || nextOperation === 'sin' || 
        nextOperation === 'cos' || nextOperation === 'tan' || 
        nextOperation === 'log' || nextOperation === 'ln') {
      handleUnaryOperation(nextOperation);
      return;
    }

    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(display);
      setInputExpression(prevExpr => {
        // Add appropriate operator to expression
        const operator = getOperatorSymbol(nextOperation);
        return prevExpr + (operator ? ' ' + operator + ' ' : '');
      });
    } else if (operation) {
      const result = performCalculation();
      const resultStr = formatNumberForDisplay(result);
      setDisplay(resultStr);
      setFirstOperand(resultStr);

      // Add to history
      const calculation = `${firstOperand} ${getOperatorSymbol(operation)} ${display}`;
      setHistory(prev => [{ calculation, result: resultStr }, ...prev.slice(0, 9)]);

      // Update expression
      setInputExpression(resultStr + ' ' + getOperatorSymbol(nextOperation) + ' ');
    }

    setWaitingForSecondOperand(true);
    setOperation(nextOperation);
  };

  // Function to handle unary operations
  const handleUnaryOperation = (op: Operation) => {
    try {
      const inputValue = parseFloat(display);
      let result = 0;

      // Perform the selected unary operation
      switch (op) {
        case 'sqrt':
          if (inputValue < 0) {
            throw new Error('Cannot calculate square root of a negative number');
          }
          result = Math.sqrt(inputValue);
          break;
        case 'sin':
          result = Math.sin(degreeMode ? inputValue * DEG_TO_RAD : inputValue);
          break;
        case 'cos':
          result = Math.cos(degreeMode ? inputValue * DEG_TO_RAD : inputValue);
          break;
        case 'tan':
          result = Math.tan(degreeMode ? inputValue * DEG_TO_RAD : inputValue);
          break;
        case 'log':
          if (inputValue <= 0) {
            throw new Error('Cannot calculate logarithm of zero or negative number');
          }
          result = Math.log10(inputValue);
          break;
        case 'ln':
          if (inputValue <= 0) {
            throw new Error('Cannot calculate natural logarithm of zero or negative number');
          }
          result = Math.log(inputValue);
          break;
        default:
          return; // If operation not recognized, do nothing
      }

      // Format and update display
      const resultStr = formatNumberForDisplay(result);
      setDisplay(resultStr);

      // Add to history
      const opSymbol = getOperatorSymbol(op);
      const calculation = `${opSymbol}(${display})`;
      setHistory(prev => [{ calculation, result: resultStr }, ...prev.slice(0, 9)]);

      // Reset state for next calculation
      setFirstOperand(null);
      setOperation(null);
      setWaitingForSecondOperand(false);
      setInputExpression(`${opSymbol}(${display}) = ${resultStr}`);
      
    } catch (error) {
      setDisplay(error instanceof Error ? error.message : 'Error');
      setTimeout(() => {
        setDisplay('0');
        setInputExpression('');
      }, 2000);
    }
  };

  // Helper function to format numbers for display
  const formatNumberForDisplay = (num: number): string => {
    // Check if the number is very small or very large
    if (Math.abs(num) < 0.0000001 || Math.abs(num) > 10000000) {
      return num.toExponential(6);
    }
    
    // For regular numbers, limit decimal places to 8
    const precision = 1000000000;
    const roundedNum = Math.round(num * precision) / precision;
    
    // Convert to string and remove trailing zeros
    return String(roundedNum).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
  };

  // Helper function to get operator symbol
  const getOperatorSymbol = (op: Operation): string => {
    switch (op) {
      case '+':
        return '+';
      case '-':
        return '−';
      case '*':
        return '×';
      case '/':
        return '÷';
      case '^':
        return '^';
      case 'sqrt':
        return '√';
      case 'sin':
        return 'sin';
      case 'cos':
        return 'cos';
      case 'tan':
        return 'tan';
      case 'log':
        return 'log';
      case 'ln':
        return 'ln';
      default:
        return '';
    }
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
        if (secondNumber === 0) {
          throw new Error('Cannot divide by zero');
        }
        result = firstNumber / secondNumber;
        break;
      case '^':
        result = Math.pow(firstNumber, secondNumber);
        break;
      default:
        return secondNumber;
    }

    return result;
  };

  // Function to calculate result
  const calculateResult = () => {
    if (!firstOperand || !operation || waitingForSecondOperand) {
      // Don't calculate if we are waiting for the second operand or if there's no operation set
      return;
    }

    try {
      const result = performCalculation();
      const resultStr = formatNumberForDisplay(result);
      const calculationString = `${firstOperand} ${getOperatorSymbol(operation)} ${display}`;

      setDisplay(resultStr);

      // Add to history
      setHistory(prev => [{ calculation: calculationString, result: resultStr }, ...prev.slice(0, 9)]);

      // Update expression
      setInputExpression(`${calculationString} = ${resultStr}`);

      // Reset for next calculation
      setFirstOperand(null);
      setOperation(null);
      setWaitingForSecondOperand(false);
    } catch (error) {
      setDisplay(error instanceof Error ? error.message : 'Error');
      setTimeout(() => {
        clearCalculator();
      }, 2000);
    }
  };

  // Function to handle memory operations
  const handleMemoryOperation = (op: MemoryOperation) => {
    const currentValue = parseFloat(display);

    switch (op) {
      case 'MC': // Memory Clear
        setMemory(0);
        break;
      case 'MR': // Memory Recall
        setDisplay(String(memory));
        setWaitingForSecondOperand(false);
        break;
      case 'M+': // Memory Add
        setMemory(prevMemory => prevMemory + currentValue);
        setWaitingForSecondOperand(true);
        break;
      case 'M-': // Memory Subtract
        setMemory(prevMemory => prevMemory - currentValue);
        setWaitingForSecondOperand(true);
        break;
      case 'MS': // Memory Store
        setMemory(currentValue);
        setWaitingForSecondOperand(true);
        break;
    }
  };

  // Function to clear the calculator
  const clearCalculator = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
    setInputExpression('');
  };

  // Function to clear the current entry
  const clearEntry = () => {
    setDisplay('0');
    if (waitingForSecondOperand) {
      setWaitingForSecondOperand(false);
    }
  };

  // Function to clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Function to toggle history display
  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  // Function to toggle function panel
  const toggleFunctionPanel = () => {
    setShowFunctionPanel(prev => !prev);
  };

  // Function to handle clicking a history item
  const handleHistoryItemClick = (result: string) => {
    setDisplay(result);
    setFirstOperand(null);
    setOperation(null);
    setWaitingForSecondOperand(false);
    setShowHistory(false);
    setInputExpression(result);
  };

  // Function to display a tooltip
  const showButtonTooltip = (tooltipText: string) => {
    setShowTooltip(tooltipText);
  };

  // Function to hide a tooltip
  const hideButtonTooltip = () => {
    setShowTooltip(null);
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
            <h1 className="text-xl sm:text-2xl font-bold dark:text-white">Scientific Calculator</h1>
            <div className="flex space-x-2">
              <button
                onClick={toggleFunctionPanel}
                className="btn btn-sm bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                aria-label="Toggle functions"
                data-testid="functions-toggle"
              >
                {showFunctionPanel ? 'Hide Functions' : 'More Functions'}
              </button>
              <button
                onClick={toggleHistory}
                className="btn btn-sm bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                aria-label="Toggle history"
                data-testid="history-toggle"
              >
                {showHistory ? 'Hide History' : 'History'}
              </button>
            </div>
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
                      onClick={() => handleHistoryItemClick(item.result)}
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
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1 h-5 overflow-x-auto whitespace-nowrap" data-testid="input-expression">
                {inputExpression}
              </div>
              <div className="text-3xl sm:text-4xl font-bold dark:text-white" data-testid="display">
                {display}
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {memory !== 0 && <span>Memory: {memory}</span>}
                <span className="ml-2">{degreeMode ? 'DEG' : 'RAD'}</span>
              </div>
            </div>
          </div>

          <div className="mb-2 grid grid-cols-5 gap-1">
            <button 
              onClick={() => handleMemoryOperation('MC')}
              className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              data-testid="memory-clear"
              onMouseEnter={() => showButtonTooltip('Memory Clear')}
              onMouseLeave={hideButtonTooltip}
            >
              MC
            </button>
            <button 
              onClick={() => handleMemoryOperation('MR')}
              className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              data-testid="memory-recall"
              onMouseEnter={() => showButtonTooltip('Memory Recall')}
              onMouseLeave={hideButtonTooltip}
            >
              MR
            </button>
            <button 
              onClick={() => handleMemoryOperation('MS')}
              className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              data-testid="memory-store"
              onMouseEnter={() => showButtonTooltip('Memory Store')}
              onMouseLeave={hideButtonTooltip}
            >
              MS
            </button>
            <button 
              onClick={() => handleMemoryOperation('M+')}
              className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              data-testid="memory-add"
              onMouseEnter={() => showButtonTooltip('Memory Add')}
              onMouseLeave={hideButtonTooltip}
            >
              M+
            </button>
            <button 
              onClick={() => handleMemoryOperation('M-')}
              className="btn btn-sm bg-gray-300 hover:bg-gray-400 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              data-testid="memory-subtract"
              onMouseEnter={() => showButtonTooltip('Memory Subtract')}
              onMouseLeave={hideButtonTooltip}
            >
              M-
            </button>
          </div>

          {showFunctionPanel && (
            <div className="mb-2 grid grid-cols-4 gap-1">
              <button 
                onClick={() => handleUnaryOperation('sqrt')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="sqrt"
                onMouseEnter={() => showButtonTooltip('Square Root')}
                onMouseLeave={hideButtonTooltip}
              >
                √
              </button>
              <button 
                onClick={() => handleOperation('^')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="power"
                onMouseEnter={() => showButtonTooltip('Power')}
                onMouseLeave={hideButtonTooltip}
              >
                x^y
              </button>
              <button 
                onClick={() => handleUnaryOperation('log')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="log"
                onMouseEnter={() => showButtonTooltip('Logarithm (base 10)')}
                onMouseLeave={hideButtonTooltip}
              >
                log
              </button>
              <button 
                onClick={() => handleUnaryOperation('ln')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="ln"
                onMouseEnter={() => showButtonTooltip('Natural Logarithm')}
                onMouseLeave={hideButtonTooltip}
              >
                ln
              </button>
              <button 
                onClick={() => handleUnaryOperation('sin')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="sin"
                onMouseEnter={() => showButtonTooltip(`Sine (${degreeMode ? 'degrees' : 'radians'})`)}
                onMouseLeave={hideButtonTooltip}
              >
                sin
              </button>
              <button 
                onClick={() => handleUnaryOperation('cos')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="cos"
                onMouseEnter={() => showButtonTooltip(`Cosine (${degreeMode ? 'degrees' : 'radians'})`)}
                onMouseLeave={hideButtonTooltip}
              >
                cos
              </button>
              <button 
                onClick={() => handleUnaryOperation('tan')}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="tan"
                onMouseEnter={() => showButtonTooltip(`Tangent (${degreeMode ? 'degrees' : 'radians'})`)}
                onMouseLeave={hideButtonTooltip}
              >
                tan
              </button>
              <button 
                onClick={toggleDegreeMode}
                className="btn btn-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800"
                data-testid="degree-mode"
                onMouseEnter={() => showButtonTooltip(`Switch to ${degreeMode ? 'radians' : 'degrees'}`)}
                onMouseLeave={hideButtonTooltip}
              >
                {degreeMode ? 'DEG' : 'RAD'}
              </button>
            </div>
          )}

          <div className="grid grid-cols-4 gap-1">
            <button
              onClick={clearCalculator}
              className="btn bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 font-bold"
              data-testid="clear"
            >
              AC
            </button>
            <button
              onClick={clearEntry}
              className="btn bg-red-400 hover:bg-red-500 text-white dark:bg-red-500 dark:hover:bg-red-600 font-bold"
              data-testid="clear-entry"
            >
              CE
            </button>
            <button
              onClick={() => {
                // Backspace functionality
                if (display.length > 1) {
                  setDisplay(display.slice(0, -1));
                  setInputExpression(prev => prev.slice(0, -1));
                } else {
                  setDisplay('0');
                  if (inputExpression.length <= 1) {
                    setInputExpression('');
                  } else {
                    setInputExpression(prev => prev.slice(0, -1));
                  }
                }
              }}
              className="btn bg-red-400 hover:bg-red-500 text-white dark:bg-red-500 dark:hover:bg-red-600 font-bold"
              data-testid="backspace"
              onMouseEnter={() => showButtonTooltip('Backspace')}
              onMouseLeave={hideButtonTooltip}
            >
              ←
            </button>
            <button
              onClick={() => handleOperation('/')}
              className={`btn ${operation === '/' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="divide"
            >
              ÷
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
              onClick={() => handleOperation('*')}
              className={`btn ${operation === '*' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="multiply"
            >
              ×
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
              onClick={() => handleOperation('-')}
              className={`btn ${operation === '-' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="subtract"
            >
              −
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
              onClick={() => handleOperation('+')}
              className={`btn ${operation === '+' && waitingForSecondOperand ? styles.activeOperation : ''} bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700 font-bold`}
              data-testid="add"
            >
              +
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
            <button
              onClick={calculateResult}
              className={`btn bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700 font-bold ${styles.equalsButton}`}
              data-testid="equals"
            >
              =
            </button>
          </div>

          {/* Tooltip */}
          {showTooltip && (
            <div className={`${styles.tooltip} bg-gray-800 text-white text-xs rounded py-1 px-2 absolute`}>
              {showTooltip}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-center mt-4">
        <button 
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={() => alert('Scientific Calculator Help:\n\n- Use scientific functions like sin, cos, tan, log, etc.\n- Memory functions: MC (clear), MR (recall), MS (store), M+ (add), M- (subtract)\n- Toggle between degrees and radians for trigonometric functions\n- View calculation history and reuse previous results')}
        >
          <Info size={14} />
          <span>Help</span>
        </button>
      </div>

      <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Copyright © 2025 of Datavtar Private Limited. All rights reserved.
      </footer>
    </div>
  );
};

export default App;
