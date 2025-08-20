import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Delete, MemoryStick, Copy, Check } from 'lucide-react';

const CalculatorPopup = ({ isOpen, onToggle }) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operator, setOperator] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [memory, setMemory] = useState(0);
  const [copied, setCopied] = useState(false);

  // Keyboard support
  const handleKeyPress = useCallback((event) => {
    if (!isOpen) return;

    event.preventDefault();
    const { key } = event;

    if (key >= '0' && key <= '9') {
      inputDigit(parseInt(key));
    } else if (key === '.') {
      inputDecimal();
    } else if (key === '+') {
      handleOperator('+');
    } else if (key === '-') {
      handleOperator('-');
    } else if (key === '*') {
      handleOperator('*');
    } else if (key === '/') {
      handleOperator('/');
    } else if (key === 'Enter' || key === '=') {
      handleEquals();
    } else if (key === 'Escape') {
      clear();
    } else if (key === 'Backspace') {
      handleBackspace();
    }
  }, [isOpen, display, previousValue, operator, waitingForOperand]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyPress);
      return () => window.removeEventListener('keydown', handleKeyPress);
    }
  }, [isOpen, handleKeyPress]);

  const inputDigit = (digit) => {
    if (waitingForOperand) {
      setDisplay(String(digit));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(digit) : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const performCalculation = (nextOperator) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operator) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operator);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperator(nextOperator);
  };

  const calculate = (firstOperand, secondOperand, operator) => {
    switch (operator) {
      case '+':
        return firstOperand + secondOperand;
      case '-':
        return firstOperand - secondOperand;
      case '*':
        return firstOperand * secondOperand;
      case '/':
        return firstOperand / secondOperand;
      case '=':
        return secondOperand;
      default:
        return secondOperand;
    }
  };

  const handleOperator = (nextOperator) => {
    performCalculation(nextOperator);
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);
    
    if (previousValue !== null && operator) {
      const newValue = calculate(previousValue, inputValue, operator);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  // Memory functions
  const memoryStore = () => {
    setMemory(parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
    setWaitingForOperand(true);
  };

  const memoryClear = () => {
    setMemory(0);
  };

  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(display).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = display;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const CalculatorButton = ({ onClick, className = '', children, ...props }) => (
    <button
      onClick={onClick}
      className={`h-12 rounded-lg font-semibold text-sm transition-all duration-150 active:scale-95 calculator-button ${className}`}
      {...props}
    >
      {children}
    </button>
  );

  return (
    <>
      {/* Calculator Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 left-6 z-40 p-4 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 ${
          isOpen 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
        } text-white`}
        title={isOpen ? 'Close Calculator' : 'Open Calculator'}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Calculator className="h-6 w-6" />}
      </button>

      {/* Calculator Popup */}
      {isOpen && (
        <div className="fixed bottom-24 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all duration-300 animate-in slide-in-from-bottom-4 w-80">
          {/* Calculator Header */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5" />
                <h3 className="font-semibold">Calculator</h3>
              </div>
              <div className="flex items-center space-x-2">
                {memory !== 0 && (
                  <div className="bg-yellow-500 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
                    <MemoryStick className="h-3 w-3" />
                    <span>M</span>
                  </div>
                )}
                <button
                  onClick={onToggle}
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Display */}
          <div className="p-4 bg-slate-100 border-b border-slate-200">
            <div className="bg-white rounded-lg p-4 shadow-inner">
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-slate-800 truncate">
                  {display}
                </div>
                {operator && (
                  <div className="text-sm text-slate-500 mt-1">
                    {previousValue} {operator} ...
                  </div>
                )}
              </div>
              {/* Copy button */}
              <div className="flex justify-end mt-2">
                <button
                  onClick={copyToClipboard}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg transition-colors flex items-center space-x-1"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Memory Functions */}
          <div className="p-3 bg-slate-50 border-b border-slate-200">
            <div className="grid grid-cols-4 gap-1">
              <CalculatorButton
                onClick={memoryClear}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 text-xs py-2"
                title="Memory Clear"
              >
                MC
              </CalculatorButton>
              <CalculatorButton
                onClick={memoryRecall}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 text-xs py-2"
                title="Memory Recall"
              >
                MR
              </CalculatorButton>
              <CalculatorButton
                onClick={memoryStore}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 text-xs py-2"
                title="Memory Store"
              >
                MS
              </CalculatorButton>
              <CalculatorButton
                onClick={memoryAdd}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300 text-xs py-2"
                title="Memory Add"
              >
                M+
              </CalculatorButton>
            </div>
          </div>

          {/* Calculator Buttons */}
          <div className="p-4 bg-white">
            <div className="grid grid-cols-4 gap-2">
              {/* Row 1 */}
              <CalculatorButton
                onClick={clear}
                className="col-span-2 bg-red-100 hover:bg-red-200 text-red-700 border border-red-300"
              >
                Clear
              </CalculatorButton>
              <CalculatorButton
                onClick={handleBackspace}
                className="bg-orange-100 hover:bg-orange-200 text-orange-700 border border-orange-300"
              >
                <Delete className="h-4 w-4 mx-auto" />
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator('/')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
              >
                ÷
              </CalculatorButton>

              {/* Row 2 */}
              <CalculatorButton
                onClick={() => inputDigit(7)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                7
              </CalculatorButton>
              <CalculatorButton
                onClick={() => inputDigit(8)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                8
              </CalculatorButton>
              <CalculatorButton
                onClick={() => inputDigit(9)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                9
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator('*')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
              >
                ×
              </CalculatorButton>

              {/* Row 3 */}
              <CalculatorButton
                onClick={() => inputDigit(4)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                4
              </CalculatorButton>
              <CalculatorButton
                onClick={() => inputDigit(5)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                5
              </CalculatorButton>
              <CalculatorButton
                onClick={() => inputDigit(6)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                6
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator('-')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
              >
                -
              </CalculatorButton>

              {/* Row 4 */}
              <CalculatorButton
                onClick={() => inputDigit(1)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                1
              </CalculatorButton>
              <CalculatorButton
                onClick={() => inputDigit(2)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                2
              </CalculatorButton>
              <CalculatorButton
                onClick={() => inputDigit(3)}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                3
              </CalculatorButton>
              <CalculatorButton
                onClick={() => handleOperator('+')}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300"
              >
                +
              </CalculatorButton>

              {/* Row 5 */}
              <CalculatorButton
                onClick={() => inputDigit(0)}
                className="col-span-2 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                0
              </CalculatorButton>
              <CalculatorButton
                onClick={inputDecimal}
                className="bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300"
              >
                .
              </CalculatorButton>
              <CalculatorButton
                onClick={handleEquals}
                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg"
              >
                =
              </CalculatorButton>
            </div>
          </div>

          {/* Keyboard shortcut hint */}
          <div className="px-4 pb-4">
            <div className="text-xs text-slate-500 text-center bg-slate-50 py-2 rounded-lg">
              💡 Tip: Use keyboard shortcuts when calculator is open
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CalculatorPopup;