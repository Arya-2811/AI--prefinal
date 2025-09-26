import { questionService } from '../services/questionService';

const questionTestCases = [
  {
    id: 1,
    testCases: [
      {
        input: "[2,7,11,15], 9",
        expectedOutput: "[0,1]",
        explanation: "nums[0] + nums[1] = 2 + 7 = 9"
      },
      {
        input: "[3,2,4], 6",
        expectedOutput: "[1,2]",
        explanation: "nums[1] + nums[2] = 2 + 4 = 6"
      },
      {
        input: "[3,3], 6",
        expectedOutput: "[0,1]",
        explanation: "nums[0] + nums[1] = 3 + 3 = 6"
      },
      {
        input: "[1,5,3,7,2], 8",
        expectedOutput: "[1,2]",
        explanation: "nums[1] + nums[2] = 5 + 3 = 8"
      }
    ]
  },
  {
    id: 2,
    testCases: [
      {
        input: "[-2,1,-3,4,-1,2,1,-5,4]",
        expectedOutput: "6",
        explanation: "Subarray [4,-1,2,1] has the largest sum = 6"
      },
      {
        input: "[5,4,-1,7,8]",
        expectedOutput: "23",
        explanation: "Entire array has positive sum"
      },
      {
        input: "[-2,-1]",
        expectedOutput: "-1",
        explanation: "Best single element when all negative"
      },
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "15",
        explanation: "All positive numbers, sum entire array"
      },
      {
        input: "[-1]",
        expectedOutput: "-1",
        explanation: "Single negative element"
      }
    ]
  },
  {
    id: 3,
    testCases: [
      {
        input: '"()"',
        expectedOutput: "true",
        explanation: "Single pair of parentheses"
      },
      {
        input: '"()[]{}"',
        expectedOutput: "true",
        explanation: "Multiple valid pairs"
      },
      {
        input: '"(]"',
        expectedOutput: "false",
        explanation: "Mismatched brackets"
      },
      {
        input: '"([)]"',
        expectedOutput: "false",
        explanation: "Incorrectly nested brackets"
      },
      {
        input: '"{[]}"',
        expectedOutput: "true",
        explanation: "Properly nested brackets"
      }
    ]
  },
  {
    id: 4,
    testCases: [
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "[5,4,3,2,1]",
        explanation: "Reverse entire linked list"
      },
      {
        input: "[1,2]",
        expectedOutput: "[2,1]",
        explanation: "Two node list"
      },
      {
        input: "[1]",
        expectedOutput: "[1]",
        explanation: "Single node list"
      },
      {
        input: "[]",
        expectedOutput: "[]",
        explanation: "Empty list"
      }
    ]
  },
  {
    id: 5,
    testCases: [
      {
        input: "[-1,0,3,5,9,12], 9",
        expectedOutput: "4",
        explanation: "Target 9 is at index 4"
      },
      {
        input: "[-1,0,3,5,9,12], 2",
        expectedOutput: "-1",
        explanation: "Target 2 is not in array"
      },
      {
        input: "[5], 5",
        expectedOutput: "0",
        explanation: "Single element array with target"
      },
      {
        input: "[1,3,5,7,9], 7",
        expectedOutput: "3",
        explanation: "Target in middle of array"
      }
    ]
  },
  {
    id: 6,
    testCases: [
      {
        input: "2",
        expectedOutput: "2",
        explanation: "Two ways: 1+1 or 2"
      },
      {
        input: "3",
        expectedOutput: "3",
        explanation: "Three ways: 1+1+1, 1+2, or 2+1"
      },
      {
        input: "4",
        expectedOutput: "5",
        explanation: "Five ways: 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2"
      },
      {
        input: "1",
        expectedOutput: "1",
        explanation: "Only one way: single step"
      }
    ]
  },
  {
    id: 7,
    testCases: [
      {
        input: "[7,1,5,3,6,4]",
        expectedOutput: "5",
        explanation: "Buy at 1, sell at 6. Profit = 6-1 = 5"
      },
      {
        input: "[7,6,4,3,1]",
        expectedOutput: "0",
        explanation: "Prices only decrease, no profit possible"
      },
      {
        input: "[1,2,3,4,5]",
        expectedOutput: "4",
        explanation: "Buy at 1, sell at 5. Profit = 5-1 = 4"
      },
      {
        input: "[2,4,1]",
        expectedOutput: "2",
        explanation: "Buy at 2, sell at 4. Profit = 4-2 = 2"
      }
    ]
  },
  {
    id: 8,
    testCases: [
      {
        input: "[1,null,2,3]",
        expectedOutput: "[1,3,2]",
        explanation: "Inorder: left, root, right"
      },
      {
        input: "[]",
        expectedOutput: "[]",
        explanation: "Empty tree"
      },
      {
        input: "[1]",
        expectedOutput: "[1]",
        explanation: "Single node tree"
      },
      {
        input: "[1,2,3,4,5,null,6]",
        expectedOutput: "[4,2,5,1,3,6]",
        explanation: "Complete binary tree traversal"
      }
    ]
  },
  {
    id: 9,
    testCases: [
      {
        input: "[[1,3],[2,6],[8,10],[15,18]]",
        expectedOutput: "[[1,6],[8,10],[15,18]]",
        explanation: "Merge overlapping intervals [1,3] and [2,6]"
      },
      {
        input: "[[1,4],[4,5]]",
        expectedOutput: "[[1,5]]",
        explanation: "Adjacent intervals merge"
      },
      {
        input: "[[1,4],[0,4]]",
        expectedOutput: "[[0,4]]",
        explanation: "Overlapping intervals merge"
      },
      {
        input: "[[1,4],[2,3]]",
        expectedOutput: "[[1,4]]",
        explanation: "One interval contains another"
      }
    ]
  },
  {
    id: 10,
    testCases: [
      {
        input: "[3,2,0,-4], 1",
        expectedOutput: "true",
        explanation: "Tail connects to node at index 1 (cycle exists)"
      },
      {
        input: "[1,2], 0",
        expectedOutput: "true",
        explanation: "Tail connects to head (cycle exists)"
      },
      {
        input: "[1], -1",
        expectedOutput: "false",
        explanation: "Single node with no cycle"
      },
      {
        input: "[1,2,3,4], -1",
        expectedOutput: "false",
        explanation: "Linear linked list (no cycle)"
      }
    ]
  }
];

export async function addTestCasesToQuestions() {
  try {
    console.log('🧪 Adding test cases to questions...');
    
    for (const questionData of questionTestCases) {
      const question = await questionService.getQuestionById(questionData.id);
      
      if (question) {
        // Update question with test cases
        const success = await questionService.updateQuestion(questionData.id, {
          testCases: questionData.testCases,
          updatedAt: new Date()
        });
        
        if (success) {
          console.log(`✅ Added test cases to question ${questionData.id}: ${question.title}`);
        } else {
          console.log(`⚠️  Failed to update question ${questionData.id}`);
        }
      } else {
        console.log(`❌ Question ${questionData.id} not found`);
      }
    }
    
    console.log('🎉 Test cases added successfully!');
  } catch (error) {
    console.error('❌ Error adding test cases:', error);
    throw error;
  }
}

// Run if executed directly
addTestCasesToQuestions()
  .then(() => {
    console.log('✨ Test cases addition completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test cases addition failed:', error);
    process.exit(1);
  });
