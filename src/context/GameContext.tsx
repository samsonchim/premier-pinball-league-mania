
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Team, premierLeagueTeams } from '../data/teams';

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeGoals?: number;
  awayGoals?: number;
  played: boolean;
  week: number;
}

export interface TeamStats {
  team: Team;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDifference: number;
  points: number;
}

interface GameState {
  currentWeek: number;
  matches: Match[];
  teamStats: TeamStats[];
  selectedMatch: Match | null;
}

type GameAction = 
  | { type: 'SET_SELECTED_MATCH'; match: Match | null }
  | { type: 'UPDATE_MATCH_RESULT'; matchId: string; homeGoals: number; awayGoals: number }
  | { type: 'NEXT_WEEK' }
  | { type: 'RESET_LEAGUE' }
  | { type: 'LOAD_STATE'; state: GameState };

const GameContext = createContext<{
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
} | null>(null);

function generateFixtures(): Match[] {
  const fixtures: Match[] = [];
  const teams = [...premierLeagueTeams];
  let matchId = 1;

  // Generate 38 weeks of fixtures (each team plays each other twice)
  for (let week = 1; week <= 38; week++) {
    const weekFixtures: Match[] = [];
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      if (shuffledTeams[i] && shuffledTeams[i + 1]) {
        weekFixtures.push({
          id: `match-${matchId++}`,
          homeTeam: shuffledTeams[i],
          awayTeam: shuffledTeams[i + 1],
          played: false,
          week
        });
      }
    }
    
    fixtures.push(...weekFixtures);
  }
  
  return fixtures;
}

function initializeTeamStats(): TeamStats[] {
  return premierLeagueTeams.map(team => ({
    team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalsDifference: 0,
    points: 0
  }));
}

const initialState: GameState = {
  currentWeek: 1,
  matches: generateFixtures(),
  teamStats: initializeTeamStats(),
  selectedMatch: null
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_SELECTED_MATCH':
      return { ...state, selectedMatch: action.match };
    
    case 'UPDATE_MATCH_RESULT': {
      const updatedMatches = state.matches.map(match => 
        match.id === action.matchId 
          ? { ...match, homeGoals: action.homeGoals, awayGoals: action.awayGoals, played: true }
          : match
      );
      
      const match = state.matches.find(m => m.id === action.matchId);
      if (!match) return state;
      
      const updatedStats = state.teamStats.map(stat => {
        if (stat.team.id === match.homeTeam.id) {
          const wins = action.homeGoals > action.awayGoals ? stat.wins + 1 : stat.wins;
          const draws = action.homeGoals === action.awayGoals ? stat.draws + 1 : stat.draws;
          const losses = action.homeGoals < action.awayGoals ? stat.losses + 1 : stat.losses;
          const points = wins * 3 + draws;
          
          return {
            ...stat,
            played: stat.played + 1,
            wins,
            draws,
            losses,
            goalsFor: stat.goalsFor + action.homeGoals,
            goalsAgainst: stat.goalsAgainst + action.awayGoals,
            goalsDifference: (stat.goalsFor + action.homeGoals) - (stat.goalsAgainst + action.awayGoals),
            points
          };
        }
        
        if (stat.team.id === match.awayTeam.id) {
          const wins = action.awayGoals > action.homeGoals ? stat.wins + 1 : stat.wins;
          const draws = action.homeGoals === action.awayGoals ? stat.draws + 1 : stat.draws;
          const losses = action.awayGoals < action.homeGoals ? stat.losses + 1 : stat.losses;
          const points = wins * 3 + draws;
          
          return {
            ...stat,
            played: stat.played + 1,
            wins,
            draws,
            losses,
            goalsFor: stat.goalsFor + action.awayGoals,
            goalsAgainst: stat.goalsAgainst + action.homeGoals,
            goalsDifference: (stat.goalsFor + action.awayGoals) - (stat.goalsAgainst + action.homeGoals),
            points
          };
        }
        
        return stat;
      });
      
      return { ...state, matches: updatedMatches, teamStats: updatedStats, selectedMatch: null };
    }
    
    case 'NEXT_WEEK':
      return { ...state, currentWeek: state.currentWeek + 1 };
    
    case 'RESET_LEAGUE':
      return { ...initialState, matches: generateFixtures(), teamStats: initializeTeamStats() };
    
    case 'LOAD_STATE':
      return action.state;
    
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('premierLeagueGame');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', state: parsedState });
      } catch (error) {
        console.error('Failed to load saved game state:', error);
      }
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('premierLeagueGame', JSON.stringify(state));
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
