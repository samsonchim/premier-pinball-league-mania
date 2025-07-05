
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { FixtureCard } from './FixtureCard';
import { MatchSimulation } from './MatchSimulation';
import { LeagueTable } from './LeagueTable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function GameDashboard() {
  const { state, dispatch } = useGame();
  const [activeTab, setActiveTab] = useState('fixtures');

  const currentWeekMatches = state.matches.filter(match => match.week === state.currentWeek);
  const allMatchesPlayed = currentWeekMatches.every(match => match.played);
  const canAdvanceWeek = allMatchesPlayed && state.currentWeek < 38;

  const handleSelectMatch = (match: any) => {
    dispatch({ type: 'SET_SELECTED_MATCH', match });
  };

  const handleMatchEnd = (homeGoals: number, awayGoals: number) => {
    if (state.selectedMatch) {
      dispatch({ 
        type: 'UPDATE_MATCH_RESULT', 
        matchId: state.selectedMatch.id, 
        homeGoals, 
        awayGoals 
      });
    }
  };

  const handleBackToFixtures = () => {
    dispatch({ type: 'SET_SELECTED_MATCH', match: null });
  };

  const handleNextWeek = () => {
    if (canAdvanceWeek) {
      dispatch({ type: 'NEXT_WEEK' });
      setActiveTab('fixtures');
    }
  };

  const handleResetLeague = () => {
    if (window.confirm('Are you sure you want to reset the entire league? This cannot be undone.')) {
      dispatch({ type: 'RESET_LEAGUE' });
      setActiveTab('fixtures');
    }
  };

  if (state.selectedMatch) {
    return (
      <MatchSimulation
        match={state.selectedMatch}
        onMatchEnd={handleMatchEnd}
        onBack={handleBackToFixtures}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500">
      <div className="container mx-auto p-4">
        {/* Header */}
        <Card className="mb-6 p-6 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-purple-800">Premier League Simulation</h1>
              <p className="text-gray-600">Week {state.currentWeek} of 38</p>
            </div>
            <div className="flex gap-2">
              {canAdvanceWeek && (
                <Button onClick={handleNextWeek} className="bg-green-600 hover:bg-green-700">
                  Next Week →
                </Button>
              )}
              <Button variant="outline" onClick={handleResetLeague} className="text-red-600 border-red-200">
                Reset League
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
              <TabsTrigger value="table">League Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="fixtures">
            <Card className="p-6 bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-purple-800">Week {state.currentWeek} Fixtures</h2>
                <div className="text-sm text-gray-600">
                  {currentWeekMatches.filter(m => m.played).length} / {currentWeekMatches.length} completed
                </div>
              </div>

              {allMatchesPlayed && state.currentWeek < 38 && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">Week Complete!</h3>
                      <p className="text-green-600">All matches finished. Ready for next week.</p>
                    </div>
                    <Button onClick={handleNextWeek} className="bg-green-600 hover:bg-green-700">
                      Advance to Week {state.currentWeek + 1}
                    </Button>
                  </div>
                </div>
              )}

              {state.currentWeek >= 38 && allMatchesPlayed && (
                <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Season Complete! 🏆</h3>
                  <p className="text-purple-600">All 38 weeks finished. Check the final league table!</p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {currentWeekMatches.map(match => (
                  <FixtureCard
                    key={match.id}
                    match={match}
                    onSelectMatch={handleSelectMatch}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="table">
            <LeagueTable teamStats={state.teamStats} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
