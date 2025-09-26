import { Collection, ObjectId } from 'mongodb';
import { connectToDatabase } from '../config/database';
import { CodingQuestion, UserProgress, UserProfile } from '../models/Question';

class QuestionService {
  private questionsCollection: Collection<CodingQuestion> | null = null;
  private progressCollection: Collection<UserProgress> | null = null;
  private profilesCollection: Collection<UserProfile> | null = null;

  private async getCollections() {
    if (!this.questionsCollection) {
      const db = await connectToDatabase();
      this.questionsCollection = db.collection<CodingQuestion>('questions');
      this.progressCollection = db.collection<UserProgress>('user_progress');
      this.profilesCollection = db.collection<UserProfile>('user_profiles');
    }
    return {
      questions: this.questionsCollection!,
      progress: this.progressCollection!,
      profiles: this.profilesCollection!
    };
  }

  // Question Management
  async getAllQuestions(): Promise<CodingQuestion[]> {
    const { questions } = await this.getCollections();
    return await questions.find({}).sort({ id: 1 }).toArray();
  }

  async getQuestionById(id: number): Promise<CodingQuestion | null> {
    const { questions } = await this.getCollections();
    return await questions.findOne({ id });
  }

  async getQuestionsByCategory(category: string): Promise<CodingQuestion[]> {
    const { questions } = await this.getCollections();
    return await questions.find({ category }).sort({ id: 1 }).toArray();
  }

  async getQuestionsByDifficulty(difficulty: string): Promise<CodingQuestion[]> {
    const { questions } = await this.getCollections();
    return await questions.find({ difficulty }).sort({ id: 1 }).toArray();
  }

  async createQuestion(question: Omit<CodingQuestion, '_id' | 'createdAt' | 'updatedAt'>): Promise<CodingQuestion> {
    const { questions } = await this.getCollections();
    const newQuestion: CodingQuestion = {
      ...question,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await questions.insertOne(newQuestion);
    return { ...newQuestion, _id: result.insertedId };
  }

  async updateQuestion(id: number, updates: Partial<CodingQuestion>): Promise<boolean> {
    const { questions } = await this.getCollections();
    const result = await questions.updateOne(
      { id },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async deleteQuestion(id: number): Promise<boolean> {
    const { questions } = await this.getCollections();
    const result = await questions.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // User Progress Management
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    const { progress } = await this.getCollections();
    return await progress.find({ userId }).toArray();
  }

  async getQuestionProgress(userId: string, questionId: number): Promise<UserProgress | null> {
    const { progress } = await this.getCollections();
    return await progress.findOne({ userId, questionId });
  }

  async updateUserProgress(userId: string, questionId: number, progressData: Partial<UserProgress>): Promise<UserProgress> {
    const { progress } = await this.getCollections();
    
    const existingProgress = await progress.findOne({ userId, questionId });
    
    if (existingProgress) {
      const updatedData = {
        ...progressData,
        lastAttemptAt: new Date()
      };
      
      await progress.updateOne(
        { userId, questionId },
        { $set: updatedData }
      );
      
      return { ...existingProgress, ...updatedData };
    } else {
      const newProgress: UserProgress = {
        userId,
        questionId,
        status: 'attempted',
        solutions: [],
        timeSpent: 0,
        attempts: 1,
        lastAttemptAt: new Date(),
        createdAt: new Date(),
        ...progressData
      };
      
      const result = await progress.insertOne(newProgress);
      return { ...newProgress, _id: result.insertedId };
    }
  }

  async addSolution(userId: string, questionId: number, solution: {
    language: string;
    code: string;
    isCorrect?: boolean;
  }): Promise<boolean> {
    const { progress } = await this.getCollections();
    
    const solutionData = {
      ...solution,
      submittedAt: new Date()
    };

    const result = await progress.updateOne(
      { userId, questionId },
      { 
        $push: { solutions: solutionData },
        $inc: { attempts: 1 },
        $set: { 
          lastAttemptAt: new Date(),
          ...(solution.isCorrect && { status: 'solved' })
        }
      },
      { upsert: true }
    );
    
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  // User Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { profiles } = await this.getCollections();
    return await profiles.findOne({ userId });
  }

  async createUserProfile(profileData: Omit<UserProfile, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const { profiles } = await this.getCollections();
    
    const newProfile: UserProfile = {
      ...profileData,
      stats: {
        totalSolved: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        totalTimeSpent: 0,
        streak: 0,
        lastActiveDate: new Date(),
        ...profileData.stats
      },
      preferences: {
        preferredLanguage: 'javascript',
        theme: 'light',
        notifications: true,
        ...profileData.preferences
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await profiles.insertOne(newProfile);
    return { ...newProfile, _id: result.insertedId };
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
    const { profiles } = await this.getCollections();
    const result = await profiles.updateOne(
      { userId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    return result.modifiedCount > 0;
  }

  async updateUserStats(userId: string, questionDifficulty: string, timeSpent: number): Promise<boolean> {
    const { profiles } = await this.getCollections();
    
    const statUpdates: any = {
      $inc: {
        'stats.totalSolved': 1,
        'stats.totalTimeSpent': timeSpent
      },
      $set: {
        'stats.lastActiveDate': new Date(),
        updatedAt: new Date()
      }
    };

    // Increment difficulty-specific counter
    if (questionDifficulty === 'Easy') {
      statUpdates.$inc['stats.easyCount'] = 1;
    } else if (questionDifficulty === 'Medium') {
      statUpdates.$inc['stats.mediumCount'] = 1;
    } else if (questionDifficulty === 'Hard') {
      statUpdates.$inc['stats.hardCount'] = 1;
    }

    const result = await profiles.updateOne({ userId }, statUpdates);
    return result.modifiedCount > 0;
  }

  // Analytics
  async getLeaderboard(limit: number = 10): Promise<UserProfile[]> {
    const { profiles } = await this.getCollections();
    return await profiles
      .find({})
      .sort({ 'stats.totalSolved': -1, 'stats.totalTimeSpent': 1 })
      .limit(limit)
      .toArray();
  }

  async getQuestionStats(): Promise<{
    totalQuestions: number;
    byDifficulty: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const { questions } = await this.getCollections();
    
    const totalQuestions = await questions.countDocuments();
    
    const difficultyStats = await questions.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]).toArray();
    
    const categoryStats = await questions.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]).toArray();
    
    const byDifficulty = difficultyStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
    
    const byCategory = categoryStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalQuestions,
      byDifficulty,
      byCategory
    };
  }
}

export const questionService = new QuestionService();
