import { spawn, execFile } from 'child_process';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import axios from 'axios';

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
      // For array problems - check if it's just an array or array with target
      if (input.includes('[')) {
        const arrayMatch = input.match(/\[([^\]]*)\]/);
        if (arrayMatch) {
          const nums = JSON.parse(arrayMatch[0]);
          
          // Check if there's a target parameter (Two Sum style)
          const parts = input.split(',');
          const hasTarget = parts.length > 1 && !arrayMatch[0].includes(parts[parts.length - 1].trim());
          
          if (hasTarget) {
            // Two Sum type problem
            const target = parseInt(parts[parts.length - 1].trim());
            if (typeof twoSum === 'function') {
              const result = twoSum(nums, target);
              actualOutput = result !== undefined ? JSON.stringify(result) : 'undefined';
              functionCalled = true;
            }
          } else {
            // Single array problems (like maxSubArray, etc.)
            if (typeof maxSubArray === 'function') {
              const result = maxSubArray(nums);
              actualOutput = result !== undefined ? result.toString() : 'undefined';
              functionCalled = true;
            } else if (typeof reverseArray === 'function') {
              const result = reverseArray(nums);
              actualOutput = result !== undefined ? JSON.stringify(result) : 'undefined';
              functionCalled = true;
            } else if (typeof maxProfit === 'function') {
              const result = maxProfit(nums);
              actualOutput = result !== undefined ? result.toString() : 'undefined';
              functionCalled = true;
            }
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
            if '[' in input_str:
                import re
                array_match = re.search(r'\[([^\]]*)\]', input_str)
                if array_match:
                    nums = json.loads(array_match.group(0))
                    
                    # Check if there's a target parameter (Two Sum style)
                    parts = input_str.split(',')
                    has_target = len(parts) > 1 and array_match.group(0) not in parts[-1].strip()
                    
                    if has_target:
                        # Two Sum type problem
                        target = int(parts[-1].strip())
                        if 'two_sum' in globals():
                            actual_output = json.dumps(two_sum(nums, target))
                    else:
                        # Single array problems
                        if 'max_sub_array' in globals():
                            actual_output = str(max_sub_array(nums))
                        elif 'reverse_array' in globals():
                            actual_output = json.dumps(reverse_array(nums))
                        elif 'max_profit' in globals():
                            actual_output = str(max_profit(nums))
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
            if (input.find('[') != string::npos) {
                // Array-based problems
                size_t start_bracket = input.find('[');
                size_t end_bracket = input.find(']');
                string array_str = input.substr(start_bracket + 1, end_bracket - start_bracket - 1);
                
                vector<int> nums;
                if (!array_str.empty()) {
                    stringstream ss(array_str);
                    string item;
                    while (getline(ss, item, ',')) {
                        nums.push_back(stoi(item));
                    }
                }
                
                // Check if there's a target value after the array
                size_t comma_pos = input.find(',', end_bracket);
                if (comma_pos != string::npos) {
                    // Two Sum type problem
                    int target = stoi(input.substr(comma_pos + 1));
                    
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
                        try {
                            int result = maxProfit(nums);
                            actualOutput = to_string(result);
                            functionCalled = true;
                        } catch (...) {
                            // Function doesn't exist or failed
                        }
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

  // Enhanced Judge Implementation with Piston API Support
  private pistonVersionCache = new Map<string, string>();

  private async getPistonVersion(lang: string): Promise<string> {
    if (lang === 'javascript' || lang === 'python') return 'latest';
    if (this.pistonVersionCache.has(lang)) return this.pistonVersionCache.get(lang)!;
    
    const envPreferred = process.env[`PISTON_${lang.toUpperCase()}_VERSION`] || null;
    if (envPreferred) { 
      this.pistonVersionCache.set(lang, envPreferred); 
      return envPreferred; 
    }
    
    try {
      const pistonUrl = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';
      const { data } = await axios.get(`${pistonUrl}/runtimes`, { timeout: 8000 });
      const targets = Array.isArray(data) ? data : [];
      
      const pick = (nameList: string[]) => {
        const list = targets.filter((r: any) => nameList.includes(String(r.language).toLowerCase()));
        if (!list.length) return null;
        list.sort((a: any, b: any) => String(b.version).localeCompare(String(a.version)));
        return list[0].version;
      };
      
      let version = null;
      if (lang === 'cpp') version = pick(['c++','cpp','gcc']);
      else if (lang === 'java') version = pick(['java']);
      else if (lang === 'rust') version = pick(['rust']);
      
      if (!version) version = 'latest';
      this.pistonVersionCache.set(lang, version);
      return version;
    } catch {
      const fallback = 'latest';
      this.pistonVersionCache.set(lang, fallback);
      return fallback;
    }
  }

  private escStr(s: string): string { 
    return String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"'); 
  }

  private isNum(x: any): x is number { 
    return typeof x === 'number' && isFinite(x); 
  }

  private isStr(x: any): x is string { 
    return typeof x === 'string'; 
  }

  private isArr(x: any): x is any[] { 
    return Array.isArray(x); 
  }

  private cppLiteral(v: any): string {
    if (this.isNum(v)) return String(Math.trunc(v));
    if (this.isStr(v)) return `"${this.escStr(v)}"`;
    if (this.isArr(v)){
      if (v.every(this.isNum)) return `{ ${v.map(x => this.cppLiteral(x)).join(', ')} }`;
      if (v.every(this.isStr)) return `{ ${v.map(x => this.cppLiteral(x)).join(', ')} }`;
    }
    return '{}';
  }

  private javaLiteral(v: any): string {
    if (this.isNum(v)) return String(Math.trunc(v));
    if (this.isStr(v)) return `"${this.escStr(v)}"`;
    if (this.isArr(v)){
      if (v.every(this.isNum)) return `new int[]{ ${v.map(x => this.javaLiteral(x)).join(', ')} }`;
      if (v.every(this.isStr)) return `java.util.Arrays.asList(${v.map(x => this.javaLiteral(x)).join(', ')})`;
    }
    return 'null';
  }

  private rustLiteral(v: any): string {
    if (this.isNum(v)) return `${Math.trunc(v)}`;
    if (this.isStr(v)) return `"${this.escStr(v)}".to_string()`;
    if (this.isArr(v)){
      if (v.every(this.isNum)) return `vec![${v.map(x => this.rustLiteral(x)).join(', ')}]`;
      if (v.every(this.isStr)) return `vec![${v.map(x => this.rustLiteral(x)).join(', ')}]`;
    }
    return `Default::default()`;
  }

  private genCppSource(userCode: string, args: any): string {
    let callExpr = '';
    let printer = 'null';
    
    // Detect function name from user code
    let functionName = 'solve';
    if (userCode.includes('maxSubArray')) functionName = 'maxSubArray';
    else if (userCode.includes('twoSum')) functionName = 'twoSum';
    else if (userCode.includes('isValid')) functionName = 'isValid';
    else if (userCode.includes('climbStairs')) functionName = 'climbStairs';
    
    if (this.isArr(args) && args.length === 2 && this.isArr(args[0]) && args[0].every(this.isNum) && this.isNum(args[1])) {
      callExpr = `${functionName}(vector<int>${this.cppLiteral(args[0])}, ${this.cppLiteral(args[1])})`;
      printer = 'vec_int';
    } else if (this.isStr(args)) {
      callExpr = `${functionName}(${this.cppLiteral(args)})`;
      printer = 'str';
    } else if (this.isNum(args)) {
      callExpr = `${functionName}(${this.cppLiteral(args)})`;
      printer = 'int';
    } else if (this.isArr(args) && args.every(this.isNum)) {
      // Single array argument (like for maxSubArray)
      callExpr = `${functionName}(vector<int>${this.cppLiteral(args)})`;
      printer = 'int';
    } else {
      callExpr = `${functionName}(${this.cppLiteral(args)})`;
      printer = 'str';
    }
    
    const src = `#include <bits/stdc++.h>
using namespace std;
${userCode}

static void json_print_vec_int(const vector<int>& a){ cout<<"["; for(size_t i=0;i<a.size();++i){ if(i) cout<<","; cout<<a[i]; } cout<<"]"; }
static void json_print_vec_str(const vector<string>& a){ cout<<"["; for(size_t i=0;i<a.size();++i){ if(i) cout<<","; cout<<"\\""; for(char c:a[i]){ if(c=='\\\\'||c=='\\"') cout<<'\\\\'; cout<<c; } cout<<"\\""; } cout<<"]"; }
static void json_print_str(const string& s){ cout<<"\\""; for(char c:s){ if(c=='\\\\'||c=='\\"') cout<<'\\\\'; cout<<c; } cout<<"\\""; }
int main(){
  try{
    auto ans = ${callExpr};
    cout<<"{\\"__result\\":";
    ${printer==='vec_int' ? 'json_print_vec_int(ans);' : printer==='vec_str' ? 'json_print_vec_str(ans);' : printer==='str' ? 'json_print_str(ans);' : printer==='int' ? 'cout<<ans;' : 'cout<<ans;'}
    cout<<"}";
  } catch(const exception& e) { cout<<"{\\"__error\\":\\""<<e.what()<<"\\"}"; } catch(...) { cout<<"{\\"__error\\":\\"Runtime Error\\"}"; }
  return 0;
}
`;
    return src;
  }

  private genJavaFiles(userCode: string, args: any): Array<{name: string, content: string}> {
    // Detect function name from user code
    let methodName = 'solve';
    if (userCode.includes('maxSubArray')) methodName = 'maxSubArray';
    else if (userCode.includes('twoSum')) methodName = 'twoSum';
    else if (userCode.includes('isValid')) methodName = 'isValid';
    else if (userCode.includes('climbStairs')) methodName = 'climbStairs';
    
    let call: string;
    if (this.isArr(args) && args.length === 2 && this.isArr(args[0]) && args[0].every(this.isNum) && this.isNum(args[1])) {
      call = `Solution.${methodName}(new int[]{ ${args[0].map((v: any) => Math.trunc(v)).join(', ')} }, ${Math.trunc(args[1])})`;
    } else if (this.isStr(args)) {
      call = `Solution.${methodName}("${this.escStr(args)}")`;
    } else if (this.isNum(args)) {
      call = `Solution.${methodName}(${Math.trunc(args)})`;
    } else if (this.isArr(args) && args.every(this.isNum)) {
      // Single array argument (like for maxSubArray)
      call = `Solution.${methodName}(new int[]{ ${args.map((v: any) => Math.trunc(v)).join(', ')} })`;
    } else {
      call = `Solution.${methodName}(null)`;
    }
    
    const main = `import java.util.*;
public class Main {
  private static void printJson(Object ans){
    StringBuilder sb=new StringBuilder();
    if(ans instanceof int[]){
      sb.append("["); int[] a=(int[])ans; for(int i=0;i<a.length;i++){ if(i>0) sb.append(","); sb.append(a[i]); } sb.append("]");
    } else if(ans instanceof java.util.List){
      sb.append("["); List<?> a=(List<?>)ans; for(int i=0;i<a.size();i++){ if(i>0) sb.append(","); Object x=a.get(i); sb.append("\\"").append(x.toString().replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"")).append("\\""); } sb.append("]");
    } else if(ans instanceof String){
      sb.append("\\"").append(((String)ans).replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"")).append("\\"");
    } else if(ans instanceof Number){ sb.append(ans.toString()); } else { sb.append("null"); }
    System.out.print("{\\"__result\\":"+sb.toString()+"}");
  }
  public static void main(String[] args){ try{ Object ans = ${call}; printJson(ans); } catch(Exception e){ System.out.print("{\\"__error\\":\\""+e.toString().replace("\\\\","\\\\\\\\").replace("\\"","\\\\\\"")+"\\"}"); } }
}`;
    
    return [
      { name: 'Solution.java', content: userCode },
      { name: 'Main.java', content: main }
    ];
  }

  private genRustSource(userCode: string, args: any): string {
    let call_expr = '';
    let expect = 'string';
    
    if (this.isArr(args) && args.length === 2 && this.isArr(args[0]) && args[0].every(this.isNum) && this.isNum(args[1])) {
      call_expr = `solve(${this.rustLiteral(args[0])}, ${this.rustLiteral(args[1])})`;
      expect = 'vec_usize';
    } else if (this.isStr(args)) {
      call_expr = `solve(${this.rustLiteral(args)})`;
      expect = 'string';
    } else if (this.isNum(args)) {
      call_expr = `solve(${this.rustLiteral(args)})`;
      expect = 'vec_string';
    } else {
      call_expr = `solve(${this.rustLiteral(args)})`;
      expect = 'string';
    }
    
    const src = `${userCode}

fn json_escape(s:&str)->String{ let mut out=String::new(); for ch in s.chars(){ if ch=='\\' || ch=='"' { out.push('\\'); } out.push(ch); } out }
fn print_json_string(s:&str){ print!("\\"{}\"", json_escape(s)); }
fn print_vec_usize(v:&Vec<usize>){ print!("["); for (i, x) in v.iter().enumerate(){ if i>0 { print!(","); } print!("{}", x); } print!("]"); }
fn print_vec_string(v:&Vec<String>){ print!("["); for (i, s) in v.iter().enumerate(){ if i>0 { print!(","); } print_json_string(s); } print!("]"); }
fn main(){
  let ans = ${call_expr};
  print!("{\\"__result\\":");
  ${expect==='vec_usize' ? 'print_vec_usize(&ans);' : expect==='vec_string' ? 'print_vec_string(&ans);' : expect==='i32' ? 'print!("{}", ans);' : 'print_json_string(&ans);'}
  print!("}}");
}
`;
    return src;
  }

  private async runPiston(params: {language: string, code: string, args: any, timeLimitMs?: number}): Promise<{result?: any, error?: string}> {
    const { language, code, args, timeLimitMs = 2000 } = params;
    const version = await this.getPistonVersion(language);
    const pistonUrl = process.env.PISTON_URL || 'https://emkc.org/api/v2/piston';
    
    const req: any = { 
      language: language === 'cpp' ? 'c++' : language, 
      version, 
      files: [], 
      compile_timeout: 10000, 
      run_timeout: Math.max(1, Math.floor(timeLimitMs/1000)) 
    };
    
    if (language === 'cpp') {
      req.files = [{ name: 'main.cpp', content: this.genCppSource(code, args) }];
    } else if (language === 'java') {
      req.files = this.genJavaFiles(code, args);
    } else if (language === 'rust') {
      req.files = [{ name: 'main.rs', content: this.genRustSource(code, args) }];
    } else {
      return { error: 'Unsupported language' };
    }
    
    try {
      const timeoutMs = Math.max(5000, timeLimitMs + 4000);
      const { data } = await axios.post(`${pistonUrl}/execute`, req, { timeout: timeoutMs });
      const out = String(data?.run?.stdout || '').trim();
      const err = String(data?.run?.stderr || data?.compile?.stderr || '').trim();
      
      if (!out) return { error: err || 'Runtime Error' };
      
      try {
        const parsed = JSON.parse(out);
        if (parsed.__error) return { error: parsed.__error };
        return { result: parsed.__result };
      } catch {
        return { error: err || 'Invalid output' };
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Piston error';
      return { error: `Piston: ${msg}` };
    }
  }

  private runNodeTest(code: string, args: any, timeLimitMs: number): Promise<{result?: any, error?: string, timeMs?: number}> {
    return new Promise((resolve) => {
      const start = Date.now();
      const script = `
        (async () => {
          try {
            const MOD = {};
            let module = { exports: MOD };
            let exports = MOD;
            ${code}

            // Helper function to create binary tree from array
            function TreeNode(val, left, right) {
                this.val = (val===undefined ? 0 : val);
                this.left = (left===undefined ? null : left);
                this.right = (right===undefined ? null : right);
            }
            
            function arrayToTree(arr) {
                if (!arr || arr.length === 0) return null;
                
                const root = new TreeNode(arr[0]);
                const queue = [root];
                let i = 1;
                
                while (queue.length > 0 && i < arr.length) {
                    const node = queue.shift();
                    
                    if (i < arr.length && arr[i] !== null) {
                        node.left = new TreeNode(arr[i]);
                        queue.push(node.left);
                    }
                    i++;
                    
                    if (i < arr.length && arr[i] !== null) {
                        node.right = new TreeNode(arr[i]);
                        queue.push(node.right);
                    }
                    i++;
                }
                
                return root;
            }
            
            // Helper functions for linked list
            function ListNode(val, next) {
                this.val = (val===undefined ? 0 : val);
                this.next = (next===undefined ? null : next);
            }
            
            function arrayToList(arr) {
                if (!arr || arr.length === 0) return null;
                
                let head = new ListNode(arr[0]);
                let current = head;
                
                for (let i = 1; i < arr.length; i++) {
                    current.next = new ListNode(arr[i]);
                    current = current.next;
                }
                
                return head;
            }
            
            function listToArray(head) {
                let result = [];
                let current = head;
                
                while (current !== null) {
                    result.push(current.val);
                    current = current.next;
                }
                
                return result;
            }
            
            function createListWithCycle(arr, cyclePos) {
                if (!arr || arr.length === 0) return null;
                
                let head = new ListNode(arr[0]);
                let current = head;
                let nodes = [head]; // Keep track of all nodes
                
                // Create the linked list and store all nodes
                for (let i = 1; i < arr.length; i++) {
                    current.next = new ListNode(arr[i]);
                    current = current.next;
                    nodes.push(current);
                }
                
                // Create the cycle by connecting the last node to the cycle position
                if (cyclePos >= 0 && cyclePos < nodes.length) {
                    current.next = nodes[cyclePos];
                }
                
                return head;
            }

            // Try to find the appropriate function
            let res = null;
            if (typeof solve === 'function') res = solve;
            else if (typeof maxSubArray === 'function') res = maxSubArray;
            else if (typeof twoSum === 'function') res = twoSum;
            else if (typeof isValid === 'function') res = isValid;
            else if (typeof climbStairs === 'function') res = climbStairs;
            else if (typeof reverseList === 'function') res = reverseList;
            else if (typeof search === 'function') res = search;
            else if (typeof maxProfit === 'function') res = maxProfit;
            else if (typeof inorderTraversal === 'function') res = inorderTraversal;
            else if (typeof merge === 'function') res = merge;
            else if (typeof hasCycle === 'function') res = hasCycle;
            else if (module && module.exports) {
              res = module.exports.solve || module.exports.maxSubArray || module.exports.twoSum || 
                    module.exports.isValid || module.exports.climbStairs || module.exports.reverseList ||
                    module.exports.search || module.exports.maxProfit || module.exports.inorderTraversal ||
                    module.exports.merge || module.exports.hasCycle;
            }
            
            if (!res) {
              console.log(JSON.stringify({ __error: 'No recognized function found. Expected one of: solve, maxSubArray, twoSum, isValid, climbStairs, reverseList, search, maxProfit, inorderTraversal, merge, hasCycle' }));
              return;
            }
            const input = ${JSON.stringify(args)};
            let processedInput = input;
            
            // Special handling for tree problems
            if (typeof inorderTraversal === 'function' && res === inorderTraversal) {
              // Convert array to binary tree for tree traversal problems
              if (Array.isArray(input) && input.length > 0 && Array.isArray(input[0])) {
                processedInput = [arrayToTree(input[0])];
              }
            }
            
            // Special handling for linked list problems
            if (typeof reverseList === 'function' && res === reverseList) {
              // Convert array to linked list for linked list problems
              if (Array.isArray(input) && input.length > 0 && Array.isArray(input[0])) {
                const linkedList = arrayToList(input[0]);
                processedInput = [linkedList];
              }
            }
            
            // Special handling for cycle detection problems
            if (typeof hasCycle === 'function' && res === hasCycle) {
              // Handle cycle detection input format
              if (Array.isArray(input) && input.length > 0) {
                if (input.length >= 2 && Array.isArray(input[0]) && typeof input[1] === 'number') {
                  // Input format: [array, cyclePosition]
                  const arr = input[0];
                  const cyclePos = input[1];
                  const linkedListWithCycle = createListWithCycle(arr, cyclePos);
                  processedInput = [linkedListWithCycle];
                } else if (Array.isArray(input[0])) {
                  // Regular array without cycle
                  const linkedList = arrayToList(input[0]);
                  processedInput = [linkedList];
                }
              }
            }
            
            const output = await res.apply(null, Array.isArray(processedInput) ? processedInput : [processedInput]);
            console.log(JSON.stringify({ __result: output }));
          } catch (e) {
            console.log(JSON.stringify({ __error: String(e && e.stack || e) }));
          }
        })();
      `;

      const child = execFile('node', ['-e', script], { timeout: timeLimitMs }, (error, stdout, stderr) => {
        const timeMs = Date.now() - start;
        if (error && (error as any).killed) {
          return resolve({ error: 'Time Limit Exceeded', timeMs });
        }
        let out;
        try {
          out = JSON.parse(stdout.trim());
        } catch (e) {
          return resolve({ error: stderr || stdout || 'Runtime Error', timeMs });
        }
        if (out.__error) return resolve({ error: out.__error, timeMs });
        return resolve({ result: out.__result, timeMs });
      });
    });
  }

  private runPythonTest(code: string, args: any, timeLimitMs: number): Promise<{result?: any, error?: string, timeMs?: number}> {
    return new Promise((resolve) => {
      const start = Date.now();
      const py = `
import json
import sys

${code}

def __main():
    try:
        args = json.loads('${JSON.stringify(args)}')
        
        # Try to find the appropriate function
        func = None
        if 'solve' in globals(): func = solve
        elif 'max_sub_array' in globals(): func = max_sub_array
        elif 'two_sum' in globals(): func = two_sum
        elif 'is_valid' in globals(): func = is_valid
        elif 'climb_stairs' in globals(): func = climb_stairs
        
        if func is None:
            print(json.dumps({"__error": "No recognized function found (solve, max_sub_array, two_sum, is_valid, climb_stairs)"}))
            return
            
        if type(args) is list:
            res = func(*args)
        else:
            res = func(args)
        print(json.dumps({"__result": res}))
    except Exception as e:
        print(json.dumps({"__error": str(e)}))

__main()
`;
      const child = execFile('python', ['-c', py], { timeout: timeLimitMs }, (error, stdout, stderr) => {
        const timeMs = Date.now() - start;
        if (error && (error as any).killed) {
          return resolve({ error: 'Time Limit Exceeded', timeMs });
        }
        let out;
        try {
          out = JSON.parse(stdout.trim());
        } catch (e) {
          return resolve({ error: stderr || stdout || 'Runtime Error', timeMs });
        }
        if (out.__error) return resolve({ error: out.__error, timeMs });
        return resolve({ result: out.__result, timeMs });
      });
    });
  }

  // Enhanced submission runner that integrates with existing TestCase interface
  async runEnhancedSubmission(params: {
    language: string, 
    code: string, 
    testCases: TestCase[], 
    timeLimitMs?: number
  }): Promise<JudgeResult> {
    const { language, code, testCases, timeLimitMs = 2000 } = params;
    const results: ExecutionResult[] = [];
    let passed = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      let testInput: any;
      
      // Parse input from string format to appropriate type
      try {
        const input = testCase.input.trim();
        
        // Handle 2D array inputs like "[[1,3],[2,6],[8,10],[15,18]]"
        if (input.startsWith('[[') && input.endsWith(']]')) {
          testInput = [JSON.parse(input)];
        }
        // Handle single array inputs like "[-2,1,-3,4,-1,2,1,-5,4]"
        else if (input.startsWith('[') && input.endsWith(']') && !input.includes('],')) {
          testInput = [JSON.parse(input)];
        } 
        // Handle Two Sum/Binary Search style inputs like "[2,7,11,15], 9"
        else if (input.includes('[') && input.includes(',') && !input.startsWith('[[')) {
          // Special handling for cycle detection format
          if (input.includes('with cycle') || input.includes('with no cycle')) {
            const arrayMatch = input.match(/\[([^\]]+)\]/);
            if (arrayMatch) {
              const nums = JSON.parse('[' + arrayMatch[1] + ']');
              if (input.includes('with no cycle')) {
                testInput = [nums, -1];
              } else {
                const cycleMatch = input.match(/position\s+(\d+)/);
                const cyclePos = cycleMatch ? parseInt(cycleMatch[1]) : -1;
                testInput = [nums, cyclePos];
              }
            }
          } else {
            const parts = input.split('],');
            if (parts.length > 1) {
              // Multiple arrays like "[3,2,0,-4] with cycle at position 1"
              const arrayPart = parts[0] + ']';
              const nums = JSON.parse(arrayPart);
              // Extract additional info (like cycle position, target, etc.)
              const remaining = parts[1].trim();
              if (remaining.includes('with cycle') || remaining.includes('with no cycle')) {
                // Extract cycle position from "with cycle at position 1" or handle "with no cycle"
                if (remaining.includes('with no cycle')) {
                  testInput = [nums, -1]; // -1 indicates no cycle
                } else {
                  const cycleMatch = remaining.match(/position\s+(\d+)/);
                  const cyclePos = cycleMatch ? parseInt(cycleMatch[1]) : -1;
                  testInput = [nums, cyclePos]; // For linked list cycle detection
                }
              } else {
                const target = parseInt(remaining.replace(/[^\d-]/g, ''));
                testInput = [nums, target];
              }
            } else {
              // Single array with target like "[2,7,11,15], 9"
              const commaIndex = input.lastIndexOf(',');
              const arrayPart = input.substring(0, commaIndex).trim();
              const targetPart = input.substring(commaIndex + 1).trim();
              
              if (arrayPart.startsWith('[') && arrayPart.endsWith(']')) {
                const nums = JSON.parse(arrayPart);
                const target = parseInt(targetPart);
                testInput = [nums, target];
              } else {
                testInput = [JSON.parse(input)];
              }
            }
          }
        }
        // Handle string inputs like '"()"'
        else if (input.startsWith('"') && input.endsWith('"')) {
          testInput = [input.slice(1, -1)];
        }
        // Handle number inputs like "5"
        else if (!isNaN(Number(input))) {
          testInput = [Number(input)];
        }
        // Handle complex inputs like "[1,null,2,3]" (tree structures)
        else if (input.includes('null')) {
          const treeArray = JSON.parse(input);
          testInput = [treeArray];
        }
        // Handle special cases like empty arrays
        else if (input === '[]') {
          testInput = [[]];
        }
        // Fallback: try to parse as JSON
        else {
          try {
            testInput = [JSON.parse(input)];
          } catch {
            testInput = [input];
          }
        }
      } catch (parseError) {
        console.error('Input parsing error:', parseError, 'for input:', testCase.input);
        // If all parsing fails, use as string
        testInput = [testCase.input];
      }

      const start = Date.now();
      let single: {result?: any, error?: string, timeMs?: number};
      
      if (language === 'javascript') {
        single = await this.runNodeTest(code, testInput, timeLimitMs);
      } else if (language === 'python') {
        single = await this.runPythonTest(code, testInput, timeLimitMs);
      } else if (language === 'cpp' || language === 'java' || language === 'rust') {
        single = await this.runPiston({ language, code, args: testInput, timeLimitMs });
        single.timeMs = Date.now() - start;
      } else {
        single = { error: 'Unsupported language' };
      }

      const expectedOutput = testCase.expectedOutput;
      let actualOutput: string;
      let isPass = false;
      
      if (single.error) {
        actualOutput = 'ERROR';
        isPass = false;
      } else {
        // Handle different output types
        if (typeof single.result === 'number') {
          actualOutput = single.result.toString();
          isPass = actualOutput === expectedOutput;
        } else if (typeof single.result === 'boolean') {
          actualOutput = single.result.toString();
          isPass = actualOutput === expectedOutput;
        } else if (Array.isArray(single.result)) {
          actualOutput = JSON.stringify(single.result);
          isPass = actualOutput === expectedOutput;
        } else if (single.result === null && expectedOutput === '[]') {
          // Handle null result for empty linked list
          actualOutput = '[]';
          isPass = true;
        } else if (single.result && typeof single.result === 'object' && 'val' in single.result) {
          // Handle linked list result - convert back to array
          const resultArray = [];
          let current = single.result;
          while (current !== null && current.val !== undefined) {
            resultArray.push(current.val);
            current = current.next;
            // Prevent infinite loops
            if (resultArray.length > 1000) break;
          }
          actualOutput = JSON.stringify(resultArray);
          isPass = actualOutput === expectedOutput;
        } else {
          actualOutput = JSON.stringify(single.result);
          isPass = actualOutput === expectedOutput;
        }
      }
      
      if (isPass) passed++;
      
      results.push({
        testCaseIndex: i,
        passed: isPass,
        actualOutput,
        expectedOutput,
        error: single.error || undefined,
        executionTime: single.timeMs || 0,
      });
    }

    return {
      success: true,
      totalTests: testCases.length,
      passedTests: passed,
      results,
    };
  }
}

export const codeExecutor = new CodeExecutor();
