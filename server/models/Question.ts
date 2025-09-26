import { ObjectId } from 'mongodb';

export interface CodingQuestion {
  _id?: ObjectId;
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  constraints: string[];
  hints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
  testCases?: {
    input: string;
    expectedOutput: string;
    explanation: string;
  }[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProgress {
  _id?: ObjectId;
  userId: string;
  questionId: number;
  status: 'attempted' | 'solved' | 'bookmarked';
  solutions: {
    language: string;
    code: string;
    submittedAt: Date;
    isCorrect?: boolean;
  }[];
  timeSpent: number; // in seconds
  attempts: number;
  lastAttemptAt: Date;
  createdAt: Date;
}

export interface UserProfile {
  _id?: ObjectId;
  userId: string;
  email: string;
  name: string;
  role: 'Developer' | 'Team Lead' | 'Admin';
  stats: {
    totalSolved: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    totalTimeSpent: number;
    streak: number;
    lastActiveDate: Date;
  };
  preferences: {
    preferredLanguage: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
