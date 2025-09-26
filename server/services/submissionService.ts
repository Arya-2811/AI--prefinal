import { MongoClient, Db, Collection } from 'mongodb';

export interface Submission {
  _id?: string;
  userId: string;
  questionId: number;
  code: string;
  language: string;
  status: 'Accepted' | 'Wrong Answer' | 'Runtime Error' | 'Time Limit Exceeded' | 'Compilation Error';
  testResults: {
    totalTests: number;
    passedTests: number;
    results: Array<{
      testCaseIndex: number;
      passed: boolean;
      actualOutput: string;
      expectedOutput: string;
      error?: string;
      executionTime: number;
    }>;
  };
  executionTime: number;
  memoryUsage?: number;
  submittedAt: Date;
  score: number; // Percentage score
  feedback?: {
    hints: any[];
    analysis: any;
    nextSteps: string[];
  };
}

export interface SubmissionStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  averageScore: number;
  languageBreakdown: { [language: string]: number };
  recentSubmissions: Submission[];
}

export interface UserProgress {
  userId: string;
  totalQuestionsSolved: number;
  easyQuestionsSolved: number;
  mediumQuestionsSolved: number;
  hardQuestionsSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  streak: number;
  lastSubmissionDate: Date;
  favoriteLanguage: string;
  averageExecutionTime: number;
  rank: number;
}

class SubmissionService {
  private db: Db | null = null;
  private submissions: Collection<Submission> | null = null;

  async initialize(db: Db) {
    this.db = db;
    this.submissions = db.collection<Submission>('submissions');
    
    // Create indexes for better performance
    await this.submissions.createIndex({ userId: 1, questionId: 1 });
    await this.submissions.createIndex({ submittedAt: -1 });
    await this.submissions.createIndex({ status: 1 });
    await this.submissions.createIndex({ userId: 1, submittedAt: -1 });
  }

  // Record a new submission
  async recordSubmission(submission: Omit<Submission, '_id' | 'submittedAt'>): Promise<string> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    const newSubmission: Submission = {
      ...submission,
      submittedAt: new Date()
    };

    const result = await this.submissions.insertOne(newSubmission);
    return result.insertedId.toString();
  }

  // Get submission by ID
  async getSubmissionById(submissionId: string): Promise<Submission | null> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    return await this.submissions.findOne({ _id: submissionId as any });
  }

  // Get user's submissions for a specific question
  async getUserSubmissions(userId: string, questionId?: number, limit: number = 20): Promise<Submission[]> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    const query: any = { userId };
    if (questionId) query.questionId = questionId;

    return await this.submissions
      .find(query)
      .sort({ submittedAt: -1 })
      .limit(limit)
      .toArray();
  }

  // Get submission statistics for a question
  async getQuestionStats(questionId: number): Promise<SubmissionStats> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    const submissions = await this.submissions.find({ questionId }).toArray();
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;
    const averageScore = submissions.length > 0 
      ? submissions.reduce((sum, s) => sum + s.score, 0) / submissions.length 
      : 0;

    // Language breakdown
    const languageBreakdown: { [language: string]: number } = {};
    submissions.forEach(s => {
      languageBreakdown[s.language] = (languageBreakdown[s.language] || 0) + 1;
    });

    // Recent submissions (last 10)
    const recentSubmissions = submissions
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())
      .slice(0, 10);

    return {
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      languageBreakdown,
      recentSubmissions
    };
  }

  // Get user's overall progress
  async getUserProgress(userId: string): Promise<UserProgress> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    const submissions = await this.submissions.find({ userId }).toArray();
    const totalSubmissions = submissions.length;
    const acceptedSubmissions = submissions.filter(s => s.status === 'Accepted').length;
    const acceptanceRate = totalSubmissions > 0 ? (acceptedSubmissions / totalSubmissions) * 100 : 0;

    // Get unique solved questions
    const solvedQuestions = new Set(
      submissions
        .filter(s => s.status === 'Accepted')
        .map(s => s.questionId)
    );

    // Calculate streak (consecutive days with submissions)
    const streak = await this.calculateStreak(userId);

    // Find favorite language
    const languageCount: { [language: string]: number } = {};
    submissions.forEach(s => {
      languageCount[s.language] = (languageCount[s.language] || 0) + 1;
    });
    const favoriteLanguage = Object.keys(languageCount).reduce((a, b) => 
      languageCount[a] > languageCount[b] ? a : b, 'javascript'
    );

    // Average execution time
    const averageExecutionTime = submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.executionTime, 0) / submissions.length
      : 0;

    // Get last submission date
    const lastSubmissionDate = submissions.length > 0
      ? submissions.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime())[0].submittedAt
      : new Date();

    // Calculate rank (simplified - based on number of solved questions)
    const rank = await this.calculateUserRank(userId);

    return {
      userId,
      totalQuestionsSolved: solvedQuestions.size,
      easyQuestionsSolved: 0, // Would need question difficulty data
      mediumQuestionsSolved: 0,
      hardQuestionsSolved: 0,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate: Math.round(acceptanceRate * 100) / 100,
      streak,
      lastSubmissionDate,
      favoriteLanguage,
      averageExecutionTime: Math.round(averageExecutionTime),
      rank
    };
  }

  // Calculate user's current streak
  private async calculateStreak(userId: string): Promise<number> {
    if (!this.submissions) return 0;

    const submissions = await this.submissions
      .find({ userId })
      .sort({ submittedAt: -1 })
      .toArray();

    if (submissions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const submissionDates = new Set(
      submissions.map(s => {
        const date = new Date(s.submittedAt);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
    );

    // Check consecutive days backwards from today
    while (submissionDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  }

  // Calculate user's rank based on solved questions
  private async calculateUserRank(userId: string): Promise<number> {
    if (!this.submissions) return 0;

    // Get all users' solved question counts
    const pipeline = [
      { $match: { status: 'Accepted' } },
      { $group: { _id: '$userId', solvedCount: { $addToSet: '$questionId' } } },
      { $project: { userId: '$_id', solvedCount: { $size: '$solvedCount' } } },
      { $sort: { solvedCount: -1 } }
    ];

    const rankings = await this.submissions.aggregate(pipeline).toArray();
    const userRankIndex = rankings.findIndex(r => r.userId === userId);
    
    return userRankIndex >= 0 ? userRankIndex + 1 : rankings.length + 1;
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 50): Promise<Array<{userId: string, solvedCount: number, rank: number}>> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    const pipeline = [
      { $match: { status: 'Accepted' } },
      { $group: { _id: '$userId', solvedCount: { $addToSet: '$questionId' } } },
      { $project: { userId: '$_id', solvedCount: { $size: '$solvedCount' } } },
      { $sort: { solvedCount: -1 } },
      { $limit: limit }
    ];

    const results = await this.submissions.aggregate(pipeline).toArray();
    
    return results.map((result, index) => ({
      userId: result.userId,
      solvedCount: result.solvedCount,
      rank: index + 1
    }));
  }

  // Get best submission for a user and question
  async getBestSubmission(userId: string, questionId: number): Promise<Submission | null> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    return await this.submissions.findOne(
      { userId, questionId, status: 'Accepted' },
      { sort: { score: -1, executionTime: 1 } }
    );
  }

  // Delete old submissions (cleanup)
  async cleanupOldSubmissions(daysOld: number = 90): Promise<number> {
    if (!this.submissions) throw new Error('Submission service not initialized');

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.submissions.deleteMany({
      submittedAt: { $lt: cutoffDate },
      status: { $ne: 'Accepted' } // Keep accepted submissions
    });

    return result.deletedCount;
  }
}

export const submissionService = new SubmissionService();
