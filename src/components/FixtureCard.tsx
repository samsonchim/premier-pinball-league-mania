
import React from 'react';
import { Match } from '../context/GameContext';
import { Card } from '@/components/ui/card';

interface FixtureCardProps {
  match: Match;
  onSelectMatch: (match: Match) => void;
}

export function FixtureCard({ match, onSelectMatch }: FixtureCardProps) {
  const handleClick = () => {
    if (!match.played) {
      onSelectMatch(match);
    }
  };

  return (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
        match.played 
          ? 'bg-gray-50 border-gray-200 cursor-default' 
          : 'bg-white border-purple-200 hover:border-purple-400 hover:scale-105'
      }`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{match.homeTeam.logo}</div>
          <div className="text-sm font-medium">{match.homeTeam.shortName}</div>
        </div>
        
        <div className="flex items-center space-x-3 text-lg font-bold">
          {match.played ? (
            <>
              <span className="text-gray-700">{match.homeGoals}</span>
              <span className="text-gray-400">-</span>
              <span className="text-gray-700">{match.awayGoals}</span>
            </>
          ) : (
            <span className="text-purple-600">VS</span>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium">{match.awayTeam.shortName}</div>
          <div className="text-2xl">{match.awayTeam.logo}</div>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        {match.played ? (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Final
          </span>
        ) : (
          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
            Click to Play
          </span>
        )}
      </div>
    </Card>
  );
}
