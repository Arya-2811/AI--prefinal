const { MongoClient } = require('mongodb');

const MONGODB_URI = "mongodb+srv://aryadontulwar_db_user:Mindmap%402025@cluster0.com6rnn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const DB_NAME = "ai_coding_platform";

const sampleQuestions = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Strings",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
      }
    ],
    constraints: ["2 ≤ nums.length ≤ 10⁴", "-10⁹ ≤ nums[i] ≤ 10⁹"],
    hints: ["Try using a hash map", "For each number, check if target - number exists"],
    starterCode: {
      javascript: `function twoSum(nums, target) {\n    // Your code here\n    \n}`,
      python: `def two_sum(nums, target):\n    # Your code here\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nvector<int> twoSum(vector<int>& nums, int target) {\n    // Your code here\n    \n}`,
      java: `public class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your code here\n        \n    }\n}`
    },
    tags: ["array", "hash-table"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 2,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks & Queues",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      {
        input: 's = "()"',
        output: "true"
      }
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴"],
    hints: ["Use a stack data structure", "Push opening brackets, pop and match closing brackets"],
    starterCode: {
      javascript: `function isValid(s) {\n    // Use stack for validation\n    \n}`,
      python: `def is_valid(s):\n    # Use stack for validation\n    pass`,
      cpp: `#include <string>\n#include <stack>\nusing namespace std;\n\nbool isValid(string s) {\n    // Use stack for validation\n    \n}`,
      java: `import java.util.*;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        // Use stack for validation\n        \n    }\n}`
    },
    tags: ["stack", "string"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedDatabase() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const questionsCollection = db.collection('questions');
    
    console.log('🌱 Seeding questions...');
    
    for (const question of sampleQuestions) {
      const existing = await questionsCollection.findOne({ id: question.id });
      if (existing) {
        console.log(`⏭️  Question ${question.id} already exists, skipping...`);
        continue;
      }
      
      await questionsCollection.insertOne(question);
      console.log(`✅ Created question ${question.id}: ${question.title}`);
    }
    
    console.log('🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔐 Database connection closed');
    }
  }
}

seedDatabase();
