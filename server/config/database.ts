import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = "mongodb+srv://aryadontulwar_db_user:Mindmap%402025@cluster0.com6rnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "ai_coding_platform";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    
    console.log('✅ Connected to MongoDB successfully');
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔐 MongoDB connection closed');
  }
}

export { db };
