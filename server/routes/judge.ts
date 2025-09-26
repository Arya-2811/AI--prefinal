import { RequestHandler } from "express";
import { codeExecutor, JudgeResult } from "../services/codeExecutor";
import { questionService } from "../services/questionService";
import { submissionService } from "../services/submissionService";

export interface SubmissionRequest {
  questionId: number;
  code: string;
  language: 'javascript' | 'python' | 'cpp' | 'java' | 'rust';
  useEnhancedJudge?: boolean;
  userId?: string; // Optional for tracking submissions
}

export const judgeSubmission: RequestHandler = async (req, res) => {
  try {
    const { questionId, code, language, useEnhancedJudge = true, userId } = req.body as SubmissionRequest;

    if (!questionId || !code || !language) {
      return res.status(400).json({ 
        error: "Missing required fields: questionId, code, language" 
      });
    }

    // Get the question and its test cases
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!question.testCases || question.testCases.length === 0) {
      return res.status(400).json({ error: "No test cases available for this question" });
    }

    let judgeResult: JudgeResult;

    // Choose execution method based on useEnhancedJudge flag
    if (useEnhancedJudge) {
      // Use enhanced judge with Piston API support
      judgeResult = await codeExecutor.runEnhancedSubmission({
        language,
        code,
        testCases: question.testCases,
        timeLimitMs: 5000 // 5 second timeout
      });
    } else {
      // Use original execution methods
      switch (language) {
        case 'javascript':
          judgeResult = await codeExecutor.executeJavaScript(code, question.testCases);
          break;
        case 'python':
          judgeResult = await codeExecutor.executePython(code, question.testCases);
          break;
        case 'cpp':
          judgeResult = await codeExecutor.executeCpp(code, question.testCases);
          break;
        case 'java':
          if (useEnhancedJudge) {
            // Enhanced judge supports Java
            judgeResult = await codeExecutor.runEnhancedSubmission({
              language,
              code,
              testCases: question.testCases,
              timeLimitMs: 5000
            });
          } else {
            return res.status(501).json({ error: "Java execution requires enhanced judge. Set useEnhancedJudge: true" });
          }
          break;
        case 'rust':
          if (useEnhancedJudge) {
            // Enhanced judge supports Rust
            judgeResult = await codeExecutor.runEnhancedSubmission({
              language,
              code,
              testCases: question.testCases,
              timeLimitMs: 5000
            });
          } else {
            return res.status(501).json({ error: "Rust execution requires enhanced judge. Set useEnhancedJudge: true" });
          }
          break;
        default:
          return res.status(400).json({ error: "Unsupported language" });
      }
    }

    // Calculate submission status
    const status = judgeResult.passedTests === judgeResult.totalTests ? 'Accepted' : 'Wrong Answer';
    const accuracy = (judgeResult.passedTests / judgeResult.totalTests) * 100;

    // Record submission if userId is provided
    let submissionId = null;
    if (userId) {
      try {
        submissionId = await submissionService.recordSubmission({
          userId,
          questionId,
          code,
          language,
          status: status as any,
          testResults: {
            totalTests: judgeResult.totalTests,
            passedTests: judgeResult.passedTests,
            results: judgeResult.results
          },
          executionTime: judgeResult.results.reduce((sum, r) => sum + r.executionTime, 0),
          score: accuracy
        });
      } catch (error) {
        console.error('Error recording submission:', error);
        // Don't fail the request if submission recording fails
      }
    }

    // Return comprehensive result
    res.json({
      status,
      accuracy: Math.round(accuracy),
      totalTests: judgeResult.totalTests,
      passedTests: judgeResult.passedTests,
      results: judgeResult.results,
      success: judgeResult.success,
      error: judgeResult.overallError,
      executionTime: judgeResult.results.reduce((sum, r) => sum + r.executionTime, 0),
      submissionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Judge submission error:', error);
    res.status(500).json({ 
      error: "Internal server error during code execution",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getSubmissionResult: RequestHandler = async (req, res) => {
  // This could be used for async submission tracking
  // For now, we'll keep it simple with synchronous execution
  res.status(501).json({ error: "Async submissions not yet implemented" });
};

// Test endpoint for enhanced judge
export const testEnhancedJudge: RequestHandler = async (req, res) => {
  try {
    const { language = 'cpp', code, testInput, expectedOutput } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: "Code is required" });
    }

    // Create a simple test case
    const testCases = [{
      input: testInput || '[2,7,11,15], 9',
      expectedOutput: expectedOutput || '[0,1]',
      explanation: 'Test case for enhanced judge'
    }];

    const result = await codeExecutor.runEnhancedSubmission({
      language,
      code,
      testCases,
      timeLimitMs: 5000
    });

    res.json({
      message: 'Enhanced judge test completed',
      result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Enhanced judge test error:', error);
    res.status(500).json({ 
      error: "Enhanced judge test failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
