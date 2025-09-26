import { spawn } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation: string;
}

export interface ExecutionResult {
  testCaseIndex: number;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  error?: string;
  executionTime: number;
}

export interface JudgeResult {
  success: boolean;
  totalTests: number;
  passedTests: number;
  results: ExecutionResult[];
  overallError?: string;
}

class CodeExecutor {
  private tempDir: string;

  constructor() {
    this.tempDir = join(tmpdir(), 'coding-judge');
  }

  async ensureTempDir() {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }
  }

  // JavaScript execution
  async executeJavaScript(code: string, testCases: TestCase[]): Promise<JudgeResult> {
    await this.ensureTempDir();
    const fileName = `solution_${Date.now()}.js`;
    const filePath = join(this.tempDir, fileName);

    try {
      // Prepare the code with test execution
      const wrappedCode = this.wrapJavaScriptCode(code, testCases);
      await writeFile(filePath, wrappedCode);

      const result = await this.runNodeProcess(filePath);
      await unlink(filePath);

      return this.parseJudgeOutput(result, testCases);
    } catch (error) {
      return {
        success: false,
        totalTests: testCases.length,
        passedTests: 0,
        results: [],
        overallError: `Execution error: ${error}`
      };
    }
  }

  // Python execution
  async executePython(code: string, testCases: TestCase[]): Promise<JudgeResult> {
    await this.ensureTempDir();
    const fileName = `solution_${Date.now()}.py`;
    const filePath = join(this.tempDir, fileName);

    try {
      const wrappedCode = this.wrapPythonCode(code, testCases);
      await writeFile(filePath, wrappedCode);

      const result = await this.runPythonProcess(filePath);
      await unlink(filePath);

      return this.parseJudgeOutput(result, testCases);
    } catch (error) {
      return {
        success: false,
        totalTests: testCases.length,
        passedTests: 0,
        results: [],
        overallError: `Execution error: ${error}`
      };
    }
  }

  // C++ execution
  async executeCpp(code: string, testCases: TestCase[]): Promise<JudgeResult> {
    await this.ensureTempDir();
    const fileName = `solution_${Date.now()}.cpp`;
    const filePath = join(this.tempDir, fileName);
    const executablePath = join(this.tempDir, `solution_${Date.now()}.exe`);

    try {
      const wrappedCode = this.wrapCppCode(code, testCases);
      await writeFile(filePath, wrappedCode);

      // Compile the C++ code
      await this.compileCppCode(filePath, executablePath);

      // Execute the compiled binary
      const result = await this.runCppProcess(executablePath);
      
      // Clean up files
      await unlink(filePath);
      try {
        await unlink(executablePath);
      } catch (e) {
        // Ignore cleanup errors
      }

      return this.parseJudgeOutput(result, testCases);
    } catch (error) {
      return {
        success: false,
        totalTests: testCases.length,
        passedTests: 0,
        results: [],
        overallError: `Execution error: ${error}`
      };
    }
  }

  private wrapJavaScriptCode(userCode: string, testCases: TestCase[]): string {
    return `
${userCode}

// Test execution
const testCases = ${JSON.stringify(testCases)};
const results = [];

testCases.forEach((testCase, index) => {
  try {
    const startTime = Date.now();
    
    // Parse input parameters
    const input = testCase.input;
    let actualOutput = 'undefined';
    let functionCalled = false;
    
    // Try to execute the function with parsed input
    try {
      // For Two Sum type problems
      if (input.includes('[') && input.includes(',')) {
        const parts = input.split(',');
        if (parts.length >= 2) {
          const arrayPart = input.substring(input.indexOf('['), input.indexOf(']') + 1);
          const nums = JSON.parse(arrayPart);
          const target = parseInt(parts[parts.length - 1].trim());
          
          if (typeof twoSum === 'function') {
            const result = twoSum(nums, target);
            actualOutput = result !== undefined ? JSON.stringify(result) : 'undefined';
            functionCalled = true;
          } else if (typeof maxSubArray === 'function') {
            const result = maxSubArray(nums);
            actualOutput = result !== undefined ? result.toString() : 'undefined';
            functionCalled = true;
          }
        }
      }
      // For string problems
      else if (input.includes('"')) {
        const str = input.match(/"([^"]*)"/)[1];
        if (typeof isValid === 'function') {
          const result = isValid(str);
          actualOutput = result !== undefined ? result.toString() : 'undefined';
          functionCalled = true;
        }
      }
      // For number problems
      else {
        const num = parseInt(input);
        if (typeof climbStairs === 'function') {
          const result = climbStairs(num);
          actualOutput = result !== undefined ? result.toString() : 'undefined';
          functionCalled = true;
        }
      }
      
      // If no function was called, it means the function doesn't exist or wasn't recognized
      if (!functionCalled) {
        actualOutput = 'ERROR: Function not found or not implemented';
      }
      
    } catch (execError) {
      actualOutput = 'ERROR: ' + execError.message;
    }
    
    const executionTime = Date.now() - startTime;
    const passed = actualOutput === testCase.expectedOutput;
    
    results.push({
      testCaseIndex: index,
      passed,
      actualOutput,
      expectedOutput: testCase.expectedOutput,
      executionTime
    });
    
  } catch (error) {
    results.push({
      testCaseIndex: index,
      passed: false,
      actualOutput: 'ERROR: ' + error.message,
      expectedOutput: testCase.expectedOutput,
      error: error.message,
      executionTime: 0
    });
  }
});

console.log('JUDGE_RESULT:' + JSON.stringify(results));
`;
  }

  private wrapPythonCode(userCode: string, testCases: TestCase[]): string {
    return `
import json
import time

${userCode}

# Test execution
test_cases = ${JSON.stringify(testCases)}
results = []

for index, test_case in enumerate(test_cases):
    try:
        start_time = time.time()
        input_str = test_case['input']
        actual_output = None
        
        # Parse input and execute function
        try:
            if '[' in input_str and ',' in input_str:
                parts = input_str.split(',')
                if len(parts) >= 2:
                    array_part = input_str[input_str.index('['):input_str.index(']') + 1]
                    nums = json.loads(array_part)
                    target = int(parts[-1].strip())
                    
                    if 'two_sum' in globals():
                        actual_output = json.dumps(two_sum(nums, target))
                    elif 'max_sub_array' in globals():
                        actual_output = str(max_sub_array(nums))
            elif '"' in input_str:
                import re
                str_match = re.search(r'"([^"]*)"', input_str)
                if str_match:
                    s = str_match.group(1)
                    if 'is_valid' in globals():
                        actual_output = str(is_valid(s)).lower()
            else:
                num = int(input_str)
                if 'climb_stairs' in globals():
                    actual_output = str(climb_stairs(num))
        except Exception as exec_error:
            actual_output = f'ERROR: {str(exec_error)}'
        
        execution_time = (time.time() - start_time) * 1000
        passed = actual_output == test_case['expectedOutput']
        
        results.append({
            'testCaseIndex': index,
            'passed': passed,
            'actualOutput': actual_output or 'None',
            'expectedOutput': test_case['expectedOutput'],
            'executionTime': execution_time
        })
        
    except Exception as error:
        results.append({
            'testCaseIndex': index,
            'passed': False,
            'actualOutput': 'ERROR',
            'expectedOutput': test_case['expectedOutput'],
            'error': str(error),
            'executionTime': 0
        })

print('JUDGE_RESULT:' + json.dumps(results))
`;
  }

  private wrapCppCode(userCode: string, testCases: TestCase[]): string {
    return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <climits>
#include <stack>
#include <chrono>
using namespace std;

${userCode}

int main() {
    vector<string> testInputs = {${testCases.map(tc => `"${tc.input.replace(/"/g, '\\"')}"`).join(', ')}};
    vector<string> expectedOutputs = {${testCases.map(tc => `"${tc.expectedOutput.replace(/"/g, '\\"')}"`).join(', ')}};
    
    cout << "JUDGE_RESULT:[";
    
    for (int i = 0; i < testInputs.size(); i++) {
        auto start = chrono::high_resolution_clock::now();
        string actualOutput = "undefined";
        bool functionCalled = false;
        
        try {
            string input = testInputs[i];
            
            // Parse input for different problem types
            if (input.find('[') != string::npos && input.find(',') != string::npos) {
                // Array-based problems
                size_t start_bracket = input.find('[');
                size_t end_bracket = input.find(']');
                string array_str = input.substr(start_bracket + 1, end_bracket - start_bracket - 1);
                
                vector<int> nums;
                stringstream ss(array_str);
                string item;
                while (getline(ss, item, ',')) {
                    nums.push_back(stoi(item));
                }
                
                // Check if there's a target value after the array
                size_t comma_pos = input.find(',', end_bracket);
                if (comma_pos != string::npos) {
                    int target = stoi(input.substr(comma_pos + 1));
                    
                    // Try twoSum function
                    try {
                        vector<int> result = twoSum(nums, target);
                        actualOutput = "[" + to_string(result[0]) + "," + to_string(result[1]) + "]";
                        functionCalled = true;
                    } catch (...) {
                        // Function doesn't exist or failed
                    }
                } else {
                    // Single array problems
                    try {
                        int result = maxSubArray(nums);
                        actualOutput = to_string(result);
                        functionCalled = true;
                    } catch (...) {
                        // Function doesn't exist or failed
                    }
                }
            }
            // String problems
            else if (input.find('"') != string::npos) {
                size_t start_quote = input.find('"');
                size_t end_quote = input.find('"', start_quote + 1);
                string str = input.substr(start_quote + 1, end_quote - start_quote - 1);
                
                try {
                    bool result = isValid(str);
                    actualOutput = result ? "true" : "false";
                    functionCalled = true;
                } catch (...) {
                    // Function doesn't exist or failed
                }
            }
            // Number problems
            else {
                int num = stoi(input);
                try {
                    int result = climbStairs(num);
                    actualOutput = to_string(result);
                    functionCalled = true;
                } catch (...) {
                    // Function doesn't exist or failed
                }
            }
            
            if (!functionCalled) {
                actualOutput = "ERROR: Function not found or not implemented";
            }
            
        } catch (...) {
            actualOutput = "ERROR: Runtime error";
        }
        
        auto end = chrono::high_resolution_clock::now();
        auto duration = chrono::duration_cast<chrono::milliseconds>(end - start);
        
        bool passed = (actualOutput == expectedOutputs[i]);
        
        cout << "{";
        cout << "\\"testCaseIndex\\":" << i << ",";
        cout << "\\"passed\\":" << (passed ? "true" : "false") << ",";
        cout << "\\"actualOutput\\":\\"" << actualOutput << "\\",";
        cout << "\\"expectedOutput\\":\\"" << expectedOutputs[i] << "\\",";
        cout << "\\"executionTime\\":" << duration.count();
        cout << "}";
        
        if (i < testInputs.size() - 1) cout << ",";
    }
    
    cout << "]" << endl;
    return 0;
}
`;
  }

  private async runNodeProcess(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('node', [filePath], {
        timeout: 10000, // 10 second timeout
        cwd: this.tempDir
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async runPythonProcess(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('python', [filePath], {
        timeout: 10000, // 10 second timeout
        cwd: this.tempDir
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async compileCppCode(sourceFile: string, outputFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const process = spawn('g++', ['-o', outputFile, sourceFile, '-std=c++17'], {
        timeout: 15000, // 15 second timeout for compilation
        cwd: this.tempDir
      });

      let errorOutput = '';

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Compilation failed: ${errorOutput || `Process exited with code ${code}`}`));
        }
      });

      process.on('error', (error) => {
        reject(new Error(`Compilation error: ${error.message}`));
      });
    });
  }

  private async runCppProcess(executablePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn(executablePath, [], {
        timeout: 10000, // 10 second timeout
        cwd: this.tempDir
      });

      let output = '';
      let errorOutput = '';

      process.stdout.on('data', (data) => {
        output += data.toString();
      });

      process.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      process.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(errorOutput || `Process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        reject(error);
      });
    });
  }

  private parseJudgeOutput(output: string, testCases: TestCase[]): JudgeResult {
    try {
      const judgeResultMatch = output.match(/JUDGE_RESULT:(.+)/);
      if (!judgeResultMatch) {
        throw new Error('No judge result found in output');
      }

      const results: ExecutionResult[] = JSON.parse(judgeResultMatch[1]);
      const passedTests = results.filter(r => r.passed).length;

      return {
        success: true,
        totalTests: testCases.length,
        passedTests,
        results
      };
    } catch (error) {
      return {
        success: false,
        totalTests: testCases.length,
        passedTests: 0,
        results: [],
        overallError: `Failed to parse results: ${error}`
      };
    }
  }
}

export const codeExecutor = new CodeExecutor();
