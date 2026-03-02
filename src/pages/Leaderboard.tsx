import React from 'react';
import { Trophy, Medal, Star } from 'lucide-react';

export default function Leaderboard() {
  const users = [
    { rank: 1, name: "Jenny Wilson", xp: 12500, badge: "SQL Master" },
    { rank: 2, name: "Devon Lane", xp: 11200, badge: "Query Wizard" },
    { rank: 3, name: "Jane Cooper", xp: 10800, badge: "Data Ninja" },
    { rank: 4, name: "Robert Fox", xp: 9500, badge: "Select Star" },
    { rank: 5, name: "Esther Howard", xp: 8900, badge: "Join Expert" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Leaderboard</h1>
        <p className="text-gray-500">See where you stand among the top SQL developers.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">User</div>
          <div className="col-span-2 text-right">XP</div>
          <div className="col-span-2 text-center">Badge</div>
        </div>

        <div className="divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.rank} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
              <div className="col-span-2 flex justify-center">
                {user.rank === 1 ? (
                  <div className="w-8 h-8 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold">
                    <Trophy size={16} />
                  </div>
                ) : user.rank === 2 ? (
                  <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold">
                    <Medal size={16} />
                  </div>
                ) : user.rank === 3 ? (
                  <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                    <Medal size={16} />
                  </div>
                ) : (
                  <span className="font-bold text-gray-400">#{user.rank}</span>
                )}
              </div>
              
              <div className="col-span-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-sm">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              
              <div className="col-span-2 text-right font-mono font-bold text-emerald-600">
                {user.xp.toLocaleString()}
              </div>
              
              <div className="col-span-2 flex justify-center">
                <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-100 flex items-center gap-1">
                  <Star size={12} fill="currentColor" />
                  {user.badge}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
