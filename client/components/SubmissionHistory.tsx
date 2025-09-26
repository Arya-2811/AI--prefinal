import { useState, useEffect } from "react";
import { Clock, CheckCircle2, XCircle, AlertCircle, Code, BarChart3, Trophy, TrendingUp } from "lucide-react";

interface Submission {
  _id: string;
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
  submittedAt: string;
  score: number;
}

interface UserProgress {
  userId: string;
  totalQuestionsSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  streak: number;
  lastSubmissionDate: string;
  favoriteLanguage: string;
  averageExecutionTime: number;
  rank: number;
}

interface SubmissionHistoryProps {
  userId: string;
  questionId?: number;
  showProgress?: boolean;
}

export default function SubmissionHistory({ userId, questionId, showProgress = true }: SubmissionHistoryProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
    if (showProgress) {
      fetchUserProgress();
    }
  }, [userId, questionId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const url = questionId 
        ? `/api/submissions/user/${userId}?questionId=${questionId}&limit=20`
        : `/api/submissions/user/${userId}?limit=20`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    try {
      const response = await fetch(`/api/submissions/user/${userId}/progress`);
      if (!response.ok) throw new Error('Failed to fetch progress');
      
      const data = await response.json();
      setProgress(data.progress);
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Accepted':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Wrong Answer':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'Runtime Error':
      case 'Compilation Error':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      case 'Time Limit Exceeded':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <XCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Accepted':
        return 'text-green-600 bg-green-100';
      case 'Wrong Answer':
        return 'text-red-600 bg-red-100';
      case 'Runtime Error':
      case 'Compilation Error':
        return 'text-orange-600 bg-orange-100';
      case 'Time Limit Exceeded':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading submissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button 
          onClick={fetchSubmissions}
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Progress Summary */}
      {showProgress && progress && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Your Progress
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{progress.totalQuestionsSolved}</div>
              <div className="text-sm text-gray-600">Problems Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{progress.acceptanceRate}%</div>
              <div className="text-sm text-gray-600">Acceptance Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">#{progress.rank}</div>
              <div className="text-sm text-gray-600">Global Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{progress.streak}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>Favorite Language: <strong>{progress.favoriteLanguage}</strong></span>
            <span>Avg. Execution: <strong>{progress.averageExecutionTime}ms</strong></span>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Code className="w-5 h-5" />
            {questionId ? 'Question Submissions' : 'Recent Submissions'}
            <span className="text-sm font-normal text-gray-500">({submissions.length})</span>
          </h3>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No submissions yet</p>
            <p className="text-sm">Start solving problems to see your submission history!</p>
          </div>
        ) : (
          <div className="divide-y">
            {submissions.map((submission) => (
              <div 
                key={submission._id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(submission.status)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(submission.status)}`}>
                          {submission.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {submission.language}
                        </span>
                        {questionId && (
                          <span className="text-sm text-gray-600">
                            Question #{submission.questionId}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(submission.submittedAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {submission.testResults.passedTests}/{submission.testResults.totalTests} tests
                    </div>
                    <div className="text-xs text-gray-500">
                      {submission.executionTime}ms • {submission.score}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {getStatusIcon(selectedSubmission.status)}
                  Submission Details
                </h3>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Submission Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium inline-block ${getStatusColor(selectedSubmission.status)}`}>
                    {selectedSubmission.status}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Language</div>
                  <div className="font-medium">{selectedSubmission.language}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="font-medium">{selectedSubmission.score}%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Runtime</div>
                  <div className="font-medium">{selectedSubmission.executionTime}ms</div>
                </div>
              </div>

              {/* Test Results */}
              <div>
                <h4 className="font-medium mb-2">Test Results ({selectedSubmission.testResults.passedTests}/{selectedSubmission.testResults.totalTests})</h4>
                <div className="space-y-2 max-h-40 overflow-auto">
                  {selectedSubmission.testResults.results.map((result, idx) => (
                    <div key={idx} className={`p-2 rounded border text-sm ${
                      result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span>Test {idx + 1}</span>
                        <div className="flex items-center gap-2">
                          <span>{result.executionTime}ms</span>
                          {result.passed ? 
                            <CheckCircle2 className="w-4 h-4 text-green-600" /> : 
                            <XCircle className="w-4 h-4 text-red-600" />
                          }
                        </div>
                      </div>
                      {!result.passed && (
                        <div className="mt-1 text-xs">
                          <div>Expected: {result.expectedOutput}</div>
                          <div>Got: {result.actualOutput}</div>
                          {result.error && <div className="text-red-600">Error: {result.error}</div>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Code */}
              <div>
                <h4 className="font-medium mb-2">Code</h4>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-60">
                  {selectedSubmission.code}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
