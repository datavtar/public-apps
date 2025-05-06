import React, { useState, useEffect, KeyboardEvent } from 'react';
import styles from './styles/styles.module.css';
import {
  Calculator as CalculatorIcon,
  X,
  ArrowLeft,
  RotateCcw,
  Percent,
  Plus,
  Minus,
  Divide,
  X as Multiply,
  Moon,
  Sun,
} from 'lucide-react';

const App: React.FC = () => {
  interface CalculatorHistory {
    calculation: string;
    result: string;
    timestamp: number;
  }

  // Calculator states
  const [input, setInput] = useState<string>('0');
  const [result, setResult] = useState<string>('0');
  const [history, setHistory] = useState<CalculatorHistory[]>(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });
  const [isScientific, setIsScientific] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true' || 
      (savedMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [isDarkMode]);

  // Save history to local storage
  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  // Handle keyboard input
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const key = e.key;

    if (/^[0-9]$/.test(key)) {
      handleNumberClick(key);
    } else if (key === '.') {
      handleDecimal();
    } else if (['+', '-', '*', '/'].includes(key)) {
      handleOperatorClick(key);
    } else if (key === 'Enter' || key === '=') {
      calculateResult();
    } else if (key === 'Escape') {
      clearInput();
    } else if (key === 'Backspace') {
      handleBackspace();
    }
  };

  // Function to handle number clicks
  const handleNumberClick = (value: string) => {
    if (input === '0') {
      setInput(value);
    } else {
      setInput(input + value);
    }
  };

  // Function to handle operator clicks
  const handleOperatorClick = (operator: string) => {
    // If the last character is an operator, replace it
    if (['+', '-', '*', '/', '%'].includes(input.slice(-1))) {
      setInput(input.slice(0, -1) + operator);
    } else {
      setInput(input + operator);
    }
  };

  // Function to handle decimal point
  const handleDecimal = () => {
    // Check if the last number already has a decimal point
    const parts = input.split(/[\+\-\*\/]/);
    const lastPart = parts[parts.length - 1];
    
    if (!lastPart.includes('.')) {
      setInput(input + '.');
    }
  };

  // Function to handle backspace
  const handleBackspace = () => {
    if (input.length > 1) {
      setInput(input.slice(0, -1));
    } else {
      setInput('0');
    }
  };

  // Function to clear input
  const clearInput = () => {
    setInput('0');
    setResult('0');
  };

  // Function to calculate result
  const calculateResult = () => {
    try {
      // Replace % with /100 for calculation
      let expression = input.replace(/%/g, '/100');
      
      // Check for scientific notation functions
      if (isScientific) {
        expression = expression
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/\^/g, '**');
      }
      
      // eslint-disable-next-line no-eval
      const calculatedResult = eval(expression).toString();
      setResult(calculatedResult);
      
      // Add to history
      const newEntry: CalculatorHistory = {
        calculation: input,
        result: calculatedResult,
        timestamp: Date.now()
      };
      setHistory([newEntry, ...history].slice(0, 10)); // Keep only last 10 entries
      
      // Reset input with result for new calculation
      setInput(calculatedResult);
    } catch (error) {
      setResult('Error');
    }
  };

  // Function to handle scientific operations
  const handleScientificOperation = (operation: string) => {
    switch (operation) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'log':
      case 'ln':
      case 'sqrt':
        setInput(input === '0' ? `${operation}(` : `${input}${operation}(`);
        break;
      case 'pi':
        setInput(input === '0' ? 'Math.PI' : `${input}*Math.PI`);
        break;
      case 'e':
        setInput(input === '0' ? 'Math.E' : `${input}*Math.E`);
        break;
      case '(':
        setInput(input === '0' ? '(' : `${input}(`);
        break;
      case ')':
        setInput(`${input})`);
        break;
      case 'pow':
        setInput(`${input}^`);
        break;
      default:
        break;
    }
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Toggle calculator mode
  const toggleCalculatorMode = () => {
    setIsScientific(!isScientific);
  };

  return (
    <div 
      className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className="container-narrow py-8 px-4">
        {/* Header */}
        <div className="flex-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CalculatorIcon className="h-6 w-6" /> 
            {isScientific ? 'Scientific Calculator' : 'Calculator'}
          </h1>
          
          <div className="flex items-center gap-4">
            <button 
              className="theme-toggle" 
              onClick={() => setIsDarkMode(!isDarkMode)}
              aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="theme-toggle-thumb"></span>
              <span className="sr-only">{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
            </button>
            
            <button 
              onClick={toggleCalculatorMode}
              className="btn btn-primary btn-sm flex items-center gap-1"
              aria-label={isScientific ? 'Switch to standard calculator' : 'Switch to scientific calculator'}
            >
              {isScientific ? 'Standard' : 'Scientific'}
            </button>
          </div>
        </div>
        
        {/* Calculator */}
        <div className="card dark:bg-gray-800 shadow-lg mb-6">
          {/* Display */}
          <div className={styles.display}>
            <div className={styles.expression}>{input}</div>
            <div className={styles.result}>{result !== input ? result : ''}</div>
          </div>
          
          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 dark:bg-gray-700 rounded-b-lg">
            {/* First row */}
            <button 
              onClick={clearInput}
              className={`${styles.button} ${styles.function}`}
              aria-label="Clear all"
            >
              C
            </button>
            <button 
              onClick={() => handleBackspace()}
              className={`${styles.button} ${styles.function} flex-center`}
              aria-label="Backspace"
            >
              <ArrowLeft size={18} />
            </button>
            <button 
              onClick={() => handleOperatorClick('%')}
              className={`${styles.button} ${styles.operator} flex-center`}
              aria-label="Percent"
            >
              <Percent size={18} />
            </button>
            <button 
              onClick={() => handleOperatorClick('/')}
              className={`${styles.button} ${styles.operator} flex-center`}
              aria-label="Divide"
            >
              <Divide size={18} />
            </button>
            
            {/* Second row */}
            <button 
              onClick={() => handleNumberClick('7')}
              className={styles.button}
              aria-label="Seven"
            >
              7
            </button>
            <button 
              onClick={() => handleNumberClick('8')}
              className={styles.button}
              aria-label="Eight"
            >
              8
            </button>
            <button 
              onClick={() => handleNumberClick('9')}
              className={styles.button}
              aria-label="Nine"
            >
              9
            </button>
            <button 
              onClick={() => handleOperatorClick('*')}
              className={`${styles.button} ${styles.operator} flex-center`}
              aria-label="Multiply"
            >
              <Multiply size={18} />
            </button>
            
            {/* Third row */}
            <button 
              onClick={() => handleNumberClick('4')}
              className={styles.button}
              aria-label="Four"
            >
              4
            </button>
            <button 
              onClick={() => handleNumberClick('5')}
              className={styles.button}
              aria-label="Five"
            >
              5
            </button>
            <button 
              onClick={() => handleNumberClick('6')}
              className={styles.button}
              aria-label="Six"
            >
              6
            </button>
            <button 
              onClick={() => handleOperatorClick('-')}
              className={`${styles.button} ${styles.operator} flex-center`}
              aria-label="Subtract"
            >
              <Minus size={18} />
            </button>
            
            {/* Fourth row */}
            <button 
              onClick={() => handleNumberClick('1')}
              className={styles.button}
              aria-label="One"
            >
              1
            </button>
            <button 
              onClick={() => handleNumberClick('2')}
              className={styles.button}
              aria-label="Two"
            >
              2
            </button>
            <button 
              onClick={() => handleNumberClick('3')}
              className={styles.button}
              aria-label="Three"
            >
              3
            </button>
            <button 
              onClick={() => handleOperatorClick('+')}
              className={`${styles.button} ${styles.operator} flex-center`}
              aria-label="Add"
            >
              <Plus size={18} />
            </button>
            
            {/* Fifth row */}
            <button 
              onClick={() => handleNumberClick('0')}
              className={`${styles.button} col-span-2`}
              aria-label="Zero"
            >
              0
            </button>
            <button 
              onClick={handleDecimal}
              className={styles.button}
              aria-label="Decimal point"
            >
              .
            </button>
            <button 
              onClick={calculateResult}
              className={`${styles.button} ${styles.equals}`}
              aria-label="Equals"
            >
              =
            </button>
          </div>
          
          {/* Scientific Keypad - Conditionally rendered */}
          {isScientific && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => handleScientificOperation('sin')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Sine"
              >
                sin
              </button>
              <button 
                onClick={() => handleScientificOperation('cos')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Cosine"
              >
                cos
              </button>
              <button 
                onClick={() => handleScientificOperation('tan')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Tangent"
              >
                tan
              </button>
              <button 
                onClick={() => handleScientificOperation('log')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Logarithm base 10"
              >
                log
              </button>
              <button 
                onClick={() => handleScientificOperation('ln')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Natural logarithm"
              >
                ln
              </button>
              <button 
                onClick={() => handleScientificOperation('sqrt')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Square root"
              >
                √
              </button>
              <button 
                onClick={() => handleScientificOperation('pi')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Pi"
              >
                π
              </button>
              <button 
                onClick={() => handleScientificOperation('e')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Euler's number"
              >
                e
              </button>
              <button 
                onClick={() => handleScientificOperation('pow')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Power"
              >
                x^y
              </button>
              <button 
                onClick={() => handleScientificOperation('(')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Left parenthesis"
              >
                (
              </button>
              <button 
                onClick={() => handleScientificOperation(')')}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Right parenthesis"
              >
                )
              </button>
              <button 
                onClick={() => handleNumberClick(Math.PI.toString())}
                className={`${styles.button} ${styles.scientific}`}
                aria-label="Pi value"
              >
                π→
              </button>
            </div>
          )}
        </div>
        
        {/* History Section */}
        <div className="card dark:bg-gray-800 mt-6">
          <div className="flex-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold">History</h2>
            <button 
              onClick={clearHistory}
              className="btn btn-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1"
              aria-label="Clear history"
              disabled={history.length === 0}
            >
              <RotateCcw size={16} />
              Clear
            </button>
          </div>
          
          <div className={`p-4 ${styles.historyList}`}>
            {history.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                No calculations yet
              </p>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {history.map((entry, index) => (
                  <li key={index} className="py-3">
                    <div className="flex-between">
                      <div>
                        <p className="font-medium">{entry.calculation} = {entry.result}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setInput(entry.calculation);
                          setResult(entry.result);
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        aria-label="Use this calculation"
                      >
                        Use
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Copyright © 2025 of Datavtar Private Limited. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default App;