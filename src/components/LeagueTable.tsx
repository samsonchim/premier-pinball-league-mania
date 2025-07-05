
import React from 'react';
import { TeamStats } from '../context/GameContext';
import { Card } from '@/components/ui/card';

interface LeagueTableProps {
  teamStats: TeamStats[];
}

export function LeagueTable({ teamStats }: LeagueTableProps) {
  const sortedStats = [...teamStats].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalsDifference !== a.goalsDifference) return b.goalsDifference - a.goalsDifference;
    return b.goalsFor - a.goalsFor;
  });

  const getPositionColor = (position: number) => {
    if (position <= 4) return 'text-green-600'; // Champions League
    if (position <= 6) return 'text-blue-600'; // Europa League
    if (position >= 18) return 'text-red-600'; // Relegation
    return 'text-gray-700';
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-800">
        Premier League Table
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-purple-200">
              <th className="text-left p-2 font-semibold">#</th>
              <th className="text-left p-2 font-semibold">Team</th>
              <th className="text-center p-2 font-semibold">P</th>
              <th className="text-center p-2 font-semibold">W</th>
              <th className="text-center p-2 font-semibold">D</th>
              <th className="text-center p-2 font-semibold">L</th>
              <th className="text-center p-2 font-semibold">GF</th>
              <th className="text-center p-2 font-semibold">GA</th>
              <th className="text-center p-2 font-semibold">GD</th>
              <th className="text-center p-2 font-semibold font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat, index) => (
              <tr 
                key={stat.team.id} 
                className={`border-b border-gray-200 hover:bg-purple-50 ${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <td className="p-2">
                  <span className={`font-bold ${getPositionColor(index + 1)}`}>
                    {index + 1}
                  </span>
                </td>
                <td className="p-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{stat.team.logo}</span>
                    <span className="font-medium">{stat.team.name}</span>
                  </div>
                </td>
                <td className="text-center p-2">{stat.played}</td>
                <td className="text-center p-2">{stat.wins}</td>
                <td className="text-center p-2">{stat.draws}</td>
                <td className="text-center p-2">{stat.losses}</td>
                <td className="text-center p-2">{stat.goalsFor}</td>
                <td className="text-center p-2">{stat.goalsAgainst}</td>
                <td className="text-center p-2">
                  <span className={stat.goalsDifference >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {stat.goalsDifference > 0 ? '+' : ''}{stat.goalsDifference}
                  </span>
                </td>
                <td className="text-center p-2">
                  <span className="font-bold text-purple-700">{stat.points}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-600">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 border border-green-600 rounded mr-2"></div>
          <span>Champions League (1-4)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-100 border border-blue-600 rounded mr-2"></div>
          <span>Europa League (5-6)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-100 border border-red-600 rounded mr-2"></div>
          <span>Relegation (18-20)</span>
        </div>
      </div>
    </Card>
  );
}
