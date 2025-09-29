import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { signup, login, me, logout, listUsers, updateRole } from "./routes/auth";
import { chat } from "./routes/chat";
import { listSnippets, createSnippet } from "./routes/snippets";
import { listTemplates, createTemplate, updateTemplate } from "./routes/knowledge";
import { track, summary } from "./routes/metrics";
import { 
  getAllQuestions, 
  getQuestionById, 
  createQuestion, 
  updateQuestion, 
  deleteQuestion,
  submitSolution,
  getUserProgress,
  getQuestionStats,
  getLeaderboard
} from "./routes/questions";
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile, 
  getUserDashboard 
} from "./routes/userProfile";
import { getUserStats, cleanupSessions } from "./routes/userStats";
import { judgeSubmission, getSubmissionResult, testEnhancedJudge } from "./routes/judge";
import { 
  getAIHints, 
  analyzeCode, 
  generateAIFeedback, 
  getCodeSuggestions, 
  getComprehensiveAssistance 
} from "./routes/aiAssistant";
import { executePythonCode } from "./routes/pythonExecutor";
import {
  recordSubmission,
  getSubmission,
  getUserSubmissions,
  getQuestionStats as getSubmissionQuestionStats,
  getUserProgress as getSubmissionUserProgress,
  getLeaderboard as getSubmissionLeaderboard,
  getBestSubmission,
  cleanupSubmissions
} from "./routes/submissions";
import { connectToDatabase } from "./config/database";

export function createServer() {
  const app = express();

  // CORS Configuration for production deployment
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.FRONTEND_URL || 'https://your-deployed-site.netlify.app',
          // Add other allowed origins here
        ]
      : true, // Allow all origins in development
    credentials: true, // Allow cookies and auth headers
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  };

  // Middleware
  app.use(cors(corsOptions));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Healthcheck
  app.get("/health", (_req, res) => res.json({ ok: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);
  app.get("/api/auth/me", me);
  app.get("/api/users", listUsers);
  app.post("/api/users/role", updateRole);

  // Snippets
  app.get("/api/snippets", listSnippets);
  app.post("/api/snippets", createSnippet);

  // Knowledge
  app.get("/api/knowledge", listTemplates);
  app.post("/api/knowledge", createTemplate);
  app.put("/api/knowledge/:id", updateTemplate);

  // Chatbot
  app.post("/api/chat", chat);

  // Analytics
  app.post("/api/analytics/track", track);
  app.get("/api/analytics/summary", summary);

  // Questions API
  app.get("/api/questions", getAllQuestions);
  app.get("/api/questions/stats", getQuestionStats);
  app.get("/api/questions/:id", getQuestionById);
  app.post("/api/questions", createQuestion);
  app.put("/api/questions/:id", updateQuestion);
  app.delete("/api/questions/:id", deleteQuestion);
  app.post("/api/questions/:id/submit", submitSolution);
  
  // User Progress API
  app.get("/api/progress", getUserProgress);
  app.get("/api/leaderboard", getLeaderboard);
  
  // User Profile API
  app.get("/api/profile/:userId", getUserProfile);
  app.post("/api/profile", createUserProfile);
  app.put("/api/profile/:userId", updateUserProfile);
  app.get("/api/dashboard/:userId", getUserDashboard);
  
  // User Statistics API (Admin only)
  app.get("/api/admin/user-stats", getUserStats);
  app.post("/api/admin/cleanup-sessions", cleanupSessions);
  
  // Online Judge API
  app.post("/api/judge/submit", judgeSubmission);
  app.get("/api/judge/result/:id", getSubmissionResult);
  app.post("/api/judge/test-enhanced", testEnhancedJudge);
  
  // AI Assistant API
  app.post("/api/ai/hints", getAIHints);
  app.post("/api/ai/analyze", analyzeCode);
  app.post("/api/ai/feedback", generateAIFeedback);
  app.post("/api/ai/suggestions", getCodeSuggestions);
  app.post("/api/ai/assistance", getComprehensiveAssistance);
  
  // Python Executor API
  app.post("/api/python/execute", executePythonCode);
  
  // Submissions API
  app.post("/api/submissions", recordSubmission);
  app.get("/api/submissions/:submissionId", getSubmission);
  app.get("/api/submissions/user/:userId", getUserSubmissions);
  app.get("/api/submissions/question/:questionId/stats", getSubmissionQuestionStats);
  app.get("/api/submissions/user/:userId/progress", getSubmissionUserProgress);
  app.get("/api/submissions/leaderboard", getSubmissionLeaderboard);
  app.get("/api/submissions/user/:userId/question/:questionId/best", getBestSubmission);
  app.post("/api/admin/submissions/cleanup", cleanupSubmissions);

  // Initialize database connection and setup
  connectToDatabase()
    .then(async (database) => {
      // Initialize services
      try {
        const { userService } = await import("./services/userService");
        const { submissionService } = await import("./services/submissionService");
        
        await userService.initializeAdmin();
        await submissionService.initialize(database);
        
        console.log('✅ All services initialized successfully');
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    })
    .catch(console.error);

  return app;
}
