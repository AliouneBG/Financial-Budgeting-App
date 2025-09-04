import React, { useState } from 'react';
import type { Transaction } from '../types';

interface AIAssistantProps {
  transactions: Transaction[];
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions }) => {
  const [insights, setInsights] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const getInsights = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ transactions })
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Verify content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      setInsights(data.insights || 'No insights generated');
      setAnswer('');
    } catch (error) {
      console.error('Error getting insights:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Insights error: ${message}`);
      setInsights('');
    } finally {
      setIsLoading(false);
    }
  };

  const askQuestion = async () => {
    if (!question.trim()) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          question,
          transactions: transactions.slice(0, 200)
        })
      });

      // Handle non-OK responses
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Verify content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Invalid response: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      setAnswer(data.answer || 'No answer provided');
      setInsights('');
    } catch (error) {
      console.error('Error asking question:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      setError(`Question error: ${message}`);
      setAnswer('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">AI Financial Assistant</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
      
      <div className="mb-6">
        <button 
          onClick={getInsights}
          disabled={isLoading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : (
            'Get Financial Insights'
          )}
        </button>
        
        {insights && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">AI Insights</h3>
            <p className="whitespace-pre-line text-gray-700">{insights}</p>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="font-medium text-gray-700 mb-2">Ask a Question</h3>
        <div className="flex mb-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., How can I reduce my food expenses?"
            className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
          />
          <button
            onClick={askQuestion}
            disabled={isLoading || !question.trim()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 disabled:opacity-50"
          >
            Ask
          </button>
        </div>
        
        {answer && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-800 mb-2">AI Answer</h3>
            <p className="whitespace-pre-line text-gray-700">{answer}</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>AI suggestions are based on your transaction patterns and may not account for all financial factors.</p>
      </div>
    </div>
  );
};

export default AIAssistant;