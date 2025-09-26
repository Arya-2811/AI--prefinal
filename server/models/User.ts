import { ObjectId } from 'mongodb';

export type Role = "Developer" | "Team Lead" | "Admin";

export interface User {
  _id?: ObjectId;
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
}

export interface UserSession {
  _id?: ObjectId;
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}
