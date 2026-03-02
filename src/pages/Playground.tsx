import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Loader2, AlertCircle } from 'lucide-react';
import ResultsTable from '../components/ResultsTable';

export default function Playground() {
  const [query, setQuery] = useState('SELECT * FROM users;');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    setResults([]);
    
    try {
      const res = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResults(data.results);
      }
    } catch (err) {
      setError("Failed to execute query");
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">SQL Playground</h1>
        <button 
          onClick={handleExecute}
          disabled={executing}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-sm disabled:opacity-50"
        >
          {executing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
          Run Query
        </button>
      </div>

      <div className="flex-1 grid grid-rows-2 gap-6 min-h-0">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider flex justify-between items-center">
            <span>Editor</span>
            <button 
              onClick={() => setQuery('SELECT * FROM users;')}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 transition-colors"
              title="Reset Code"
            >
              Reset
            </button>
          </div>
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="sql"
              value={query}
              onChange={(val) => setQuery(val || '')}
              theme="light"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                fontFamily: "'JetBrains Mono', monospace",
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Results
          </div>
          <div className="flex-1 overflow-auto p-0">
            {error ? (
              <div className="p-6 text-red-500 flex flex-col items-center justify-center h-full">
                <AlertCircle size={32} className="mb-2 opacity-50" />
                <p className="font-medium">Query Error</p>
                <code className="mt-2 bg-red-50 px-2 py-1 rounded text-sm">{error}</code>
              </div>
            ) : results.length > 0 ? (
              <ResultsTable results={results} error={null} />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                <Play size={32} className="mb-2 opacity-20" />
                <p>Run a query to see results here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
