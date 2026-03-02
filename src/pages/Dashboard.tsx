import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, CheckCircle, Clock, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Assignment {
  id: number;
  title: string;
  difficulty: string;
  description: string;
  question: string;
}

export default function Dashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assignments')
      .then(res => res.json())
      .then(data => {
        setAssignments(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch assignments", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Total Assignments</h3>
            <p className="text-4xl font-bold text-gray-900">{assignments.length}</p>
          </div>
          <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
            <CheckCircle size={16} className="mr-2" />
            +12 this week
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Current Streak</h3>
            <p className="text-4xl font-bold text-gray-900">14 Days</p>
          </div>
          <div className="mt-4 flex items-center text-orange-500 text-sm font-medium">
            <Clock size={16} className="mr-2" />
            Keep it up!
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider mb-2">Global Rank</h3>
            <p className="text-4xl font-bold text-gray-900">Top 5%</p>
          </div>
          <div className="mt-4 flex items-center text-blue-500 text-sm font-medium">
            <BarChart2 size={16} className="mr-2" />
            Global Ranking
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Assignments</h2>
        <div className="flex gap-2">
          <select className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>Difficulty (Easy-Hard)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <div className={clsx(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                assignment.difficulty === 'Easy' ? "bg-emerald-100 text-emerald-700" :
                assignment.difficulty === 'Medium' ? "bg-orange-100 text-orange-700" :
                "bg-red-100 text-red-700"
              )}>
                {assignment.difficulty}
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{assignment.title}</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-3">
              {assignment.description}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
              <div className="flex items-center text-gray-400 text-xs font-medium">
                <Clock size={14} className="mr-1" />
                15 min
              </div>
              
              <Link 
                to={`/assignments/${assignment.id}`}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Start
                <Play size={16} fill="currentColor" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
