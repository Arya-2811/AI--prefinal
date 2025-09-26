import { useState, useEffect } from "react";
import { CheckCircle, Clock, ArrowLeft, Play, Copy, RotateCcw, MessageCircle, Bot } from "lucide-react";
import AIEditor from "@/features/ai-coding/AIEditor";
import ChatbotWidget from "@/features/ai-chatbot/ChatbotWidget";

interface CodingQuestion {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  testCases?: {
    input: string;
    expectedOutput: string;
    explanation: string;
  }[];
}

// Questions will be fetched from the API

export default function CodingPractice() {
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | null>(null);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [solvedQuestions, setSolvedQuestions] = useState<Set<number>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [testResults, setTestResults] = useState<{[key: number]: 'passed' | 'failed' | 'pending'}>({});
  const [currentCode, setCurrentCode] = useState<string>('');
  const [editorOutput, setEditorOutput] = useState<string>('');
  const [editorError, setEditorError] = useState<string>('');
  const [isCodeRunning, setIsCodeRunning] = useState<boolean>(false);

  useEffect(() => {
    document.title = "Coding Practice - AI Coding Platform";
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/questions');
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTestCaseStyle = (index: number) => {
    const status = testResults[index];
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-100';
    }
  };

  const getTestCaseStatusIcon = (index: number) => {
    const status = testResults[index];
    switch (status) {
      case 'passed':
        return <span className="text-green-600">✓</span>;
      case 'failed':
        return <span className="text-red-600">✗</span>;
      default:
        return <span className="text-gray-400">○</span>;
    }
  };

  const runTestCases = async () => {
    if (!selectedQuestion?.testCases) return;
    
    // Check if there's any actual code written
    if (!currentCode || currentCode.trim() === selectedQuestion.starterCode[language]?.trim()) {
      alert('Please write some code before running tests!');
      return;
    }
    
    try {
      setTestResults({}); // Reset results
      
      const response = await fetch('/api/judge/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: selectedQuestion.id,
          code: currentCode,
          language: language
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Convert judge results to our format
      const newResults: {[key: number]: 'passed' | 'failed' | 'pending'} = {};
      result.results.forEach((testResult: any) => {
        newResults[testResult.testCaseIndex] = testResult.passed ? 'passed' : 'failed';
      });
      
      setTestResults(newResults);
      
      // Show overall result
      if (result.status === 'Accepted') {
        alert(`✅ All tests passed! (${result.passedTests}/${result.totalTests})`);
      } else {
        alert(`❌ ${result.passedTests}/${result.totalTests} tests passed`);
      }
      
    } catch (error) {
      console.error('Error running tests:', error);
      alert('Error running tests. Please try again.');
    }
  };

  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedQuestion(null);
                setTestResults({}); // Reset test results when going back
              }}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Problem Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold">{selectedQuestion.id}. {selectedQuestion.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  {selectedQuestion.category}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedQuestion.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Examples</h3>
                  {selectedQuestion.examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                      {example.explanation && <div><strong>Explanation:</strong> {example.explanation}</div>}
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Constraints</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedQuestion.constraints.map((constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Hints</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedQuestion.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Solution</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
              
              {/* Code Editor and Output Split Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-96">
                {/* Code Editor - Left Side */}
                <div className="h-full">
                  <AIEditor 
                    language={language} 
                    initialCode={selectedQuestion.starterCode[language]}
                    onCodeChange={setCurrentCode}
                    onOutputChange={(output, error) => {
                      setEditorOutput(output);
                      setEditorError(error);
                      setIsCodeRunning(output === "Running your code...");
                    }}
                    hideOutput={true}
                  />
                </div>
                
                {/* Output Panel - Right Side */}
                <div className="h-full border rounded-lg bg-gray-50 flex flex-col">
                  <div className="flex items-center justify-between p-3 border-b bg-white rounded-t-lg">
                    <h4 className="font-semibold text-gray-700">Output</h4>
                    <span className="text-xs text-gray-500">Run your code to see results</span>
                  </div>
                  <div className="flex-1 p-4 overflow-auto">
                    {editorError ? (
                      <div className="text-sm">
                        <div className="mb-2 flex items-center">
                          <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                          <span className="text-red-700 font-medium">Error</span>
                        </div>
                        <pre className="text-red-600 bg-red-50 p-3 rounded text-xs overflow-auto whitespace-pre-wrap">
                          {editorError}
                        </pre>
                      </div>
                    ) : isCodeRunning ? (
                      <div className="text-sm">
                        <div className="mb-2 flex items-center">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                          <span className="text-blue-700 font-medium">Running</span>
                        </div>
                        <div className="text-blue-600 bg-blue-50 p-3 rounded text-xs">
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                            Executing your code...
                          </div>
                        </div>
                      </div>
                    ) : editorOutput ? (
                      <div className="text-sm">
                        <div className="mb-2 flex items-center">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          <span className="text-green-700 font-medium">Success</span>
                        </div>
                        <pre className="text-gray-700 bg-green-50 p-3 rounded text-xs overflow-auto whitespace-pre-wrap">
                          {editorOutput}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-600">
                        <div className="mb-2">
                          <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                          Ready to run your code
                        </div>
                        <div className="text-xs text-gray-400">
                          Click the "Run" button in the editor to execute your solution and see the output here.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">💡 Instructions</h4>
                <p className="text-sm text-blue-700">
                  The starter code is already loaded in the editor above. Simply implement the solution 
                  in the designated area marked with "// Your code here" comments. 
                  You can run your code using the Run button to test it.
                </p>
              </div>

              {/* Test Cases */}
              {selectedQuestion.testCases && selectedQuestion.testCases.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-800">🧪 Test Cases</h4>
                    <button
                      onClick={runTestCases}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm hover:bg-primary/90 transition-colors"
                    >
                      Run Tests
                    </button>
                  </div>
                  <div className="space-y-3">
                    {selectedQuestion.testCases.map((testCase, index) => (
                      <div key={index} className={`p-3 rounded border ${getTestCaseStyle(index)}`}>
                        <div className="text-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-700">Test Case {index + 1}</span>
                            {getTestCaseStatusIcon(index)}
                          </div>
                          <div className="mb-1">
                            <span className="font-medium text-gray-700">Input:</span>
                            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{testCase.input}</code>
                          </div>
                          <div className="mb-1">
                            <span className="font-medium text-gray-700">Expected Output:</span>
                            <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">{testCase.expectedOutput}</code>
                          </div>
                          {testResults[index] === 'failed' && (
                            <div className="mb-1">
                              <span className="font-medium text-red-700">Actual Output:</span>
                              <code className="ml-2 px-2 py-1 bg-red-100 rounded text-xs">
                                {/* This would show the actual output from the judge result */}
                                Check console for details
                              </code>
                            </div>
                          )}
                          <div className="text-gray-600 text-xs">{testCase.explanation}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Floating AI Assistant Button */}
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          title="AI Coding Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>

        {/* Conditional Chatbot Widget */}
        {showChatbot && (
          <div className="fixed bottom-20 right-6 z-50">
            <div className="bg-white rounded-lg shadow-2xl border max-w-sm w-80">
              <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold">AI Coding Assistant</span>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-1 rounded"
                >
                  ×
                </button>
              </div>
              <div className="h-80">
                <ChatbotWidget 
                  context={`You are helping with ${language} programming. When providing code examples or explanations, use ${language} syntax and conventions. Current question: ${selectedQuestion?.title || 'coding practice'}`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Coding Practice</h1>
          <p className="text-xl text-gray-600">Master algorithms with 20+ curated problems</p>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={fetchQuestions}
              className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        )}

        {/* Questions Grid */}
        {!loading && !error && (
          <>
            {/* Category Filter */}
            <div className="mb-6 flex justify-center">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border rounded-lg px-4 py-2 bg-white"
              >
                <option value="">All Categories</option>
                {[...new Set(questions.map(q => q.category))].map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filterCategory ? questions.filter(q => q.category === filterCategory) : questions).map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedQuestion(question);
                setTestResults({}); // Reset test results when selecting new question
              }}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">#{question.id}</span>
                  {solvedQuestions.has(question.id) && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {question.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3">{question.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">~15 min</span>
                  </div>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Solve →
                  </button>
                </div>
              </div>
            </div>
              ))}
            </div>
          </>
        )}
        
        {/* Floating AI Assistant Button */}
        <button
          onClick={() => setShowChatbot(!showChatbot)}
          className="fixed bottom-6 right-6 bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 z-50"
          title="AI Coding Assistant"
        >
          <Bot className="w-6 h-6" />
        </button>

        {/* Conditional Chatbot Widget */}
        {showChatbot && (
          <div className="fixed bottom-20 right-6 z-50">
            <div className="bg-white rounded-lg shadow-2xl border max-w-sm w-80">
              <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  <span className="font-semibold">AI Coding Assistant</span>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-1 rounded"
                >
                  ×
                </button>
              </div>
              <div className="h-80">
                <ChatbotWidget 
                  context={`You are helping with coding practice questions. When providing code examples or explanations, prefer ${language} syntax and conventions when relevant.`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
