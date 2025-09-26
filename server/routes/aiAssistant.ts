import { RequestHandler } from "express";
import { aiCodingAssistant } from "../services/aiCodingAssistant";
import { questionService } from "../services/questionService";

export interface AIHintRequest {
  questionId: number;
  userCode: string;
  language: string;
}

export interface CodeAnalysisRequest {
  code: string;
  language: string;
  questionType: string;
}

export interface AIFeedbackRequest {
  questionId: number;
  testResults: any[];
  code: string;
  language: string;
}

export interface CodeSuggestionsRequest {
  questionId: number;
  partialCode: string;
  language: string;
  cursorPosition: number;
}

// Get AI-powered hints for a coding problem
export const getAIHints: RequestHandler = async (req, res) => {
  try {
    const { questionId, userCode, language } = req.body as AIHintRequest;

    if (!questionId || !language) {
      return res.status(400).json({ 
        error: "Missing required fields: questionId, language" 
      });
    }

    // Get the question details
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Generate AI hints
    const hints = aiCodingAssistant.generateHints(
      question.title,
      question.description,
      userCode || '',
      language
    );

    res.json({
      success: true,
      hints,
      questionTitle: question.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI hints error:', error);
    res.status(500).json({ 
      error: "Failed to generate AI hints",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Analyze code complexity and approach
export const analyzeCode: RequestHandler = async (req, res) => {
  try {
    const { code, language, questionType } = req.body as CodeAnalysisRequest;

    if (!code || !language) {
      return res.status(400).json({ 
        error: "Missing required fields: code, language" 
      });
    }

    // Analyze the code
    const analysis = aiCodingAssistant.analyzeCode(code, language, questionType || '');

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code analysis error:', error);
    res.status(500).json({ 
      error: "Failed to analyze code",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Generate AI feedback based on test results
export const generateAIFeedback: RequestHandler = async (req, res) => {
  try {
    const { questionId, testResults, code, language } = req.body as AIFeedbackRequest;

    if (!questionId || !testResults || !code || !language) {
      return res.status(400).json({ 
        error: "Missing required fields: questionId, testResults, code, language" 
      });
    }

    // Get the question details
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Generate AI feedback
    const feedback = aiCodingAssistant.generateFeedback(
      testResults,
      code,
      language,
      question.title,
      question.description
    );

    res.json({
      success: true,
      feedback,
      questionTitle: question.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI feedback error:', error);
    res.status(500).json({ 
      error: "Failed to generate AI feedback",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get smart code suggestions
export const getCodeSuggestions: RequestHandler = async (req, res) => {
  try {
    const { questionId, partialCode, language, cursorPosition } = req.body as CodeSuggestionsRequest;

    if (!questionId || !language || cursorPosition === undefined) {
      return res.status(400).json({ 
        error: "Missing required fields: questionId, language, cursorPosition" 
      });
    }

    // Get the question details
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Generate code suggestions
    const suggestions = aiCodingAssistant.generateCodeSuggestions(
      partialCode || '',
      language,
      question.title,
      cursorPosition
    );

    res.json({
      success: true,
      suggestions,
      questionTitle: question.title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Code suggestions error:', error);
    res.status(500).json({ 
      error: "Failed to generate code suggestions",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get comprehensive AI assistance for a problem
export const getComprehensiveAssistance: RequestHandler = async (req, res) => {
  try {
    const { questionId, userCode, language, includeHints = true, includeAnalysis = true } = req.body;

    if (!questionId || !language) {
      return res.status(400).json({ 
        error: "Missing required fields: questionId, language" 
      });
    }

    // Get the question details
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const response: any = {
      success: true,
      questionTitle: question.title,
      questionDescription: question.description,
      difficulty: question.difficulty,
      category: question.category,
      timestamp: new Date().toISOString()
    };

    // Generate hints if requested
    if (includeHints) {
      response.hints = aiCodingAssistant.generateHints(
        question.title,
        question.description,
        userCode || '',
        language
      );
    }

    // Analyze code if provided and requested
    if (includeAnalysis && userCode) {
      response.analysis = aiCodingAssistant.analyzeCode(
        userCode,
        language,
        question.title
      );
    }

    // Add starter code template if no user code provided
    if (!userCode && question.starterCode && question.starterCode[language as keyof typeof question.starterCode]) {
      response.starterCode = question.starterCode[language as keyof typeof question.starterCode];
    }

    res.json(response);

  } catch (error) {
    console.error('Comprehensive assistance error:', error);
    res.status(500).json({ 
      error: "Failed to provide comprehensive assistance",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
