import { RequestHandler } from "express";
import { execFile } from 'child_process';

export interface PythonExecutionRequest {
  code: string;
  stdin?: string;
}

export const executePythonCode: RequestHandler = async (req, res) => {
  try {
    const { code, stdin = '' } = req.body as PythonExecutionRequest;

    if (!code) {
      return res.status(400).json({ 
        error: "Missing required field: code" 
      });
    }

    // Execute Python code directly
    const result = await runPythonDirect(code, stdin);
    
    res.json({
      success: true,
      output: result.output,
      error: result.error,
      executionTime: result.timeMs,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Python execution error:', error);
    res.status(500).json({ 
      error: "Failed to execute Python code",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

async function runPythonDirect(code: string, stdin: string): Promise<{output?: string, error?: string, timeMs: number}> {
  return new Promise((resolve) => {
    const start = Date.now();
    
    // Try different Python commands
    const pythonCommands = ['python3', 'python', 'py'];
    let commandIndex = 0;
    
    const tryNextCommand = () => {
      if (commandIndex >= pythonCommands.length) {
        return resolve({ 
          error: 'Python not found. Please install Python and ensure it is in your PATH.', 
          timeMs: Date.now() - start 
        });
      }
      
      const pythonCmd = pythonCommands[commandIndex];
      commandIndex++;
      
      const child = execFile(pythonCmd, ['-c', code], { 
        timeout: 5000,
        encoding: 'utf8'
      }, (error, stdout, stderr) => {
        const timeMs = Date.now() - start;
        
        if (error) {
          if ((error as any).code === 'ENOENT') {
            // Command not found, try next one
            return tryNextCommand();
          }
          if ((error as any).killed) {
            return resolve({ error: 'Time Limit Exceeded', timeMs });
          }
          return resolve({ error: stderr || error.message, timeMs });
        }
        
        return resolve({ output: stdout || 'Code executed successfully', timeMs });
      });
      
      // Send stdin if provided
      if (stdin && child.stdin) {
        child.stdin.write(stdin);
        child.stdin.end();
      }
    };
    
    tryNextCommand();
  });
}
