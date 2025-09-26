import { RequestHandler } from "express";
import { codeExecutor, JudgeResult } from "../services/codeExecutor";
import { questionService } from "../services/questionService";

export interface SubmissionRequest {
  questionId: number;
  code: string;
  language: 'javascript' | 'python' | 'cpp' | 'java';
}

export const judgeSubmission: RequestHandler = async (req, res) => {
  try {
    const { questionId, code, language } = req.body as SubmissionRequest;

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

    // Execute code based on language
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
        // TODO: Implement Java execution
        return res.status(501).json({ error: "Java execution not yet implemented" });
      default:
        return res.status(400).json({ error: "Unsupported language" });
    }

    // Calculate submission status
    const status = judgeResult.passedTests === judgeResult.totalTests ? 'Accepted' : 'Wrong Answer';
    const accuracy = (judgeResult.passedTests / judgeResult.totalTests) * 100;

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
