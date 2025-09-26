import { TestCase } from './codeExecutor';

export interface AIHint {
  type: 'approach' | 'optimization' | 'debugging' | 'explanation';
  title: string;
  content: string;
  codeExample?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface CodeAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  approach: string;
  suggestions: string[];
  potentialIssues: string[];
}

export interface AIFeedback {
  isCorrect: boolean;
  score: number;
  feedback: string;
  hints: AIHint[];
  nextSteps: string[];
}

class AICodingAssistant {
  
  // Generate hints based on the problem and current code
  generateHints(questionTitle: string, description: string, userCode: string, language: string): AIHint[] {
    const hints: AIHint[] = [];
    
    // Analyze the problem type and generate appropriate hints
    if (questionTitle.toLowerCase().includes('two sum')) {
      hints.push({
        type: 'approach',
        title: 'Hash Map Approach',
        content: 'Consider using a hash map to store numbers you\'ve seen and their indices. This allows O(1) lookup time.',
        codeExample: language === 'javascript' ? 
          'const map = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const complement = target - nums[i];\n  if (map.has(complement)) {\n    return [map.get(complement), i];\n  }\n  map.set(nums[i], i);\n}' :
          'seen = {}\nfor i, num in enumerate(nums):\n    complement = target - num\n    if complement in seen:\n        return [seen[complement], i]\n    seen[num] = i',
        difficulty: 'intermediate'
      });
    }
    
    if (questionTitle.toLowerCase().includes('valid parentheses')) {
      hints.push({
        type: 'approach',
        title: 'Stack Data Structure',
        content: 'Use a stack to keep track of opening brackets. When you encounter a closing bracket, check if it matches the most recent opening bracket.',
        codeExample: language === 'javascript' ?
          'const stack = [];\nconst pairs = { ")": "(", "}": "{", "]": "[" };\nfor (let char of s) {\n  if (char in pairs) {\n    if (stack.pop() !== pairs[char]) return false;\n  } else {\n    stack.push(char);\n  }\n}' :
          'stack = []\npairs = {")": "(", "}": "{", "]": "["}\nfor char in s:\n    if char in pairs:\n        if not stack or stack.pop() != pairs[char]:\n            return False\n    else:\n        stack.append(char)',
        difficulty: 'beginner'
      });
    }
    
    if (questionTitle.toLowerCase().includes('climbing stairs')) {
      hints.push({
        type: 'approach',
        title: 'Dynamic Programming',
        content: 'This is a classic Fibonacci-like problem. The number of ways to reach step n is the sum of ways to reach step n-1 and n-2.',
        codeExample: language === 'javascript' ?
          'if (n <= 2) return n;\nlet prev2 = 1, prev1 = 2;\nfor (let i = 3; i <= n; i++) {\n  const current = prev1 + prev2;\n  prev2 = prev1;\n  prev1 = current;\n}\nreturn prev1;' :
          'if n <= 2:\n    return n\nprev2, prev1 = 1, 2\nfor i in range(3, n + 1):\n    current = prev1 + prev2\n    prev2, prev1 = prev1, current\nreturn prev1',
        difficulty: 'intermediate'
      });
    }
    
    // Add debugging hints if code has common issues
    if (userCode && this.hasCommonIssues(userCode, language)) {
      hints.push(...this.generateDebuggingHints(userCode, language));
    }
    
    return hints;
  }
  
  // Analyze code for common issues
  private hasCommonIssues(code: string, language: string): boolean {
    const commonIssues = {
      javascript: [
        /for\s*\(\s*let\s+i\s*=\s*0\s*;\s*i\s*<\s*\w+\.length\s*;\s*i\+\+\s*\)\s*{[^}]*\w+\[i\]\s*==\s*\w+/,
        /return\s*undefined/,
        /console\.log/
      ],
      python: [
        /for\s+i\s+in\s+range\s*\(\s*len\s*\(\s*\w+\s*\)\s*\)\s*:[^:]*\w+\[i\]\s*==\s*\w+/,
        /print\s*\(/
      ]
    };
    
    const patterns = commonIssues[language as keyof typeof commonIssues] || [];
    return patterns.some(pattern => pattern.test(code));
  }
  
  // Generate debugging hints
  private generateDebuggingHints(code: string, language: string): AIHint[] {
    const hints: AIHint[] = [];
    
    if (language === 'javascript') {
      if (code.includes('console.log')) {
        hints.push({
          type: 'debugging',
          title: 'Remove Debug Statements',
          content: 'Remove console.log statements before submitting. They can affect performance and output.',
          difficulty: 'beginner'
        });
      }
      
      if (/==/.test(code) && !/===/.test(code)) {
        hints.push({
          type: 'debugging',
          title: 'Use Strict Equality',
          content: 'Consider using === instead of == for strict equality comparison to avoid type coercion issues.',
          difficulty: 'beginner'
        });
      }
    }
    
    if (language === 'python') {
      if (code.includes('print(')) {
        hints.push({
          type: 'debugging',
          title: 'Remove Print Statements',
          content: 'Remove print statements before submitting. They can affect the expected output format.',
          difficulty: 'beginner'
        });
      }
    }
    
    return hints;
  }
  
  // Analyze code complexity and approach
  analyzeCode(code: string, language: string, questionType: string): CodeAnalysis {
    let timeComplexity = 'O(n)';
    let spaceComplexity = 'O(1)';
    let approach = 'Linear scan';
    const suggestions: string[] = [];
    const potentialIssues: string[] = [];
    
    // Analyze nested loops
    const nestedLoopPattern = /for\s*\([^}]*for\s*\(/g;
    const nestedLoopMatches = code.match(nestedLoopPattern);
    if (nestedLoopMatches && nestedLoopMatches.length > 0) {
      timeComplexity = 'O(n²)';
      approach = 'Nested loop approach';
      suggestions.push('Consider if you can optimize this to O(n) using a hash map or two pointers technique.');
    }
    
    // Analyze data structures used
    if (code.includes('Map') || code.includes('Set') || code.includes('dict') || code.includes('set')) {
      spaceComplexity = 'O(n)';
      approach = 'Hash-based approach';
    }
    
    if (code.includes('sort') || code.includes('sorted')) {
      timeComplexity = 'O(n log n)';
      approach = 'Sorting-based approach';
    }
    
    // Check for potential issues
    if (language === 'javascript') {
      if (code.includes('var ')) {
        potentialIssues.push('Consider using "let" or "const" instead of "var" for better scoping.');
      }
      if (!code.includes('return') && questionType !== 'void') {
        potentialIssues.push('Make sure your function returns the expected value.');
      }
    }
    
    return {
      timeComplexity,
      spaceComplexity,
      approach,
      suggestions,
      potentialIssues
    };
  }
  
  // Generate AI feedback based on test results
  generateFeedback(
    testResults: any[], 
    code: string, 
    language: string, 
    questionTitle: string,
    description: string
  ): AIFeedback {
    const passedTests = testResults.filter(r => r.passed).length;
    const totalTests = testResults.length;
    const score = Math.round((passedTests / totalTests) * 100);
    const isCorrect = passedTests === totalTests;
    
    let feedback = '';
    const hints: AIHint[] = [];
    const nextSteps: string[] = [];
    
    if (isCorrect) {
      feedback = `🎉 Excellent! All ${totalTests} test cases passed. Your solution is working correctly.`;
      
      // Analyze for optimization opportunities
      const analysis = this.analyzeCode(code, language, questionTitle);
      if (analysis.suggestions.length > 0) {
        feedback += ` Consider these optimizations: ${analysis.suggestions.join(' ')}`;
        nextSteps.push('Try to optimize your solution for better time/space complexity');
      }
      
      nextSteps.push('Try solving similar problems to reinforce this pattern');
      nextSteps.push('Explain your solution to someone else to deepen understanding');
      
    } else {
      feedback = `${passedTests}/${totalTests} test cases passed. `;
      
      // Analyze failed test cases
      const failedTests = testResults.filter(r => !r.passed);
      if (failedTests.length > 0) {
        const firstFailed = failedTests[0];
        feedback += `Check test case ${firstFailed.testCaseIndex + 1}: expected "${firstFailed.expectedOutput}" but got "${firstFailed.actualOutput}".`;
        
        // Generate specific hints based on the failure
        if (firstFailed.actualOutput === 'undefined' || firstFailed.actualOutput === 'None') {
          hints.push({
            type: 'debugging',
            title: 'Missing Return Statement',
            content: 'Your function is not returning a value. Make sure to return the result.',
            difficulty: 'beginner'
          });
        }
        
        if (firstFailed.error) {
          hints.push({
            type: 'debugging',
            title: 'Runtime Error',
            content: `There's a runtime error in your code: ${firstFailed.error}. Check for array bounds, null references, or type mismatches.`,
            difficulty: 'intermediate'
          });
        }
      }
      
      // Add general hints for the problem
      hints.push(...this.generateHints(questionTitle, description, code, language));
      
      nextSteps.push('Debug the failing test case step by step');
      nextSteps.push('Add console.log statements to trace your logic');
      nextSteps.push('Review the problem constraints and edge cases');
    }
    
    return {
      isCorrect,
      score,
      feedback,
      hints: hints.slice(0, 3), // Limit to 3 most relevant hints
      nextSteps
    };
  }
  
  // Generate smart code suggestions based on context
  generateCodeSuggestions(
    partialCode: string, 
    language: string, 
    questionTitle: string,
    cursorPosition: number
  ): string[] {
    const suggestions: string[] = [];
    const currentLine = this.getCurrentLine(partialCode, cursorPosition);
    
    // Context-aware suggestions based on problem type
    if (questionTitle.toLowerCase().includes('two sum')) {
      if (currentLine.includes('for') && !partialCode.includes('Map')) {
        suggestions.push('const map = new Map();');
        suggestions.push('const complement = target - nums[i];');
      }
    }
    
    if (questionTitle.toLowerCase().includes('valid parentheses')) {
      if (!partialCode.includes('stack')) {
        suggestions.push('const stack = [];');
        suggestions.push('const pairs = { ")": "(", "}": "{", "]": "[" };');
      }
    }
    
    // Language-specific common patterns
    if (language === 'javascript') {
      if (currentLine.includes('for') && !currentLine.includes('let')) {
        suggestions.push('for (let i = 0; i < nums.length; i++)');
      }
      if (currentLine.includes('if') && !partialCode.includes('return')) {
        suggestions.push('return [i, j];');
      }
    }
    
    return suggestions.slice(0, 5); // Limit to 5 suggestions
  }
  
  private getCurrentLine(code: string, position: number): string {
    const lines = code.substring(0, position).split('\n');
    return lines[lines.length - 1] || '';
  }
}

export const aiCodingAssistant = new AICodingAssistant();
