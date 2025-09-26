import { RequestHandler } from "express";
import { questionService } from "../services/questionService";
import { trackEvent } from "./metrics";

// Get all questions
export const getAllQuestions: RequestHandler = async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let questions;
    if (category && typeof category === 'string') {
      questions = await questionService.getQuestionsByCategory(category);
    } else if (difficulty && typeof difficulty === 'string') {
      questions = await questionService.getQuestionsByDifficulty(difficulty);
    } else {
      questions = await questionService.getAllQuestions();
    }
    
    trackEvent("questions_fetched");
    res.json({ questions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
};

// Get single question by ID
export const getQuestionById: RequestHandler = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID' });
    }
    
    const question = await questionService.getQuestionById(questionId);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    trackEvent("question_viewed");
    res.json({ question });
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
};

// Create new question (Admin only)
export const createQuestion: RequestHandler = async (req, res) => {
  try {
    const questionData = req.body;
    
    // Validate required fields
    const requiredFields = ['id', 'title', 'difficulty', 'category', 'description', 'examples', 'constraints', 'hints', 'starterCode'];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    
    const question = await questionService.createQuestion({
      ...questionData,
      tags: questionData.tags || []
    });
    
    trackEvent("question_created");
    res.status(201).json({ question });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
};

// Update question (Admin only)
export const updateQuestion: RequestHandler = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID' });
    }
    
    const updates = req.body;
    const success = await questionService.updateQuestion(questionId, updates);
    
    if (!success) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    trackEvent("question_updated");
    res.json({ message: 'Question updated successfully' });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
};

// Delete question (Admin only)
export const deleteQuestion: RequestHandler = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'Invalid question ID' });
    }
    
    const success = await questionService.deleteQuestion(questionId);
    
    if (!success) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    trackEvent("question_deleted");
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
};

// Submit solution
export const submitSolution: RequestHandler = async (req, res) => {
  try {
    const questionId = parseInt(req.params.id);
    const { userId, language, code, timeSpent, isCorrect } = req.body;
    
    if (isNaN(questionId) || !userId || !language || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Add solution to user progress
    await questionService.addSolution(userId, questionId, {
      language,
      code,
      isCorrect
    });
    
    // Update user progress
    await questionService.updateUserProgress(userId, questionId, {
      status: isCorrect ? 'solved' : 'attempted',
      timeSpent: (timeSpent || 0)
    });
    
    // Update user stats if solved
    if (isCorrect) {
      const question = await questionService.getQuestionById(questionId);
      if (question) {
        await questionService.updateUserStats(userId, question.difficulty, timeSpent || 0);
      }
    }
    
    trackEvent("solution_submitted");
    res.json({ 
      message: 'Solution submitted successfully',
      status: isCorrect ? 'solved' : 'attempted'
    });
  } catch (error) {
    console.error('Error submitting solution:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
};

// Get user progress
export const getUserProgress: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const progress = await questionService.getUserProgress(userId);
    
    trackEvent("progress_fetched");
    res.json({ progress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({ error: 'Failed to fetch user progress' });
  }
};

// Get question statistics
export const getQuestionStats: RequestHandler = async (req, res) => {
  try {
    const stats = await questionService.getQuestionStats();
    
    trackEvent("stats_fetched");
    res.json({ stats });
  } catch (error) {
    console.error('Error fetching question stats:', error);
    res.status(500).json({ error: 'Failed to fetch question stats' });
  }
};

// Get leaderboard
export const getLeaderboard: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await questionService.getLeaderboard(limit);
    
    trackEvent("leaderboard_fetched");
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};
