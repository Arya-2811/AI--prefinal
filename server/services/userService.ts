import { Collection, ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/database';
import { User, UserSession, Role } from '../models/User';
import crypto from 'crypto';

class UserService {
  private usersCollection: Collection<User> | null = null;
  private sessionsCollection: Collection<UserSession> | null = null;

  private async getCollections() {
    if (!this.usersCollection) {
      const db = await connectToDatabase();
      this.usersCollection = db.collection<User>('users');
      this.sessionsCollection = db.collection<UserSession>('user_sessions');
      
      // Create indexes for better performance
      await this.usersCollection.createIndex({ email: 1 }, { unique: true });
      await this.usersCollection.createIndex({ id: 1 }, { unique: true });
      await this.sessionsCollection.createIndex({ token: 1 }, { unique: true });
      await this.sessionsCollection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    }
    return {
      users: this.usersCollection!,
      sessions: this.sessionsCollection!
    };
  }

  private hash(password: string): string {
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  private newId(): string {
    return crypto.randomBytes(12).toString("hex");
  }

  private newToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  // User Management
  async createUser(userData: {
    email: string;
    password: string;
    name: string;
    role?: Role;
  }): Promise<{ user: User; token: string }> {
    const { users, sessions } = await this.getCollections();
    
    // Check if user already exists
    const existingUser = await users.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const userId = this.newId();
    const user: User = {
      id: userId,
      email: userData.email,
      name: userData.name,
      role: userData.role || 'Developer',
      passwordHash: this.hash(userData.password),
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    await users.insertOne(user);

    // Create session token
    const token = this.newToken();
    const session: UserSession = {
      token,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    };

    await sessions.insertOne(session);

    return { user, token };
  }

  async authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
    const { users, sessions } = await this.getCollections();
    
    const user = await users.findOne({ email, isActive: true });
    if (!user || user.passwordHash !== this.hash(password)) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    await users.updateOne(
      { _id: user._id },
      { 
        $set: { 
          lastLoginAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Create new session token
    const token = this.newToken();
    const session: UserSession = {
      token,
      userId: user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true
    };

    await sessions.insertOne(session);

    return { user, token };
  }

  async getUserByToken(token: string): Promise<User | null> {
    const { users, sessions } = await this.getCollections();
    
    const session = await sessions.findOne({ 
      token, 
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) {
      return null;
    }

    const user = await users.findOne({ 
      id: session.userId, 
      isActive: true 
    });
    
    return user;
  }

  async getUserById(userId: string): Promise<User | null> {
    const { users } = await this.getCollections();
    return await users.findOne({ id: userId, isActive: true });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const { users } = await this.getCollections();
    return await users.findOne({ email, isActive: true });
  }

  async getAllUsers(): Promise<User[]> {
    const { users } = await this.getCollections();
    return await users.find({ isActive: true }).toArray();
  }

  async updateUserRole(userId: string, role: Role): Promise<boolean> {
    const { users } = await this.getCollections();
    const result = await users.updateOne(
      { id: userId, isActive: true },
      { 
        $set: { 
          role,
          updatedAt: new Date()
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    const { users } = await this.getCollections();
    const result = await users.updateOne(
      { id: userId, isActive: true },
      { 
        $set: { 
          ...updates,
          updatedAt: new Date()
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async deactivateUser(userId: string): Promise<boolean> {
    const { users, sessions } = await this.getCollections();
    
    // Deactivate user
    const userResult = await users.updateOne(
      { id: userId },
      { 
        $set: { 
          isActive: false,
          updatedAt: new Date()
        } 
      }
    );

    // Deactivate all user sessions
    await sessions.updateMany(
      { userId },
      { $set: { isActive: false } }
    );

    return userResult.modifiedCount > 0;
  }

  async logout(token: string): Promise<boolean> {
    const { sessions } = await this.getCollections();
    const result = await sessions.updateOne(
      { token },
      { $set: { isActive: false } }
    );
    return result.modifiedCount > 0;
  }

  async logoutAllSessions(userId: string): Promise<boolean> {
    const { sessions } = await this.getCollections();
    const result = await sessions.updateMany(
      { userId },
      { $set: { isActive: false } }
    );
    return result.modifiedCount > 0;
  }

  // Initialize admin user
  async initializeAdmin(): Promise<void> {
    const { users } = await this.getCollections();
    
    const adminEmail = "admin@codepilot.local";
    const existingAdmin = await users.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const adminUser: User = {
        id: this.newId(),
        email: adminEmail,
        name: "Admin",
        role: "Admin",
        passwordHash: this.hash("admin"),
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      };
      
      await users.insertOne(adminUser);
      console.log('✅ Admin user created: admin@codepilot.local / admin');
    }
  }

  // Cleanup expired sessions
  async cleanupExpiredSessions(): Promise<number> {
    const { sessions } = await this.getCollections();
    const result = await sessions.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    return result.deletedCount;
  }

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    recentSignups: number;
  }> {
    const { users } = await this.getCollections();
    
    const totalUsers = await users.countDocuments({ isActive: true });
    const activeUsers = await users.countDocuments({ 
      isActive: true,
      lastLoginAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const roleStats = await users.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]).toArray();
    
    const usersByRole = roleStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
    
    const recentSignups = await users.countDocuments({
      isActive: true,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    return {
      totalUsers,
      activeUsers,
      usersByRole,
      recentSignups
    };
  }
}

export const userService = new UserService();
