import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, Database, MessageSquare, Check, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import Editor from '@monaco-editor/react';
import ResultsTable from '../components/ResultsTable';

interface Assignment {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  question: string;
  schema: string;
}

export default function Assignment() {
  const { id } = useParams<{ id: string }>();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/assignments/${id}`)
      .then(res => res.json())
      .then(data => {
        setAssignment(data);
        setLoading(false);
        // Set a default query template based on schema if needed, or just empty
        setQuery(`-- Write your query here\nSELECT * FROM users LIMIT 5;`);
      })
      .catch(err => {
        console.error("Failed to fetch assignment", err);
        setLoading(false);
      });
  }, [id]);

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

  const handleGetHint = async () => {
    if (!assignment) return;
    
    setHintLoading(true);
    setHint(null);
    
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          assignmentId: assignment.id,
          userQuery: query,
          errorMessage: error
        })
      });
      
      const data = await res.json();
      if (data.hint) {
        setHint(data.hint);
      } else {
        setHint("Could not generate a hint at this time.");
      }
    } catch (err) {
      setHint("Failed to get hint. Please try again.");
    } finally {
      setHintLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
      </div>
    );
  }

  if (!assignment) {
    return <div className="text-center p-8 text-red-500">Assignment not found</div>;
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center gap-4 mb-2">
        <Link to="/assignments" className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wide ${
              assignment.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
              assignment.difficulty === 'Medium' ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              {assignment.difficulty}
            </span>
            <span>• Assignment #{assignment.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Left Panel: Question & Schema */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-500" />
              Task
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              {assignment.question}
            </p>
            <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
              <strong>Tip:</strong> {assignment.description}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database size={20} className="text-purple-500" />
              Schema
            </h2>
            <div className="font-mono text-sm bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-700 whitespace-pre-wrap">
              {assignment.schema}
            </div>
            
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sample Data Preview</h3>
              <div className="text-xs text-gray-400 italic">
                (Run 'SELECT * FROM table_name' to explore)
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Editor & Results */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-0">
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                SQL Editor
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setQuery(`-- Write your query here\nSELECT * FROM users LIMIT 5;`)}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 px-2 transition-colors"
                  title="Reset Code"
                >
                  Reset
                </button>
                <button 
                  onClick={handleGetHint}
                  disabled={hintLoading}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  {hintLoading ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
                  {hintLoading ? 'Thinking...' : 'Get Hint'}
                </button>
                <button 
                  onClick={handleExecute}
                  disabled={executing}
                  className="flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {executing ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                  Run Query
                </button>
              </div>
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

          {/* Hint Panel (Conditional) */}
          {hint && (
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="bg-purple-100 p-2 rounded-lg h-fit text-purple-600">
                <MessageSquare size={20} />
              </div>
              <div>
                <h4 className="font-bold text-purple-900 text-sm mb-1">AI Hint</h4>
                <p className="text-purple-800 text-sm leading-relaxed">{hint}</p>
              </div>
              <button onClick={() => setHint(null)} className="ml-auto text-purple-400 hover:text-purple-600 self-start">
                <span className="sr-only">Dismiss</span>
                &times;
              </button>
            </div>
          )}

          <div className="h-64 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Query Results</span>
              {results.length > 0 && (
                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                  {results.length} rows returned
                </span>
              )}
            </div>
            <div className="flex-1 overflow-auto p-0">
              {error ? (
                <div className="p-6 flex flex-col items-center justify-center text-center h-full text-red-500">
                  <AlertCircle size={32} className="mb-2 opacity-50" />
                  <p className="font-medium">Query Error</p>
                  <p className="text-sm mt-1 opacity-80 font-mono bg-red-50 px-3 py-2 rounded border border-red-100 mt-2">{error}</p>
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
    </div>
  );
}


