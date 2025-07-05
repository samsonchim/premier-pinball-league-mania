
import React from 'react';
import { GameProvider } from '../context/GameContext';
import { GameDashboard } from '../components/GameDashboard';

const Index = () => {
  return (
    <GameProvider>
      <GameDashboard />
    </GameProvider>
  );
};

export default Index;
