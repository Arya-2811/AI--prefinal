import { RequestHandler } from "express";
import { userService } from "../services/userService";
import { Role } from "../models/User";

export type { Role } from "../models/User";

export async function getUserByToken(token?: string | null): Promise<any | null> {
  if (!token) return null;
  try {
    const user = await userService.getUserByToken(token);
    if (!user) return null;
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  } catch (error) {
    console.error('Error getting user by token:', error);
    return null;
  }
}

export const signup: RequestHandler = async (req, res) => {
  try {
    const { email, password, name, role } = req.body as {
      email?: string;
      password?: string;
      name?: string;
      role?: Role;
    };
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { user, token } = await userService.createUser({
      email,
      password,
      name,
      role: role ?? "Developer"
    });

    res.status(201).json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (error: any) {
    if (error.message === 'Email already in use') {
      return res.status(409).json({ error: "Email already in use" });
    }
    console.error('Signup error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const { user, token } = await userService.authenticateUser(email, password);

    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role 
      } 
    });
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    const user = await getUserByToken(token);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Me endpoint error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    
    if (token) {
      await userService.logout(token);
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listUsers: RequestHandler = async (_req, res) => {
  try {
    const users = await userService.getAllUsers();
    const list = users.map((u) => ({ 
      id: u.id, 
      email: u.email, 
      name: u.name, 
      role: u.role 
    }));
    
    res.json({ users: list });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateRole: RequestHandler = async (req, res) => {
  try {
    const auth = req.headers.authorization;
    const token = auth?.replace("Bearer ", "");
    const current = await getUserByToken(token);
    
    if (!current || current.role !== "Admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    const { userId, role } = req.body as { userId?: string; role?: Role };
    
    if (!userId || !role) {
      return res.status(400).json({ error: "Invalid request" });
    }
    
    const success = await userService.updateUserRole(userId, role);
    
    if (!success) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({ ok: true });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Initialize admin user
(async () => {
  try {
    await userService.initializeAdmin();
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
})();
