const questions = [
  {
    id: 2,
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
      javascript: "function maxSubArray(nums) {\n    // Implement Kadane's Algorithm\n    let maxSum = nums[0];\n    let currentSum = nums[0];\n    \n    for (let i = 1; i < nums.length; i++) {\n        // Your code here\n    }\n    \n    return maxSum;\n}",
      python: "def max_sub_array(nums):\n    # Implement Kadane's Algorithm\n    max_sum = nums[0]\n    current_sum = nums[0]\n    \n    for i in range(1, len(nums)):\n        # Your code here\n        pass\n    \n    return max_sum",
      cpp: "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxSubArray(vector<int>& nums) {\n    // Implement Kadane's Algorithm\n    int maxSum = nums[0];\n    int currentSum = nums[0];\n    \n    for (int i = 1; i < nums.size(); i++) {\n        // Your code here\n    }\n    \n    return maxSum;\n}",
      java: "public class Solution {\n    public int maxSubArray(int[] nums) {\n        // Implement Kadane's Algorithm\n        int maxSum = nums[0];\n        int currentSum = nums[0];\n        \n        for (int i = 1; i < nums.length; i++) {\n            // Your code here\n        }\n        \n        return maxSum;\n    }\n}"
    }
  },
  {
    id: 3,
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
      javascript: "function isValid(s) {\n    // Use stack for validation\n    const stack = [];\n    const mapping = { ')': '(', '}': '{', ']': '[' };\n    \n    for (let char of s) {\n        // Your code here\n    }\n    \n    return stack.length === 0;\n}",
      python: "def is_valid(s):\n    # Use stack for validation\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    \n    for char in s:\n        # Your code here\n        pass\n    \n    return len(stack) == 0",
      cpp: "#include <string>\n#include <stack>\n#include <unordered_map>\nusing namespace std;\n\nbool isValid(string s) {\n    // Use stack for validation\n    stack<char> st;\n    unordered_map<char, char> mapping = {{')', '('}, {'}', '{'}, {']', '['}};\n    \n    for (char c : s) {\n        // Your code here\n    }\n    \n    return st.empty();\n}",
      java: "import java.util.*;\n\npublic class Solution {\n    public boolean isValid(String s) {\n        // Use stack for validation\n        Stack<Character> stack = new Stack<>();\n        Map<Character, Character> mapping = new HashMap<>();\n        mapping.put(')', '(');\n        mapping.put('}', '{');\n        mapping.put(']', '[');\n        \n        for (char c : s.toCharArray()) {\n            // Your code here\n        }\n        \n        return stack.isEmpty();\n    }\n}"
    }
  },
  {
    id: 4,
    title: "Reverse Linked List",
    difficulty: "Easy",
    category: "Linked List",
    description: "Given the head of a singly linked list, reverse the list, and return the reversed list.",
    examples: [
      {
        input: "head = [1,2,3,4,5]",
        output: "[5,4,3,2,1]"
      }
    ],
    constraints: ["The number of nodes in the list is the range [0, 5000]", "-5000 ≤ Node.val ≤ 5000"],
    hints: ["Use three pointers: prev, current, next", "Iteratively reverse the links"],
    starterCode: {
      javascript: "function reverseList(head) {\n    // Iterative approach\n    let prev = null;\n    let current = head;\n    \n    while (current !== null) {\n        // Your code here\n    }\n    \n    return prev;\n}",
      python: "def reverse_list(head):\n    # Iterative approach\n    prev = None\n    current = head\n    \n    while current:\n        # Your code here\n        pass\n    \n    return prev",
      cpp: "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* reverseList(ListNode* head) {\n    // Iterative approach\n    ListNode* prev = nullptr;\n    ListNode* current = head;\n    \n    while (current != nullptr) {\n        // Your code here\n    }\n    \n    return prev;\n}",
      java: "public class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Iterative approach\n        ListNode prev = null;\n        ListNode current = head;\n        \n        while (current != null) {\n            // Your code here\n        }\n        \n        return prev;\n    }\n}"
    }
  },
  {
    id: 5,
    title: "Binary Search",
    difficulty: "Easy",
    category: "Searching & Sorting",
    description: "Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.",
    examples: [
      {
        input: "nums = [-1,0,3,5,9,12], target = 9",
        output: "4",
        explanation: "9 exists in nums and its index is 4"
      }
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁴", "-10⁴ < nums[i], target < 10⁴"],
    hints: ["Use two pointers: left and right", "Compare target with middle element"],
    starterCode: {
      javascript: "function search(nums, target) {\n    let left = 0;\n    let right = nums.length - 1;\n    \n    while (left <= right) {\n        // Your code here\n    }\n    \n    return -1;\n}",
      python: "def search(nums, target):\n    left = 0\n    right = len(nums) - 1\n    \n    while left <= right:\n        # Your code here\n        pass\n    \n    return -1",
      cpp: "#include <vector>\nusing namespace std;\n\nint search(vector<int>& nums, int target) {\n    int left = 0;\n    int right = nums.size() - 1;\n    \n    while (left <= right) {\n        // Your code here\n    }\n    \n    return -1;\n}",
      java: "public class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0;\n        int right = nums.length - 1;\n        \n        while (left <= right) {\n            // Your code here\n        }\n        \n        return -1;\n    }\n}"
    }
  },
  {
    id: 6,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    category: "Linked List",
    description: "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
    examples: [
      {
        input: "list1 = [1,2,4], list2 = [1,3,4]",
        output: "[1,1,2,3,4,4]"
      }
    ],
    constraints: ["The number of nodes in both lists is in the range [0, 50]", "-100 ≤ Node.val ≤ 100"],
    hints: ["Use a dummy node to simplify the logic", "Compare values and link the smaller node"],
    starterCode: {
      javascript: "function mergeTwoLists(list1, list2) {\n    // Create a dummy node\n    let dummy = { val: 0, next: null };\n    let current = dummy;\n    \n    while (list1 !== null && list2 !== null) {\n        // Your code here\n    }\n    \n    // Handle remaining nodes\n    current.next = list1 || list2;\n    \n    return dummy.next;\n}",
      python: "def merge_two_lists(list1, list2):\n    # Create a dummy node\n    dummy = ListNode(0)\n    current = dummy\n    \n    while list1 and list2:\n        # Your code here\n        pass\n    \n    # Handle remaining nodes\n    current.next = list1 or list2\n    \n    return dummy.next",
      cpp: "struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode() : val(0), next(nullptr) {}\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n    // Create a dummy node\n    ListNode dummy(0);\n    ListNode* current = &dummy;\n    \n    while (list1 != nullptr && list2 != nullptr) {\n        // Your code here\n    }\n    \n    // Handle remaining nodes\n    current->next = list1 ? list1 : list2;\n    \n    return dummy.next;\n}",
      java: "public class ListNode {\n    int val;\n    ListNode next;\n    ListNode() {}\n    ListNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        // Create a dummy node\n        ListNode dummy = new ListNode(0);\n        ListNode current = dummy;\n        \n        while (list1 != null && list2 != null) {\n            // Your code here\n        }\n        \n        // Handle remaining nodes\n        current.next = list1 != null ? list1 : list2;\n        \n        return dummy.next;\n    }\n}"
    }
  },
  {
    id: 7,
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Arrays & Strings",
    description: "You are given an array prices where prices[i] is the price of a given stock on the ith day. You want to maximize your profit.",
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
        explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5."
      }
    ],
    constraints: ["1 ≤ prices.length ≤ 10⁵", "0 ≤ prices[i] ≤ 10⁴"],
    hints: ["Keep track of the minimum price seen so far", "Calculate profit at each step"],
    starterCode: {
      javascript: "function maxProfit(prices) {\n    let minPrice = prices[0];\n    let maxProfit = 0;\n    \n    for (let i = 1; i < prices.length; i++) {\n        // Your code here\n    }\n    \n    return maxProfit;\n}",
      python: "def max_profit(prices):\n    min_price = prices[0]\n    max_profit = 0\n    \n    for i in range(1, len(prices)):\n        # Your code here\n        pass\n    \n    return max_profit",
      cpp: "#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    int minPrice = prices[0];\n    int maxProfit = 0;\n    \n    for (int i = 1; i < prices.size(); i++) {\n        // Your code here\n    }\n    \n    return maxProfit;\n}",
      java: "public class Solution {\n    public int maxProfit(int[] prices) {\n        int minPrice = prices[0];\n        int maxProfit = 0;\n        \n        for (int i = 1; i < prices.length; i++) {\n            // Your code here\n        }\n        \n        return maxProfit;\n    }\n}"
    }
  },
  {
    id: 8,
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps.",
    examples: [
      {
        input: "n = 2",
        output: "2",
        explanation: "There are two ways to climb to the top: 1+1 steps or 2 steps."
      },
      {
        input: "n = 3",
        output: "3",
        explanation: "There are three ways: 1+1+1, 1+2, or 2+1."
      }
    ],
    constraints: ["1 ≤ n ≤ 45"],
    hints: ["This is a Fibonacci sequence problem", "dp[i] = dp[i-1] + dp[i-2]"],
    starterCode: {
      javascript: "function climbStairs(n) {\n    if (n <= 2) return n;\n    \n    let first = 1;\n    let second = 2;\n    \n    for (let i = 3; i <= n; i++) {\n        // Your code here\n    }\n    \n    return second;\n}",
      python: "def climb_stairs(n):\n    if n <= 2:\n        return n\n    \n    first = 1\n    second = 2\n    \n    for i in range(3, n + 1):\n        # Your code here\n        pass\n    \n    return second",
      cpp: "int climbStairs(int n) {\n    if (n <= 2) return n;\n    \n    int first = 1;\n    int second = 2;\n    \n    for (int i = 3; i <= n; i++) {\n        // Your code here\n    }\n    \n    return second;\n}",
      java: "public class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        \n        int first = 1;\n        int second = 2;\n        \n        for (int i = 3; i <= n; i++) {\n            // Your code here\n        }\n        \n        return second;\n    }\n}"
    }
  },
  {
    id: 9,
    title: "Binary Tree Inorder Traversal",
    difficulty: "Easy",
    category: "Trees & Graphs",
    description: "Given the root of a binary tree, return the inorder traversal of its nodes' values.",
    examples: [
      {
        input: "root = [1,null,2,3]",
        output: "[1,3,2]"
      }
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100]", "-100 ≤ Node.val ≤ 100"],
    hints: ["Use recursion: left -> root -> right", "Can also be solved iteratively using a stack"],
    starterCode: {
      javascript: "function inorderTraversal(root) {\n    const result = [];\n    \n    function inorder(node) {\n        if (node === null) return;\n        \n        // Your code here\n    }\n    \n    inorder(root);\n    return result;\n}",
      python: "def inorder_traversal(root):\n    result = []\n    \n    def inorder(node):\n        if not node:\n            return\n        \n        # Your code here\n    \n    inorder(root)\n    return result",
      cpp: "#include <vector>\nusing namespace std;\n\nstruct TreeNode {\n    int val;\n    TreeNode *left;\n    TreeNode *right;\n    TreeNode() : val(0), left(nullptr), right(nullptr) {}\n    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}\n};\n\nvector<int> inorderTraversal(TreeNode* root) {\n    vector<int> result;\n    \n    function<void(TreeNode*)> inorder = [&](TreeNode* node) {\n        if (node == nullptr) return;\n        \n        // Your code here\n    };\n    \n    inorder(root);\n    return result;\n}",
      java: "import java.util.*;\n\npublic class TreeNode {\n    int val;\n    TreeNode left;\n    TreeNode right;\n    TreeNode() {}\n    TreeNode(int val) { this.val = val; }\n}\n\npublic class Solution {\n    public List<Integer> inorderTraversal(TreeNode root) {\n        List<Integer> result = new ArrayList<>();\n        inorder(root, result);\n        return result;\n    }\n    \n    private void inorder(TreeNode node, List<Integer> result) {\n        if (node == null) return;\n        \n        // Your code here\n    }\n}"
    }
  },
  {
    id: 10,
    title: "Palindrome Number",
    difficulty: "Easy",
    category: "Math",
    description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
    examples: [
      {
        input: "x = 121",
        output: "true",
        explanation: "121 reads as 121 from left to right and from right to left."
      },
      {
        input: "x = -121",
        output: "false",
        explanation: "From left to right, it reads -121. From right to left, it becomes 121-."
      }
    ],
    constraints: ["-2³¹ ≤ x ≤ 2³¹ - 1"],
    hints: ["Negative numbers are not palindromes", "Convert to string or reverse the number mathematically"],
    starterCode: {
      javascript: "function isPalindrome(x) {\n    // Handle negative numbers\n    if (x < 0) return false;\n    \n    // Convert to string approach\n    const str = x.toString();\n    \n    // Your code here\n}",
      python: "def is_palindrome(x):\n    # Handle negative numbers\n    if x < 0:\n        return False\n    \n    # Convert to string approach\n    str_x = str(x)\n    \n    # Your code here",
      cpp: "#include <string>\nusing namespace std;\n\nbool isPalindrome(int x) {\n    // Handle negative numbers\n    if (x < 0) return false;\n    \n    // Convert to string approach\n    string str = to_string(x);\n    \n    // Your code here\n}",
      java: "public class Solution {\n    public boolean isPalindrome(int x) {\n        // Handle negative numbers\n        if (x < 0) return false;\n        \n        // Convert to string approach\n        String str = String.valueOf(x);\n        \n        // Your code here\n    }\n}"
    }
  }
];

// Function to add questions via API
async function addQuestions() {
  console.log('🌱 Adding questions to database...');
  
  for (const question of questions) {
    try {
      const response = await fetch('http://localhost:8088/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(question)
      });
      
      if (response.ok) {
        console.log(`✅ Added question ${question.id}: ${question.title}`);
      } else {
        const error = await response.text();
        console.log(`⚠️  Question ${question.id} might already exist or error: ${error}`);
      }
    } catch (error) {
      console.error(`❌ Error adding question ${question.id}:`, error.message);
    }
  }
  
  console.log('🎉 Finished adding questions!');
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { questions, addQuestions };
}

// For browser environment
if (typeof window !== 'undefined') {
  window.addQuestions = addQuestions;
}
