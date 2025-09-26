import { useState, useEffect } from "react";
import { Code, Clock, Trophy, Star, CheckCircle, Play, ArrowLeft } from "lucide-react";
import AIEditor from "@/features/ai-coding/AIEditor";

interface CodingQuestion {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  };
}

const codingQuestions: CodingQuestion[] = [
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
      javascript: `function maxSubArray(nums) {\n    // Implement Kadane's Algorithm\n    \n}`,
      python: `def max_sub_array(nums):\n    # Implement Kadane's Algorithm\n    pass`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Implement Kadane's Algorithm\n    \n}`,
      java: `public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Implement Kadane's Algorithm\n        \n    }\n}`
    }
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
      javascript: `function rotate(nums, k) {\n    // Rotate in-place\n    \n}`,
      python: `def rotate(nums, k):\n    # Rotate in-place\n    pass`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvoid rotate(vector<int>& nums, int k) {\n    // Rotate in-place\n    \n}`,
      java: `public class Solution {\n    public void rotate(int[] nums, int k) {\n        // Rotate in-place\n        \n    }\n}`
    }
  },
  {
    id: 3,
    title: "Subarray with Given Sum K",
    difficulty: "Medium",
    category: "Arrays & Strings",
    description: "Find the number of continuous subarrays whose sum equals to a given number k.",
    examples: [
      {
        input: "nums = [1,1,1], k = 2",
        output: "2",
        explanation: "There are 2 subarrays with sum = 2"
      }
    ],
    constraints: ["1 ≤ nums.length ≤ 2×10⁴", "-1000 ≤ nums[i] ≤ 1000"],
    hints: ["Use prefix sum and hash map", "Track cumulative sum and check if (sum - k) exists"],
    starterCode: {
      javascript: `function subarraySum(nums, k) {\n    // Find subarrays with sum k\n    \n}`,
      python: `def subarray_sum(nums, k):\n    # Find subarrays with sum k\n    pass`,
      cpp: `#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nint subarraySum(vector<int>& nums, int k) {\n    // Find subarrays with sum k\n    \n}`,
      java: `import java.util.*;\n\npublic class Solution {\n    public int subarraySum(int[] nums, int k) {\n        // Find subarrays with sum k\n        \n    }\n}`
    }
  },
  {
    id: 4,
    title: "Merge Two Sorted Arrays",
    difficulty: "Easy",
    category: "Arrays & Strings",
    description: "Merge nums1 and nums2 into a single array sorted in non-decreasing order without using extra space.",
    examples: [
      {
        input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3",
        output: "[1,2,2,3,5,6]"
      }
    ],
    constraints: ["nums1.length == m + n", "nums2.length == n"],
    hints: ["Start from the end of both arrays", "Use three pointers approach"],
    starterCode: {
      javascript: `function merge(nums1, m, nums2, n) {\n    // Merge without extra space\n    \n}`,
      python: `def merge(nums1, m, nums2, n):\n    # Merge without extra space\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nvoid merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n    // Merge without extra space\n    \n}`,
      java: `public class Solution {\n    public void merge(int[] nums1, int m, int[] nums2, int n) {\n        // Merge without extra space\n        \n    }\n}`
    }
  },
  {
    id: 5,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Arrays & Strings",
    description: "Given a string s, find the length of the longest substring without repeating characters.",
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.'
      }
    ],
    constraints: ["0 ≤ s.length ≤ 5×10⁴"],
    hints: ["Use sliding window technique", "Keep track of character positions with hash map"],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n    // Use sliding window\n    \n}`,
      python: `def length_of_longest_substring(s):\n    # Use sliding window\n    pass`,
      cpp: `#include <string>\n#include <unordered_map>\nusing namespace std;\n\nint lengthOfLongestSubstring(string s) {\n    // Use sliding window\n    \n}`,
      java: `import java.util.*;\n\npublic class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Use sliding window\n        \n    }\n}`
    }
  },
  // Searching & Sorting
  {
    id: 6,
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
      javascript: `function binarySearch(nums, target) {\n    // Implement both recursive and iterative\n    \n}`,
      python: `def binary_search(nums, target):\n    # Implement both recursive and iterative\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nint binarySearch(vector<int>& nums, int target) {\n    // Implement both recursive and iterative\n    \n}`,
      java: `public class Solution {\n    public int binarySearch(int[] nums, int target) {\n        // Implement both recursive and iterative\n        \n    }\n}`
    }
  },
  {
    id: 7,
    title: "Search in Rotated Sorted Array",
    difficulty: "Medium",
    category: "Searching & Sorting",
    description: "Search for a target value in a rotated sorted array.",
    examples: [
      {
        input: "nums = [4,5,6,7,0,1,2], target = 0",
        output: "4"
      }
    ],
    constraints: ["1 ≤ nums.length ≤ 5000"],
    hints: ["Modified binary search", "Check which half is sorted first"],
    starterCode: {
      javascript: `function search(nums, target) {\n    // Modified binary search\n    \n}`,
      python: `def search(nums, target):\n    # Modified binary search\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    // Modified binary search\n    \n}`,
      java: `public class Solution {\n    public int search(int[] nums, int target) {\n        // Modified binary search\n        \n    }\n}`
    }
  },
  {
    id: 8,
    title: "Majority Element",
    difficulty: "Easy",
    category: "Searching & Sorting",
    description: "Given an array nums of size n, return the majority element (appears more than n/2 times).",
    examples: [
      {
        input: "nums = [3,2,3]",
        output: "3"
      }
    ],
    constraints: ["n == nums.length", "1 ≤ n ≤ 5×10⁴"],
    hints: ["Use Boyer-Moore Voting Algorithm", "Or use hash map to count frequencies"],
    starterCode: {
      javascript: `function majorityElement(nums) {\n    // Boyer-Moore Voting Algorithm\n    \n}`,
      python: `def majority_element(nums):\n    # Boyer-Moore Voting Algorithm\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nint majorityElement(vector<int>& nums) {\n    // Boyer-Moore Voting Algorithm\n    \n}`,
      java: `public class Solution {\n    public int majorityElement(int[] nums) {\n        // Boyer-Moore Voting Algorithm\n        \n    }\n}`
    }
  },
  {
    id: 9,
    title: "Sort Colors (Dutch National Flag)",
    difficulty: "Medium",
    category: "Searching & Sorting",
    description: "Sort an array of 0s, 1s, and 2s in-place using the Dutch National Flag algorithm.",
    examples: [
      {
        input: "nums = [2,0,2,1,1,0]",
        output: "[0,0,1,1,2,2]"
      }
    ],
    constraints: ["n == nums.length", "1 ≤ n ≤ 300"],
    hints: ["Use three pointers: low, mid, high", "Partition array into three sections"],
    starterCode: {
      javascript: `function sortColors(nums) {\n    // Dutch National Flag Algorithm\n    \n}`,
      python: `def sort_colors(nums):\n    # Dutch National Flag Algorithm\n    pass`,
      cpp: `#include <vector>\nusing namespace std;\n\nvoid sortColors(vector<int>& nums) {\n    // Dutch National Flag Algorithm\n    \n}`,
      java: `public class Solution {\n    public void sortColors(int[] nums) {\n        // Dutch National Flag Algorithm\n        \n    }\n}`
    }
  },
  {
    id: 10,
    title: "Kth Largest Element in Array",
    difficulty: "Medium",
    category: "Searching & Sorting",
    description: "Find the kth largest element in an unsorted array.",
    examples: [
      {
        input: "nums = [3,2,1,5,6,4], k = 2",
        output: "5"
      }
    ],
    constraints: ["1 ≤ k ≤ nums.length ≤ 10⁴"],
    hints: ["Use QuickSelect algorithm", "Or use min-heap of size k"],
    starterCode: {
      javascript: `function findKthLargest(nums, k) {\n    // QuickSelect or Heap approach\n    \n}`,
      python: `def find_kth_largest(nums, k):\n    # QuickSelect or Heap approach\n    pass`,
      cpp: `#include <vector>\n#include <queue>\nusing namespace std;\n\nint findKthLargest(vector<int>& nums, int k) {\n    // QuickSelect or Heap approach\n    \n}`,
      java: `import java.util.*;\n\npublic class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // QuickSelect or Heap approach\n        \n    }\n}`
    }
  }
];

export default function CodingPractice() {
  const [selectedQuestion, setSelectedQuestion] = useState<CodingQuestion | null>(null);
  const [language, setLanguage] = useState<'javascript' | 'python' | 'cpp' | 'java'>('javascript');
  const [solvedQuestions, setSolvedQuestions] = useState<Set<number>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('');

  useEffect(() => {
    document.title = "Coding Practice - AI Coding Platform";
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const categories = [...new Set(codingQuestions.map(q => q.category))];
  const filteredQuestions = filterCategory 
    ? codingQuestions.filter(q => q.category === filterCategory)
    : codingQuestions;

  if (selectedQuestion) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <button
              onClick={() => setSelectedQuestion(null)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Problems
            </button>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Problem Description */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-2xl font-bold">{selectedQuestion.id}. {selectedQuestion.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {selectedQuestion.difficulty}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                  {selectedQuestion.category}
                </span>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedQuestion.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Examples</h3>
                  {selectedQuestion.examples.map((example, idx) => (
                    <div key={idx} className="bg-gray-50 rounded p-3 mb-2">
                      <div><strong>Input:</strong> {example.input}</div>
                      <div><strong>Output:</strong> {example.output}</div>
                      {example.explanation && <div><strong>Explanation:</strong> {example.explanation}</div>}
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Constraints</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedQuestion.constraints.map((constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Hints</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    {selectedQuestion.hints.map((hint, idx) => (
                      <li key={idx}>{hint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Code Editor */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Solution</h3>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>
              
              <div className="h-96">
                <AIEditor 
                  language={language} 
                  initialCode={selectedQuestion.starterCode[language]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Coding Practice</h1>
          <p className="text-xl text-gray-600">Master algorithms with 10 curated problems</p>
        </div>
        
        {/* Category Filter */}
        <div className="mb-6 flex justify-center">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedQuestion(question)}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">#{question.id}</span>
                  {solvedQuestions.has(question.id) && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                
                <h3 className="font-semibold text-lg mb-2">{question.title}</h3>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                    {question.difficulty}
                  </span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-xs">
                    {question.category}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm line-clamp-3">{question.description}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs">~20 min</span>
                  </div>
                  <button className="text-primary hover:text-primary/80 text-sm font-medium">
                    Solve →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
