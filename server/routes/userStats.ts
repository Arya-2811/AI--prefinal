import { RequestHandler } from "express";
import { userService } from "../services/userService";
import { getUserByToken } from "./auth";

// Get user statistics (Admin only)
export const getUserStats: RequestHandler = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    const user = await getUserByToken(token);
    
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const stats = await userService.getUserStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Cleanup expired sessions (Admin only)
export const cleanupSessions: RequestHandler = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    const user = await getUserByToken(token);
    
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const deletedCount = await userService.cleanupExpiredSessions();
    res.json({ deletedCount });
  } catch (error) {
    console.error('Cleanup sessions error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};
