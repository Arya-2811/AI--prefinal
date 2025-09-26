import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Copy, Download, RotateCcw, Settings, Zap, Cloud, Terminal, Globe, RefreshCw, Code } from "lucide-react";

const COMMON_DOCS: Record<string, string> = {
  console: "Console provides access to the browser debugging console.",
  log: "console.log prints messages to the console.",
  map: "Array.prototype.map creates a new array by applying a function to each element.",
  filter: "Array.prototype.filter creates a new array with elements that pass the test.",
  def: "Keyword to define a function in Python.",
  class: "Defines a class in many languages.",
  for: "Loop construct for iteration.",
  while: "Loop construct for conditional iteration.",
  if: "Conditional statement for branching logic.",
  function: "Declares a function in JavaScript.",
  const: "Declares a constant variable in JavaScript.",
  let: "Declares a block-scoped variable in JavaScript.",
};

const LANGUAGE_WORDS: Record<string, string[]> = {
  javascript: ["function", "const", "let", "console", "log", "map", "filter", "Promise", "async", "await", "for", "while", "if", "else", "return", "var", "document", "window"],
  python: ["def", "print", "list", "dict", "import", "class", "return", "for", "while", "if", "else", "elif", "try", "except", "with", "lambda"],
  cpp: ["#include", "std", "cout", "cin", "class", "template", "auto", "int", "vector", "string", "for", "while", "if", "else", "namespace"],
  java: ["class", "public", "static", "void", "String", "System", "out", "println", "for", "while", "if", "else", "try", "catch", "finally"],
};

type ExecutionMode = 'local' | 'online' | 'docker';

interface AIEditorProps {
  language: string;
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  onOutputChange?: (output: string, error: string) => void;
  hideOutput?: boolean;
}

export default function AIEditor({ language, initialCode, onCodeChange, onOutputChange, hideOutput = false }: AIEditorProps) {
  const [code, setCode] = useState(initialCode || "");
  const [suggestion, setSuggestion] = useState("");
  const [cursorWord, setCursorWord] = useState("");
  const [nextLineSuggestion, setNextLineSuggestion] = useState("");
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('local');
  const [userInput, setUserInput] = useState("");
  const [inputPrompt, setInputPrompt] = useState("");
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [inputHistory, setInputHistory] = useState<string[]>([]);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  const words = useMemo(() => LANGUAGE_WORDS[language] ?? [], [language]);

  useEffect(() => { 
    setSuggestion(""); 
    setNextLineSuggestion(""); 
    setOutput("");
    setError("");
  }, [language]);

  // Update code when initialCode changes (e.g., when switching languages)
  useEffect(() => {
    if (initialCode !== undefined) {
      setCode(initialCode);
    }
  }, [initialCode]);

  function computeNextLine(word: string) {
    if (!word) return "";
    switch (language) {
      case "javascript":
        if (word === "function") return " myFunction() {\n  \n}";
        if (word === "for") return " (let i = 0; i < length; i++) {\n  \n}";
        if (word === "while") return " (condition) {\n  \n}";
        if (word === "if") return " (condition) {\n  \n}";
        if (["const", "let"].includes(word)) return " variable = value;";
        return "";
      case "python":
        if (word === "def") return " function_name():\n    pass";
        if (word === "class") return " ClassName:\n    pass";
        if (word === "for") return " item in items:\n    pass";
        if (word === "while") return " condition:\n    pass";
        if (word === "if") return " condition:\n    pass";
        return "";
      case "cpp":
        if (word === "class") return " ClassName {\npublic:\n    \n};";
        if (word === "for") return " (int i = 0; i < n; i++) {\n    \n}";
        if (word === "while") return " (condition) {\n    \n}";
        if (word === "if") return " (condition) {\n    \n}";
        return "";
      case "java":
        if (word === "class") return " ClassName {\n    \n}";
        if (word === "for") return " (int i = 0; i < length; i++) {\n    \n}";
        if (word === "while") return " (condition) {\n    \n}";
        if (word === "if") return " (condition) {\n    \n}";
        return "";
      default:
        return "";
    }
  }

  function handleCodeChange(newCode: string) {
    // Apply smart indentation for Python
    const processedCode = handlePythonKeywordIndent(newCode, taRef.current?.selectionStart || 0);
    
    setCode(processedCode);
    onCodeChange?.(processedCode);
    
    // If the code was modified by smart indentation, update cursor position
    if (processedCode !== newCode && taRef.current) {
      setTimeout(() => {
        const textarea = taRef.current;
        if (textarea) {
          const cursorPos = textarea.selectionStart;
          textarea.setSelectionRange(cursorPos, cursorPos);
        }
      }, 0);
    }
  }

  function onChange(v: string) {
    handleCodeChange(v);
    const beforeCursor = v.slice(0, taRef.current?.selectionStart ?? v.length);
    const last = beforeCursor.split(/\s|\n|\t/).pop() || "";
    setCursorWord(last);
    const next = words.find((w) => w.startsWith(last) && w !== last) || "";
    setSuggestion(next ? next.slice(last.length) : "");
    setNextLineSuggestion(computeNextLine(last));
  }

  // Get proper indentation for the current line
  function getIndentationLevel(text: string, cursorPos: number): number {
    const lines = text.slice(0, cursorPos).split('\n');
    const currentLine = lines[lines.length - 1];
    const previousLine = lines.length > 1 ? lines[lines.length - 2] : '';
    
    // Count existing indentation
    const currentIndent = (currentLine.match(/^(\s*)/)?.[1] || '').length;
    const previousIndent = (previousLine.match(/^(\s*)/)?.[1] || '').length;
    
    if (language === 'python') {
      // Python-specific indentation rules
      const prevTrimmed = previousLine.trim();
      const currentTrimmed = currentLine.trim();
      
      // Increase indentation after colons (function, class, if, for, while, etc.)
      const shouldIndent = prevTrimmed.endsWith(':') && 
        (prevTrimmed.startsWith('def ') || 
         prevTrimmed.startsWith('class ') ||
         prevTrimmed.startsWith('if ') ||
         prevTrimmed.startsWith('elif ') ||
         prevTrimmed.startsWith('else:') ||
         prevTrimmed.startsWith('for ') ||
         prevTrimmed.startsWith('while ') ||
         prevTrimmed.startsWith('try:') ||
         prevTrimmed.startsWith('except') ||
         prevTrimmed.startsWith('finally:') ||
         prevTrimmed.startsWith('with ') ||
         prevTrimmed.includes('if __name__'));
      
      // Dedent for else, elif, except, finally
      const shouldDedent = currentTrimmed.startsWith('else:') || 
                          currentTrimmed.startsWith('elif ') || 
                          currentTrimmed.startsWith('except') || 
                          currentTrimmed.startsWith('finally:');
      
      if (shouldIndent) {
        return previousIndent + 4; // 4 spaces for Python
      } else if (shouldDedent && currentIndent > 0) {
        return Math.max(0, currentIndent - 4);
      }
      
      return previousIndent;
    } else {
      // Other languages (JavaScript, etc.)
      const shouldIndent = previousLine.trim().endsWith('{') || 
                          previousLine.trim().endsWith('(') || 
                          previousLine.trim().endsWith('[');
      
      const shouldDedent = currentLine.trim().startsWith('}') || 
                          currentLine.trim().startsWith(')') || 
                          currentLine.trim().startsWith(']');
      
      if (shouldIndent) {
        return previousIndent + 2; // 2 spaces for other languages
      } else if (shouldDedent && currentIndent > 0) {
        return Math.max(0, currentIndent - 2);
      }
      
      return previousIndent;
    }
  }

  // Format Python code with proper indentation
  function formatPythonCode(code: string): string {
    if (language !== 'python') return code;
    
    const lines = code.split('\n');
    const formattedLines: string[] = [];
    let currentIndent = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      
      if (trimmed === '') {
        formattedLines.push('');
        continue;
      }
      
      // Dedent for else, elif, except, finally
      if (trimmed.startsWith('else:') || 
          trimmed.startsWith('elif ') || 
          trimmed.startsWith('except') || 
          trimmed.startsWith('finally:')) {
        currentIndent = Math.max(0, currentIndent - 4);
      }
      
      // Add proper indentation
      formattedLines.push(' '.repeat(currentIndent) + trimmed);
      
      // Indent after colons
      if (trimmed.endsWith(':') && 
          (trimmed.startsWith('def ') || 
           trimmed.startsWith('class ') ||
           trimmed.startsWith('if ') ||
           trimmed.startsWith('elif ') ||
           trimmed.startsWith('else:') ||
           trimmed.startsWith('for ') ||
           trimmed.startsWith('while ') ||
           trimmed.startsWith('try:') ||
           trimmed.startsWith('except') ||
           trimmed.startsWith('finally:') ||
           trimmed.startsWith('with ') ||
           trimmed.includes('if __name__'))) {
        currentIndent += 4;
      }
    }
    
    return formattedLines.join('\n');
  }

  // Auto-indent when typing Python keywords
  function handlePythonKeywordIndent(newCode: string, cursorPos: number) {
    if (language !== 'python') return newCode;
    
    const lines = newCode.split('\n');
    const currentLineIndex = newCode.slice(0, cursorPos).split('\n').length - 1;
    const currentLine = lines[currentLineIndex];
    const trimmed = currentLine.trim();
    
    // Check if we just typed a keyword that should be dedented
    const dedentKeywords = ['else:', 'elif ', 'except', 'finally:'];
    const shouldDedent = dedentKeywords.some(keyword => trimmed.startsWith(keyword));
    
    if (shouldDedent && currentLine.startsWith('    ')) {
      // Find the proper indentation level by looking at previous lines
      let properIndent = 0;
      for (let i = currentLineIndex - 1; i >= 0; i--) {
        const prevLine = lines[i].trim();
        if (prevLine.startsWith('if ') || prevLine.startsWith('try:') || prevLine.startsWith('for ') || prevLine.startsWith('while ')) {
          properIndent = (lines[i].match(/^(\s*)/)?.[1] || '').length;
          break;
        }
      }
      
      // Replace the current line with proper indentation
      lines[currentLineIndex] = ' '.repeat(properIndent) + trimmed;
      return lines.join('\n');
    }
    
    return newCode;
  }

  // Handle smart indentation and auto-completion
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = taRef.current;
    if (!textarea) return;

    const { selectionStart, selectionEnd, value } = textarea;
    
    // Handle Ctrl+Shift+F for formatting Python code
    if (e.key === "F" && e.ctrlKey && e.shiftKey && language === 'python') {
      e.preventDefault();
      const formattedCode = formatPythonCode(value);
      setCode(formattedCode);
      return;
    }

    // Handle Tab for suggestions first
    if (e.key === "Tab" && suggestion) { 
      e.preventDefault(); 
      acceptSuggestion(); 
      return;
    }
    
    // Handle Ctrl+Enter for templates
    if (e.key === "Enter" && e.ctrlKey && nextLineSuggestion) { 
      e.preventDefault(); 
      acceptNextLine(); 
      return;
    }
    
    // Handle Escape for dismissing suggestions
    if (e.key === "Escape") { 
      e.preventDefault(); 
      rejectSuggestion(); 
      return;
    }

    // Handle Tab for indentation
    if (e.key === "Tab" && !suggestion) {
      e.preventDefault();
      const indent = language === 'python' ? '    ' : '  '; // 4 spaces for Python, 2 for others
      
      if (selectionStart !== selectionEnd) {
        // Multi-line selection - indent/dedent multiple lines
        const lines = value.split('\n');
        const startLine = value.slice(0, selectionStart).split('\n').length - 1;
        const endLine = value.slice(0, selectionEnd).split('\n').length - 1;
        
        for (let i = startLine; i <= endLine; i++) {
          if (e.shiftKey) {
            // Dedent - remove indentation
            if (lines[i].startsWith(indent)) {
              lines[i] = lines[i].slice(indent.length);
            }
          } else {
            // Indent - add indentation
            lines[i] = indent + lines[i];
          }
        }
        
        const newValue = lines.join('\n');
        setCode(newValue);
        
        // Restore selection
        setTimeout(() => {
          const newStart = selectionStart + (e.shiftKey ? -indent.length : indent.length);
          const newEnd = selectionEnd + (endLine - startLine + 1) * (e.shiftKey ? -indent.length : indent.length);
          textarea.setSelectionRange(newStart, newEnd);
        }, 0);
      } else {
        // Single cursor - insert indentation
        const newValue = value.slice(0, selectionStart) + indent + value.slice(selectionEnd);
        setCode(newValue);
        setTimeout(() => textarea.setSelectionRange(selectionStart + indent.length, selectionStart + indent.length), 0);
      }
      return;
    }

    // Handle Enter for auto-indentation
    if (e.key === "Enter") {
      e.preventDefault();
      
      const beforeCursor = value.slice(0, selectionStart);
      const afterCursor = value.slice(selectionEnd);
      const currentLine = beforeCursor.split('\n').pop() || '';
      const currentLineTrimmed = currentLine.trim();
      
      if (language === 'python') {
        // Python-specific Enter behavior
        let indentLevel = 0;
        const lines = beforeCursor.split('\n');
        
        // Calculate current indentation
        const currentIndent = (currentLine.match(/^(\s*)/)?.[1] || '').length;
        
        // Check if current line ends with colon (should increase indent)
        const shouldIncreaseIndent = currentLineTrimmed.endsWith(':') && 
          (currentLineTrimmed.startsWith('def ') || 
           currentLineTrimmed.startsWith('class ') ||
           currentLineTrimmed.startsWith('if ') ||
           currentLineTrimmed.startsWith('elif ') ||
           currentLineTrimmed.startsWith('else:') ||
           currentLineTrimmed.startsWith('for ') ||
           currentLineTrimmed.startsWith('while ') ||
           currentLineTrimmed.startsWith('try:') ||
           currentLineTrimmed.startsWith('except') ||
           currentLineTrimmed.startsWith('finally:') ||
           currentLineTrimmed.startsWith('with ') ||
           currentLineTrimmed.includes('if __name__'));
        
        if (shouldIncreaseIndent) {
          indentLevel = currentIndent + 4;
        } else {
          // Maintain current indentation level
          indentLevel = currentIndent;
        }
        
        const indentStr = ' '.repeat(indentLevel);
        const newValue = beforeCursor + '\n' + indentStr + afterCursor;
        const cursorOffset = indentLevel + 1;
        
        setCode(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + cursorOffset, selectionStart + cursorOffset);
        }, 0);
      } else {
        // Other languages behavior
        const indentLevel = getIndentationLevel(beforeCursor, selectionStart);
        const indentStr = ' '.repeat(indentLevel);
        
        // Check for auto-closing brackets
        const openBrackets = ['(', '[', '{'];
        const closeBrackets = [')', ']', '}'];
        const lastChar = currentLineTrimmed.slice(-1);
        const nextChar = afterCursor.charAt(0);
        
        let newValue = '';
        let cursorOffset = 0;
        
        if (openBrackets.includes(lastChar) && closeBrackets.includes(nextChar)) {
          // Auto-close brackets with proper indentation
          const extraIndent = '  ';
          newValue = beforeCursor + '\n' + indentStr + extraIndent + '\n' + indentStr + afterCursor;
          cursorOffset = indentStr.length + extraIndent.length + 1;
        } else {
          // Normal enter with indentation
          newValue = beforeCursor + '\n' + indentStr + afterCursor;
          cursorOffset = indentStr.length + 1;
        }
        
        setCode(newValue);
        setTimeout(() => {
          textarea.setSelectionRange(selectionStart + cursorOffset, selectionStart + cursorOffset);
        }, 0);
      }
      return;
    }

    // Handle auto-closing brackets
    const bracketPairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'"
    };

    if (bracketPairs[e.key]) {
      e.preventDefault();
      const closingBracket = bracketPairs[e.key];
      const beforeCursor = value.slice(0, selectionStart);
      const afterCursor = value.slice(selectionEnd);
      
      // For quotes, check if we should close or just move cursor
      if ((e.key === '"' || e.key === "'") && afterCursor.charAt(0) === e.key) {
        // Just move cursor past the existing quote
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
        return;
      }
      
      const newValue = beforeCursor + e.key + closingBracket + afterCursor;
      setCode(newValue);
      setTimeout(() => {
        textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      }, 0);
      return;
    }

    // Handle closing brackets - skip if next character matches
    if ([')', ']', '}'].includes(e.key) && value.charAt(selectionStart) === e.key) {
      e.preventDefault();
      textarea.setSelectionRange(selectionStart + 1, selectionStart + 1);
      return;
    }
  }

  function acceptSuggestion() {
    if (!suggestion) return;
    setCode((c) => c + suggestion);
    setSuggestion("");
    track("accepted");
  }

  function acceptNextLine() {
    if (!nextLineSuggestion) return;
    setCode((c) => (c.endsWith("\n") ? c : c + "\n") + nextLineSuggestion);
    setNextLineSuggestion("");
    track("accepted");
  }

  function rejectSuggestion() { 
    setSuggestion(""); 
    setNextLineSuggestion(""); 
    track("rejected"); 
  }

  // Online code execution using Judge0 API (free tier)
  async function executeOnline(code: string, languageId: number) {
    try {
      // Submit code for execution
      const submitResponse = await fetch('https://judge0-ce.p.rapidapi.com/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': 'demo-key', // You'd need to replace with actual API key
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        body: JSON.stringify({
          source_code: btoa(code), // Base64 encode
          language_id: languageId,
          stdin: btoa(''), // Base64 encode stdin
        })
      });

      if (!submitResponse.ok) {
        throw new Error('Failed to submit code for execution');
      }

      const submitData = await submitResponse.json();
      const token = submitData.token;

      // Poll for results
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        
        const resultResponse = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}`, {
          headers: {
            'X-RapidAPI-Key': 'demo-key',
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
          }
        });

        const resultData = await resultResponse.json();
        
        if (resultData.status.id > 2) { // Status > 2 means completed
          if (resultData.stdout) {
            return atob(resultData.stdout); // Decode base64
          } else if (resultData.stderr) {
            throw new Error(atob(resultData.stderr));
          } else if (resultData.compile_output) {
            throw new Error(atob(resultData.compile_output));
          } else {
            return 'Code executed successfully (no output)';
          }
        }
        
        attempts++;
      }
      
      throw new Error('Execution timeout');
    } catch (error) {
      throw new Error(`Online execution failed: ${error}`);
    }
  }

  // Alternative: Use Piston API (another free option)
  async function executePiston(code: string, language: string, stdin: string = '') {
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language,
          version: '*', // Use latest version
          files: [{
            content: code
          }],
          stdin: stdin
        })
      });

      if (!response.ok) {
        throw new Error('Failed to execute code');
      }

      const data = await response.json();
      
      if (data.run.stderr) {
        throw new Error(data.run.stderr);
      }
      
      return data.run.stdout || 'Code executed successfully (no output)';
    } catch (error) {
      throw new Error(`Piston execution failed: ${error}`);
    }
  }

  // Handle user input submission
  function submitInput() {
    if (!userInput.trim()) return;
    
    const newHistory = [...inputHistory, userInput];
    setInputHistory(newHistory);
    setWaitingForInput(false);
    
    // Re-run code with all inputs
    const allInputs = newHistory.join('\n');
    setUserInput("");
    
    // Execute with stdin
    executeWithInput(allInputs);
  }

  // Execute code with input
  async function executeWithInput(stdin: string) {
    if ((executionMode === 'online' || executionMode === 'local') && language !== 'javascript') {
      const languageMap: Record<string, string> = {
        python: 'python',
        cpp: 'cpp',
        java: 'java'
      };
      
      if (languageMap[language]) {
        try {
          // Use direct Python execution for Python, Piston for others
          if (language === 'python') {
            const response = await fetch('/api/python/execute', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: code, stdin: allInputs })
            });
            const result = await response.json();
            if (result.error) {
              throw new Error(result.error);
            }
            setOutput(result.output || 'Code executed successfully');
          } else {
            const result = await executePiston(code, languageMap[language], stdin);
            setOutput(result);
          }
        } catch (error) {
          setError(`Execution failed: ${error}`);
        }
      }
    }
  }

  // Detect if code needs input
  function codeNeedsInput(code: string, language: string): boolean {
    if (language === 'python') {
      return /input\s*\(/.test(code);
    } else if (language === 'cpp') {
      return /cin\s*>>/.test(code) || /scanf/.test(code);
    } else if (language === 'java') {
      return /Scanner/.test(code) || /System\.in/.test(code);
    }
    return false;
  }

  // WebAssembly execution for certain languages
  async function executeWasm(code: string, language: string) {
    try {
      if (language === 'python') {
        // Use Pyodide for Python in browser
        setOutput('Loading Python environment...');
        
        // This would require loading Pyodide
        // const pyodide = await loadPyodide();
        // const result = pyodide.runPython(code);
        // return result;
        
        return 'WebAssembly Python execution would require Pyodide setup';
      } else if (language === 'cpp') {
        return 'WebAssembly C++ execution would require Emscripten setup';
      }
      
      throw new Error(`WebAssembly execution not implemented for ${language}`);
    } catch (error) {
      throw new Error(`WebAssembly execution failed: ${error}`);
    }
  }

  async function runCode() {
    setIsRunning(true);
    setError("");
    setOutput("Running your code...");
    onOutputChange?.("Running your code...", "");
    setWaitingForInput(false);
    setInputHistory([]);
    setUserInput("");
    
    try {
      // Choose execution method based on mode and language
      if ((executionMode === 'online' || executionMode === 'local') && language !== 'javascript') {
        // Check if code needs input
        if (codeNeedsInput(code, language)) {
          setWaitingForInput(true);
          setInputPrompt("Your program is waiting for input. Enter values below:");
          setOutput("Program started. Waiting for input...");
          return;
        }
        
        // Use online execution for non-JavaScript languages
        const languageMap: Record<string, string> = {
          python: 'python',
          cpp: 'cpp',
          java: 'java'
        };
        
        if (languageMap[language]) {
          try {
            const allInputs = inputHistory.join('\n');
            // Use direct Python execution for Python, Piston for others
            if (language === 'python') {
              const response = await fetch('/api/python/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: code, stdin: allInputs })
              });
              const result = await response.json();
              if (result.error) {
                throw new Error(result.error);
              }
              setOutput(result.output || 'Code executed successfully');
            } else {
              const result = await executePiston(code, languageMap[language], allInputs);
              setOutput(result);
            }
            return;
          } catch (error) {
            // Fallback to simulation if online fails
            setError(`Online execution failed, falling back to simulation: ${error}`);
          }
        }
      }
      
      if (language === "javascript") {
        // Capture console output
        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;
        let capturedOutput = "";
        
        const captureOutput = (...args: any[]) => {
          capturedOutput += args.map(arg => {
            if (typeof arg === 'object' && arg !== null) {
              try {
                return JSON.stringify(arg, null, 2);
              } catch {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ') + '\n';
        };
        
        console.log = captureOutput;
        console.warn = captureOutput;
        console.error = captureOutput;
        
        try {
          // Handle different types of JavaScript code
          let result;
          
          // Check if code contains function declarations or complex statements
          if (code.includes('function ') || code.includes('=>') || code.includes('const ') || code.includes('let ') || code.includes('var ')) {
            // Execute as a complete script
            result = new Function(code)();
          } else {
            // Try to evaluate as an expression first
            try {
              result = new Function('return ' + code)();
            } catch {
              // If that fails, execute as a statement
              result = new Function(code)();
            }
          }
          
          // Show the result if it's not undefined
          if (result !== undefined) {
            if (typeof result === 'object' && result !== null) {
              try {
                capturedOutput += `→ ${JSON.stringify(result, null, 2)}\n`;
              } catch {
                capturedOutput += `→ ${String(result)}\n`;
              }
            } else {
              capturedOutput += `→ ${result}\n`;
            }
          }
          
          let finalOutput;
          if (capturedOutput.trim()) {
            finalOutput = capturedOutput;
          } else {
            // Check if the code has any meaningful content
            const codeLines = code.split('\n').filter(line => 
              line.trim() && 
              !line.trim().startsWith('//') && 
              !line.trim().startsWith('/*') &&
              line.trim() !== '{' &&
              line.trim() !== '}'
            );
            
            if (codeLines.length <= 2) {
              finalOutput = "⚠️ Your code appears to be empty or incomplete.\nTry adding some logic inside your function and use console.log() to see output.";
            } else {
              finalOutput = "✅ Code executed successfully!\n💡 Tip: Use console.log() to display output, or return a value from your function.";
            }
          }
          setOutput(finalOutput);
          onOutputChange?.(finalOutput, "");
        } catch (err: any) {
          const errorMsg = `Error: ${err.message}`;
          setError(errorMsg);
          onOutputChange?.("", errorMsg);
        } finally {
          // Restore original console methods
          console.log = originalLog;
          console.warn = originalWarn;
          console.error = originalError;
          setIsRunning(false);
        }
      } else if (language === "python") {
        // Python simulation for basic code patterns
        try {
          let simulatedOutput = "";
          const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          for (const line of lines) {
            if (line.startsWith('print(') && line.endsWith(')')) {
              // Extract content from print statement
              const content = line.slice(6, -1);
              try {
                // Handle string literals
                if ((content.startsWith('"') && content.endsWith('"')) || 
                    (content.startsWith("'") && content.endsWith("'"))) {
                  simulatedOutput += content.slice(1, -1) + '\n';
                } else if (!isNaN(Number(content))) {
                  // Handle numbers
                  simulatedOutput += content + '\n';
                } else {
                  // Handle variables and expressions
                  simulatedOutput += `${content} (simulated)\n`;
                }
              } catch {
                simulatedOutput += `${content}\n`;
              }
            } else if (line.includes('=')) {
              // Variable assignment
              const [varName] = line.split('=');
              simulatedOutput += `Variable '${varName.trim()}' assigned\n`;
            } else if (line.startsWith('def ')) {
              // Function definition
              const funcName = line.split('(')[0].replace('def ', '');
              simulatedOutput += `Function '${funcName}' defined\n`;
            } else if (line.startsWith('for ') || line.startsWith('while ') || line.startsWith('if ')) {
              simulatedOutput += `${line.split(' ')[0]} loop/condition detected\n`;
            }
          }
          
          setOutput(simulatedOutput || "Python code structure analyzed (simulation mode)");
        } catch (err: any) {
          setError(`Python simulation error: ${err.message}`);
        }
      } else if (language === "cpp") {
        // C++ simulation for basic patterns
        try {
          let simulatedOutput = "";
          const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          for (const line of lines) {
            if (line.includes('cout <<')) {
              // Extract content from cout statement
              const parts = line.split('cout <<')[1];
              if (parts) {
                const content = parts.replace(/;$/, '').trim();
                if (content.startsWith('"') && content.endsWith('"')) {
                  simulatedOutput += content.slice(1, -1) + '\n';
                } else {
                  simulatedOutput += `${content} (simulated)\n`;
                }
              }
            } else if (line.includes('int ') || line.includes('float ') || line.includes('double ') || line.includes('string ')) {
              const varType = line.split(' ')[0];
              const varName = line.split(' ')[1]?.split('=')[0] || 'variable';
              simulatedOutput += `${varType} variable '${varName}' declared\n`;
            } else if (line.startsWith('class ')) {
              const className = line.split(' ')[1]?.split('{')[0] || 'Class';
              simulatedOutput += `Class '${className}' defined\n`;
            } else if (line.includes('main()')) {
              simulatedOutput += "Main function detected\n";
            }
          }
          
          setOutput(simulatedOutput || "C++ code structure analyzed (simulation mode)");
        } catch (err: any) {
          setError(`C++ simulation error: ${err.message}`);
        }
      } else if (language === "java") {
        // Java simulation for basic patterns
        try {
          let simulatedOutput = "";
          const lines = code.split('\n').map(line => line.trim()).filter(line => line.length > 0);
          
          for (const line of lines) {
            if (line.includes('System.out.print')) {
              // Extract content from System.out.print statement
              const match = line.match(/System\.out\.print[ln]*\((.*?)\)/);
              if (match && match[1]) {
                const content = match[1].trim();
                if (content.startsWith('"') && content.endsWith('"')) {
                  simulatedOutput += content.slice(1, -1) + '\n';
                } else {
                  simulatedOutput += `${content} (simulated)\n`;
                }
              }
            } else if (line.includes('class ')) {
              const className = line.split('class ')[1]?.split(' ')[0]?.split('{')[0] || 'Class';
              simulatedOutput += `Class '${className}' defined\n`;
            } else if (line.includes('public static void main')) {
              simulatedOutput += "Main method detected\n";
            } else if (line.includes('int ') || line.includes('String ') || line.includes('double ') || line.includes('boolean ')) {
              const parts = line.split(' ');
              const varType = parts.find(p => ['int', 'String', 'double', 'boolean'].includes(p));
              const varName = parts[parts.indexOf(varType!) + 1]?.split('=')[0] || 'variable';
              simulatedOutput += `${varType} variable '${varName}' declared\n`;
            }
          }
          
          setOutput(simulatedOutput || "Java code structure analyzed (simulation mode)");
        } catch (err: any) {
          setError(`Java simulation error: ${err.message}`);
        }
      } else {
        setOutput(`${language} execution simulation not implemented yet.`);
      }
    } catch (err: any) {
      setError(`Execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }

  function copyCode() {
    navigator.clipboard.writeText(code);
  }

  function clearCode() {
    setCode("");
    setOutput("");
    setError("");
    setSuggestion("");
    setNextLineSuggestion("");
  }

  function refreshOutput() {
    setOutput("");
    setError("");
    setWaitingForInput(false);
    setInputHistory([]);
    setUserInput("");
    setInputPrompt("");
    onOutputChange?.("", "");
  }

  function downloadCode() {
    const extensions = { javascript: 'js', python: 'py', cpp: 'cpp', java: 'java' };
    const ext = extensions[language as keyof typeof extensions] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function formatCode() {
    if (language === 'javascript') {
      // Basic JavaScript formatting
      let formatted = code
        .replace(/;/g, ';\n')
        .replace(/\{/g, ' {\n  ')
        .replace(/\}/g, '\n}')
        .replace(/,/g, ',\n  ')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      setCode(formatted);
    } else if (language === 'python') {
      // Basic Python formatting
      let formatted = code
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      setCode(formatted);
    }
  }

  function getLineNumbers() {
    const lines = code.split('\n');
    return Array.from({ length: Math.max(lines.length, 1) }, (_, i) => i + 1);
  }

  function highlightSyntax(text: string): string {
    if (!text) return text;
    
    const patterns = {
      javascript: [
        { pattern: /\b(function|const|let|var|if|else|for|while|return|class|import|export|async|await|try|catch|finally)\b/g, className: 'syntax-keyword' },
        { pattern: /"[^"]*"|'[^']*'|`[^`]*`/g, className: 'syntax-string' },
        { pattern: /\b\d+\.?\d*\b/g, className: 'syntax-number' },
        { pattern: /\/\/.*$/gm, className: 'syntax-comment' },
        { pattern: /\/\*[\s\S]*?\*\//g, className: 'syntax-comment' },
        { pattern: /\b[a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\()/g, className: 'syntax-function' },
        { pattern: /[+\-*/%=<>!&|]+/g, className: 'syntax-operator' },
      ],
      python: [
        { pattern: /\b(def|class|if|elif|else|for|while|return|import|from|try|except|finally|with|as|lambda|yield|global|nonlocal)\b/g, className: 'syntax-keyword' },
        { pattern: /"[^"]*"|'[^']*'|"""[\s\S]*?"""|'''[\s\S]*?'''/g, className: 'syntax-string' },
        { pattern: /\b\d+\.?\d*\b/g, className: 'syntax-number' },
        { pattern: /#.*$/gm, className: 'syntax-comment' },
        { pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g, className: 'syntax-function' },
        { pattern: /[+\-*/%=<>!&|]+/g, className: 'syntax-operator' },
      ],
      cpp: [
        { pattern: /\b(int|float|double|char|bool|void|class|struct|if|else|for|while|return|include|namespace|using|template|public|private|protected)\b/g, className: 'syntax-keyword' },
        { pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string' },
        { pattern: /\b\d+\.?\d*[fFlL]?\b/g, className: 'syntax-number' },
        { pattern: /\/\/.*$/gm, className: 'syntax-comment' },
        { pattern: /\/\*[\s\S]*?\*\//g, className: 'syntax-comment' },
        { pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g, className: 'syntax-function' },
        { pattern: /[+\-*/%=<>!&|]+/g, className: 'syntax-operator' },
      ],
      java: [
        { pattern: /\b(public|private|protected|static|final|class|interface|if|else|for|while|return|import|package|try|catch|finally|throw|throws|new|this|super)\b/g, className: 'syntax-keyword' },
        { pattern: /"[^"]*"|'[^']*'/g, className: 'syntax-string' },
        { pattern: /\b\d+\.?\d*[fFlLdD]?\b/g, className: 'syntax-number' },
        { pattern: /\/\/.*$/gm, className: 'syntax-comment' },
        { pattern: /\/\*[\s\S]*?\*\//g, className: 'syntax-comment' },
        { pattern: /\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/g, className: 'syntax-function' },
        { pattern: /[+\-*/%=<>!&|]+/g, className: 'syntax-operator' },
      ]
    };

    const langPatterns = patterns[language as keyof typeof patterns] || [];
    let highlighted = text;

    langPatterns.forEach(({ pattern, className }) => {
      highlighted = highlighted.replace(pattern, `<span class="${className}">$&</span>`);
    });

    return highlighted;
  }

  useEffect(() => { 
    if (suggestion || nextLineSuggestion) track("suggestions"); 
  }, [suggestion, nextLineSuggestion]);

  const doc = COMMON_DOCS[cursorWord as keyof typeof COMMON_DOCS];

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-gradient-to-r from-primary/10 to-indigo-200/30">
        <div className="font-medium">AI Coding Assistant</div>
        <div className="text-xs text-foreground/70">Language: {language}</div>
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-secondary/20">
        <div className="flex gap-2">
          <div className="flex items-center gap-1">
            <Button onClick={runCode} disabled={isRunning || !code.trim()} size="sm" className="h-8">
              <Play className="w-3 h-3 mr-1" />
              {isRunning ? "Running..." : "Run"}
            </Button>
            {language !== 'javascript' && (
              <select 
                value={executionMode} 
                onChange={(e) => setExecutionMode(e.target.value as ExecutionMode)}
                className="text-xs border rounded px-2 py-1 bg-background"
              >
                <option value="local">Local Sim</option>
                <option value="online">Online</option>
              </select>
            )}
          </div>
          <Button onClick={copyCode} variant="outline" size="sm" className="h-8">
            <Copy className="w-3 h-3 mr-1" />Copy
          </Button>
          <Button onClick={clearCode} variant="outline" size="sm" className="h-8">
            <RotateCcw className="w-3 h-3 mr-1" />Clear
          </Button>
          {language === 'python' && (
            <Button 
              onClick={() => setCode(formatPythonCode(code))} 
              variant="outline" 
              size="sm" 
              className="h-8"
              title="Format Python code (Ctrl+Shift+F)"
            >
              <Code className="w-3 h-3 mr-1" />Format
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {executionMode === 'online' && language !== 'javascript' && (
            <Badge variant="outline" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />Online
            </Badge>
          )}
          {suggestion && <Badge variant="secondary" className="text-xs">Tab: {suggestion}</Badge>}
          {nextLineSuggestion && <Badge variant="outline" className="text-xs">Ctrl+Enter for template</Badge>}
        </div>
      </div>
      <div className={`grid gap-0 ${hideOutput ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
        <div className={`space-y-3 p-3 ${hideOutput ? '' : 'lg:col-span-2'}`}>
          <div className="code-editor-container">
            <div className="flex">
              {showLineNumbers && (
                <div className="code-line-numbers bg-secondary/30 px-2 py-3 border-r">
                  {getLineNumbers().map((num) => (
                    <div key={num} className="line-number text-right" />
                  ))}
                </div>
              )}
              <div className="relative flex-1">
                <textarea
                  ref={taRef}
                  value={code}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Start typing... Smart indentation • Tab for suggestions • Auto-closing brackets • Enter for new line"
                  className="code-editor-textarea"
                  spellCheck={false}
                  style={{
                    tabSize: language === 'python' ? 4 : 2,
                    MozTabSize: language === 'python' ? 4 : 2,
                  }}
                />
                {suggestion && (
                  <div className="code-suggestion-overlay">
                    <div className="whitespace-pre">
                      {code.split("\n").pop()}
                      <span className="text-primary/60 bg-primary/10 px-1 rounded">{suggestion}</span>
                    </div>
                  </div>
                )}
                {nextLineSuggestion && (
                  <div className="code-template-hint">
                    Template: {nextLineSuggestion.split('\n')[0]}...
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {!hideOutput && (output || error) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Output
                    {error ? (
                      <Badge variant="destructive" className="text-xs">Error</Badge>
                    ) : waitingForInput ? (
                      <Badge variant="outline" className="text-xs">Waiting for Input</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Success</Badge>
                    )}
                  </div>
                  <Button
                    onClick={refreshOutput}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    title="Clear output"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error ? (
                  <pre className="code-output code-output-error">
                    {error}
                  </pre>
                ) : (
                  <div className="space-y-3">
                    <pre className="code-output code-output-success">
                      {output}
                    </pre>
                    
                    {/* Input History Display */}
                    {inputHistory.length > 0 && (
                      <div className="border-t pt-2">
                        <div className="text-xs text-foreground/60 mb-1">Input History:</div>
                        {inputHistory.map((input, index) => (
                          <div key={index} className="text-sm font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded mb-1">
                            {input}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Input Prompt */}
                    {waitingForInput && (
                      <div className="border-t pt-3">
                        <div className="text-sm text-foreground/80 mb-2">{inputPrompt}</div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                submitInput();
                              }
                            }}
                            placeholder="Enter input value..."
                            className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                            autoFocus
                          />
                          <button
                            onClick={submitInput}
                            disabled={!userInput.trim()}
                            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50 hover:bg-primary/90 transition-colors"
                          >
                            Send
                          </button>
                        </div>
                        <div className="text-xs text-foreground/60 mt-1">
                          Press Enter to send input to your program
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        {!hideOutput && (
          <div className="border-t lg:border-l lg:border-t-0 p-3 bg-secondary/30 space-y-4">
            {doc && (
              <div>
                <h4 className="font-semibold mb-2">Inline Docs</h4>
                <p className="text-sm text-foreground/80">{doc}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
