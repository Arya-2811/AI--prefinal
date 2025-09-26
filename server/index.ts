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
import { judgeSubmission, getSubmissionResult } from "./routes/judge";
import { connectToDatabase } from "./config/database";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
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

  // Initialize database connection and setup
  connectToDatabase()
    .then(async () => {
      // Initialize admin user
      try {
        const { userService } = await import("./services/userService");
        await userService.initializeAdmin();
      } catch (error) {
        console.error('Error initializing admin user:', error);
      }
    })
    .catch(console.error);

  return app;
}
