import { questionService } from '../services/questionService';
import { CodingQuestion } from '../models/Question';

const codingQuestions: Omit<CodingQuestion, '_id' | 'createdAt' | 'updatedAt'>[] = [
  // Arrays & Strings
  {
    id: 1,
    title: "Maximum Subarray Sum (Kadane's Algorithm)",
    difficulty: "Medium",
    category: "Arrays & Strings",
    description: "Find the maximum sum of a contiguous subarray within a one-dimensional array of numbers.",
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "[4,-1,2,1] has the largest sum = 6."
      }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    hints: ["Use Kadane's algorithm", "Keep track of current sum and maximum sum"],
    starterCode: {
      javascript: `function maxSubArray(nums) {\n    // Implement Kadane's Algorithm\n    let maxSum = nums[0];\n    let currentSum = nums[0];\n    \n    for (let i = 1; i < nums.length; i++) {\n        // Your code here\n    }\n    \n    return maxSum;\n}`,
      python: `def max_sub_array(nums):\n    # Implement Kadane's Algorithm\n    max_sum = nums[0]\n    current_sum = nums[0]\n    \n    for i in range(1, len(nums)):\n        # Your code here\n        pass\n    \n    return max_sum`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Implement Kadane's Algorithm\n    int maxSum = nums[0];\n    int currentSum = nums[0];\n    \n    for (int i = 1; i < nums.size(); i++) {\n        // Your code here\n    }\n    \n    return maxSum;\n}`,
      java: `public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Implement Kadane's Algorithm\n        int maxSum = nums[0];\n        int currentSum = nums[0];\n        \n        for (int i = 1; i < nums.length; i++) {\n            // Your code here\n        }\n        \n        return maxSum;\n    }\n}`
    },
    tags: ["array", "dynamic-programming", "kadane"]
  },
  {
    id: 2,
    title: "Rotate Array by K Steps",
    difficulty: "Medium",
    category: "Arrays & Strings",
    description: "Given an array, rotate the array to the right by k steps, where k is non-negative. Do this in-place.",
    examples: [
      {
        input: "nums = [1,2,3,4,5,6,7], k = 3",
        output: "[5,6,7,1,2,3,4]"
      }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "0 ≤ k ≤ 10⁵"],
    hints: ["Use array reversal approach", "Reverse entire array, then reverse first k and last n-k elements"],
    starterCode: {
      javascript: `function rotate(nums, k) {\n    // Rotate in-place using reversal\n    k = k % nums.length;\n    \n    function reverse(start, end) {\n        // Your code here\n    }\n    \n    // Your rotation logic here\n}`,
      python: `def rotate(nums, k):\n    # Rotate in-place using reversal\n    k = k % len(nums)\n    \n    def reverse(start, end):\n        # Your code here\n        pass\n    \n    # Your rotation logic here`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvoid rotate(vector<int>& nums, int k) {\n    // Rotate in-place using reversal\n    k = k % nums.size();\n    \n    // Your code here\n}`,
      java: `public class Solution {\n    public void rotate(int[] nums, int k) {\n        // Rotate in-place using reversal\n        k = k % nums.length;\n        \n        // Your code here\n    }\n}`
    },
    tags: ["array", "two-pointers", "reverse"]
  },
  {
    id: 3,
    title: "Detect Cycle in Linked List (Floyd's)",
    difficulty: "Easy",
    category: "Linked List",
    description: "Given head of a linked list, determine if the linked list has a cycle using Floyd's cycle detection.",
    examples: [
      {
        input: "head = [3,2,0,-4], pos = 1",
        output: "true",
        explanation: "There is a cycle, tail connects to 1st node."
      }
    ],
    constraints: ["The number of nodes is in range [0, 10⁴]"],
    hints: ["Use two pointers: slow and fast", "If they meet, there's a cycle"],
    starterCode: {
      javascript: `function hasCycle(head) {\n    // Floyd's Cycle Detection\n    if (!head || !head.next) return false;\n    \n    let slow = head;\n    let fast = head;\n    \n    // Your code here\n    \n    return false;\n}`,
      python: `def has_cycle(head):\n    # Floyd's Cycle Detection\n    if not head or not head.next:\n        return False\n    \n    slow = head\n    fast = head\n    \n    # Your code here\n    \n    return False`,
      cpp: `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(NULL) {}\n};\n\nbool hasCycle(ListNode *head) {\n    // Floyd's Cycle Detection\n    if (!head || !head->next) return false;\n    \n    ListNode* slow = head;\n    ListNode* fast = head;\n    \n    // Your code here\n    \n    return false;\n}`,
      java: `class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int x) { val = x; next = null; }\n}\n\npublic class Solution {\n    public boolean hasCycle(ListNode head) {\n        // Floyd's Cycle Detection\n        if (head == null || head.next == null) return false;\n        \n        ListNode slow = head;\n        ListNode fast = head;\n        \n        // Your code here\n        \n        return false;\n    }\n}`
    },
    tags: ["linked-list", "two-pointers", "floyd-cycle"]
  },
  {
    id: 4,
    title: "Binary Search (Recursive + Iterative)",
    difficulty: "Easy",
    category: "Searching & Sorting",
    description: "Implement binary search algorithm both recursively and iteratively.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4"
      }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁴", "All integers in nums are unique"],
    hints: ["Compare target with middle element", "Recursively search left or right half"],
    starterCode: {
      javascript: `function binarySearch(nums, target) {\n    // Implement both recursive and iterative\n    \n    // Iterative approach\n    function iterativeSearch() {\n        // Your code here\n    }\n    \n    // Recursive approach\n    function recursiveSearch(left, right) {\n        // Your code here\n    }\n    \n    return iterativeSearch();\n}`,
      python: `def binary_search(nums, target):\n    # Implement both recursive and iterative\n    \n    def iterative_search():\n        # Your code here\n        pass\n    \n    def recursive_search(left, right):\n        # Your code here\n        pass\n    \n    return iterative_search()`,
      cpp: `#include <vector>\nusing namespace std;\n\nint binarySearch(vector<int>& nums, int target) {\n    // Implement both recursive and iterative\n    \n    // Iterative approach\n    int left = 0, right = nums.size() - 1;\n    \n    while (left <= right) {\n        // Your code here\n    }\n    \n    return -1;\n}`,
      java: `public class Solution {\n    public int binarySearch(int[] nums, int target) {\n        // Implement both recursive and iterative\n        return iterativeSearch(nums, target);\n    }\n    \n    private int iterativeSearch(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        \n        while (left <= right) {\n            // Your code here\n        }\n        \n        return -1;\n    }\n}`
    },
    tags: ["binary-search", "recursion", "iteration"]
  },
  {
    id: 5,
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks & Queues",
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    examples: [
      {
        input: 's = "()"',
        output: "true"
      },
      {
        input: 's = "()[]{}"',
        output: "true"
      },
      {
        input: 's = "(]"',
        output: "false"
      }
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴", "s consists of parentheses only '()[]{}'."],
    hints: ["Use a stack data structure", "Push opening brackets, pop and match closing brackets"],
    starterCode: {
      javascript: `function isValid(s) {\n    // Use stack for validation\n    const stack = [];\n    const mapping = { ')': '(', '}': '{', ']': '[' };\n    \n    for (let char of s) {\n        // Your code here\n    }\n    \n    return stack.length === 0;\n}`,
      python: `def is_valid(s):\n    # Use stack for validation\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    \n    for char in s:\n        # Your code here\n        pass\n    \n    return len(stack) == 0`,
      cpp: `#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\n\nbool isValid(string s) {\n    // Use stack for validation\n    stack<char> st;\n    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};\n    \n    for (char c : s) {\n        // Your code here\n    }\n    \n    return st.empty();\n}`,
      java: `import java.util.*;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        // Use stack for validation\n        Stack<Character> stack = new Stack<>();\n        Map<Character, Character> mapping = new HashMap<>();\n        mapping.put(')', '(');\n        mapping.put('}', '{');\n        mapping.put(']', '[');\n        \n        for (char c : s.toCharArray()) {\n            // Your code here\n        }\n        \n        return stack.isEmpty();\n    }\n}`
    },
    tags: ["stack", "string", "parentheses"]
  }
];

export async function seedQuestions() {
  try {
    console.log('🌱 Starting to seed questions...');
    
    for (const question of codingQuestions) {
      // Check if question already exists
      const existing = await questionService.getQuestionById(question.id);
      if (existing) {
        console.log(`⏭️  Question ${question.id} already exists, skipping...`);
        continue;
      }
      
      await questionService.createQuestion(question);
      console.log(`✅ Created question ${question.id}: ${question.title}`);
    }
    
    console.log('🎉 Successfully seeded all questions!');
  } catch (error) {
    console.error('❌ Error seeding questions:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedQuestions()
    .then(() => {
      console.log('✨ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
