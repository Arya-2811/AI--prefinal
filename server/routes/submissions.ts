import { RequestHandler } from "express";
import { submissionService } from "../services/submissionService";
import { questionService } from "../services/questionService";

export interface SubmissionRequest {
  userId: string;
  questionId: number;
  code: string;
  language: string;
  testResults: any;
  executionTime: number;
  status: string;
  score: number;
  feedback?: any;
}

// Record a new submission
export const recordSubmission: RequestHandler = async (req, res) => {
  try {
    const submissionData = req.body as SubmissionRequest;

    if (!submissionData.userId || !submissionData.questionId || !submissionData.code) {
      return res.status(400).json({ 
        error: "Missing required fields: userId, questionId, code" 
      });
    }

    // Validate question exists
    const question = await questionService.getQuestionById(submissionData.questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const submissionId = await submissionService.recordSubmission({
      userId: submissionData.userId,
      questionId: submissionData.questionId,
      code: submissionData.code,
      language: submissionData.language,
      status: submissionData.status as any,
      testResults: submissionData.testResults,
      executionTime: submissionData.executionTime,
      score: submissionData.score,
      feedback: submissionData.feedback
    });

    res.json({
      success: true,
      submissionId,
      message: "Submission recorded successfully",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Record submission error:', error);
    res.status(500).json({ 
      error: "Failed to record submission",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get submission by ID
export const getSubmission: RequestHandler = async (req, res) => {
  try {
    const { submissionId } = req.params;

    if (!submissionId) {
      return res.status(400).json({ error: "Submission ID is required" });
    }

    const submission = await submissionService.getSubmissionById(submissionId);
    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json({
      success: true,
      submission,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ 
      error: "Failed to get submission",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get user's submissions
export const getUserSubmissions: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const { questionId, limit = 20 } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const submissions = await submissionService.getUserSubmissions(
      userId,
      questionId ? parseInt(questionId as string) : undefined,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      submissions,
      count: submissions.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ 
      error: "Failed to get user submissions",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get question statistics
export const getQuestionStats: RequestHandler = async (req, res) => {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({ error: "Question ID is required" });
    }

    const stats = await submissionService.getQuestionStats(parseInt(questionId));

    res.json({
      success: true,
      stats,
      questionId: parseInt(questionId),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get question stats error:', error);
    res.status(500).json({ 
      error: "Failed to get question statistics",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get user progress
export const getUserProgress: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const progress = await submissionService.getUserProgress(userId);

    res.json({
      success: true,
      progress,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get user progress error:', error);
    res.status(500).json({ 
      error: "Failed to get user progress",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get leaderboard
export const getLeaderboard: RequestHandler = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const leaderboard = await submissionService.getLeaderboard(parseInt(limit as string));

    res.json({
      success: true,
      leaderboard,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      error: "Failed to get leaderboard",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Get user's best submission for a question
export const getBestSubmission: RequestHandler = async (req, res) => {
  try {
    const { userId, questionId } = req.params;

    if (!userId || !questionId) {
      return res.status(400).json({ error: "User ID and Question ID are required" });
    }

    const bestSubmission = await submissionService.getBestSubmission(
      userId,
      parseInt(questionId)
    );

    res.json({
      success: true,
      bestSubmission,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get best submission error:', error);
    res.status(500).json({ 
      error: "Failed to get best submission",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

// Admin: Cleanup old submissions
export const cleanupSubmissions: RequestHandler = async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;

    const deletedCount = await submissionService.cleanupOldSubmissions(daysOld);

    res.json({
      success: true,
      deletedCount,
      message: `Cleaned up ${deletedCount} old submissions`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Cleanup submissions error:', error);
    res.status(500).json({ 
      error: "Failed to cleanup submissions",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
