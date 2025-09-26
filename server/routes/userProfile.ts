import { RequestHandler } from "express";
import { questionService } from "../services/questionService";
import { trackEvent } from "./metrics";

// Get user profile
export const getUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const profile = await questionService.getUserProfile(userId);
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    trackEvent("profile_fetched");
    res.json({ profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Create user profile
export const createUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId, email, name, role } = req.body;
    
    if (!userId || !email || !name) {
      return res.status(400).json({ error: 'Missing required fields: userId, email, name' });
    }
    
    // Check if profile already exists
    const existingProfile = await questionService.getUserProfile(userId);
    if (existingProfile) {
      return res.status(409).json({ error: 'User profile already exists' });
    }
    
    const profile = await questionService.createUserProfile({
      userId,
      email,
      name,
      role: role || 'Developer',
      stats: {
        totalSolved: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        totalTimeSpent: 0,
        streak: 0,
        lastActiveDate: new Date()
      },
      preferences: {
        preferredLanguage: 'javascript',
        theme: 'light',
        notifications: true
      }
    });
    
    trackEvent("profile_created");
    res.status(201).json({ profile });
  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({ error: 'Failed to create user profile' });
  }
};

// Update user profile
export const updateUserProfile: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const success = await questionService.updateUserProfile(userId, updates);
    
    if (!success) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    trackEvent("profile_updated");
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};

// Get user dashboard data
export const getUserDashboard: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    const [profile, progress] = await Promise.all([
      questionService.getUserProfile(userId),
      questionService.getUserProgress(userId)
    ]);
    
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }
    
    // Calculate additional stats
    const recentActivity = progress
      .sort((a, b) => b.lastAttemptAt.getTime() - a.lastAttemptAt.getTime())
      .slice(0, 5);
    
    const solvedQuestions = progress.filter(p => p.status === 'solved');
    const attemptedQuestions = progress.filter(p => p.status === 'attempted');
    
    const dashboardData = {
      profile,
      stats: {
        ...profile.stats,
        totalAttempted: progress.length,
        solvedToday: solvedQuestions.filter(p => {
          const today = new Date();
          const solvedDate = new Date(p.lastAttemptAt);
          return solvedDate.toDateString() === today.toDateString();
        }).length
      },
      recentActivity,
      progressSummary: {
        solved: solvedQuestions.length,
        attempted: attemptedQuestions.length,
        total: progress.length
      }
    };
    
    trackEvent("dashboard_fetched");
    res.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch user dashboard' });
  }
};
