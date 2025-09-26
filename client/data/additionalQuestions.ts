// Additional coding questions to be added to the main array
export const additionalQuestions = [
  // Arrays & Strings
  {
    id: 3,
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
      javascript: `function maxSubArray(nums) {\n    // Implement Kadane's Algorithm\n    let maxSum = nums[0];\n    let currentSum = nums[0];\n    \n    // Your code here\n    \n    return maxSum;\n}`,
      python: `def max_sub_array(nums):\n    # Implement Kadane's Algorithm\n    max_sum = nums[0]\n    current_sum = nums[0]\n    \n    # Your code here\n    \n    return max_sum`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Implement Kadane's Algorithm\n    int maxSum = nums[0];\n    int currentSum = nums[0];\n    \n    // Your code here\n    \n    return maxSum;\n}`,
      java: `public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Implement Kadane's Algorithm\n        int maxSum = nums[0];\n        int currentSum = nums[0];\n        \n        // Your code here\n        \n        return maxSum;\n    }\n}`
    }
  },
  {
    id: 4,
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
      javascript: `function rotate(nums, k) {\n    // Rotate in-place using reversal\n    k = k % nums.length;\n    \n    // Helper function to reverse array portion\n    function reverse(start, end) {\n        // Your code here\n    }\n    \n    // Your rotation logic here\n}`,
      python: `def rotate(nums, k):\n    # Rotate in-place using reversal\n    k = k % len(nums)\n    \n    def reverse(start, end):\n        # Your code here\n        pass\n    \n    # Your rotation logic here`,
      cpp: `#include <vector>\n#include <algorithm>\nusing namespace std;\n\nvoid rotate(vector<int>& nums, int k) {\n    // Rotate in-place using reversal\n    k = k % nums.size();\n    \n    // Helper function to reverse\n    auto reverseRange = [&](int start, int end) {\n        // Your code here\n    };\n    \n    // Your rotation logic here\n}`,
      java: `public class Solution {\n    public void rotate(int[] nums, int k) {\n        // Rotate in-place using reversal\n        k = k % nums.length;\n        \n        // Helper method to reverse\n        private void reverse(int[] nums, int start, int end) {\n            // Your code here\n        }\n        \n        // Your rotation logic here\n    }\n}`
    }
  }
];
