
import React, { useState, useEffect, useRef } from 'react';
import { Match } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MatchSimulationProps {
  match: Match;
  onMatchEnd: (homeGoals: number, awayGoals: number) => void;
  onBack: () => void;
}

interface Logo {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 'home' | 'away';
}

export function MatchSimulation({ match, onMatchEnd, onBack }: MatchSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [timeLeft, setTimeLeft] = useState(90);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const logos = useRef<Logo[]>([
    { x: 200, y: 200, vx: 2, vy: 1.5, team: 'home' },
    { x: 400, y: 300, vx: -1.8, vy: -2.2, team: 'away' }
  ]);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded) {
      setGameEnded(true);
      setTimeout(() => onMatchEnd(homeGoals, awayGoals), 2000);
    }
  }, [timeLeft, gameStarted, gameEnded, homeGoals, awayGoals, onMatchEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 180;
    const goalWidth = 60;
    const goalHeight = 20;

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw arena circle
      ctx.strokeStyle = '#37003C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw goal
      ctx.fillStyle = '#00FF41';
      ctx.fillRect(centerX + radius - 10, centerY - goalHeight/2, 20, goalHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(centerX + radius - 10, centerY - goalHeight/2, 20, goalHeight);

      // Update and draw logos
      logos.current.forEach((logo, index) => {
        // Update position
        logo.x += logo.vx;
        logo.y += logo.vy;

        // Check collision with circle boundary
        const dx = logo.x - centerX;
        const dy = logo.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= radius - 15) {
          // Check if entering goal area
          if (logo.x >= centerX + radius - 25 && 
              logo.y >= centerY - goalHeight/2 - 15 && 
              logo.y <= centerY + goalHeight/2 + 15) {
            // Goal scored!
            if (logo.team === 'home') {
              setHomeGoals(prev => prev + 1);
            } else {
              setAwayGoals(prev => prev + 1);
            }
            
            // Reset logo position
            logo.x = centerX + (Math.random() - 0.5) * 100;
            logo.y = centerY + (Math.random() - 0.5) * 100;
            logo.vx = (Math.random() - 0.5) * 4;
            logo.vy = (Math.random() - 0.5) * 4;
          } else {
            // Bounce off wall
            const angle = Math.atan2(dy, dx);
            logo.vx = -logo.vx * 0.8 + Math.cos(angle) * 0.5;
            logo.vy = -logo.vy * 0.8 + Math.sin(angle) * 0.5;
            
            // Push back inside circle
            logo.x = centerX + Math.cos(angle) * (radius - 20);
            logo.y = centerY + Math.sin(angle) * (radius - 20);
          }
        }

        // Draw logo
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = logo.team === 'home' ? match.homeTeam.primaryColor : match.awayTeam.primaryColor;
        ctx.fillText(
          logo.team === 'home' ? match.homeTeam.logo : match.awayTeam.logo,
          logo.x,
          logo.y
        );
      });

      if (gameStarted && !gameEnded) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameStarted, gameEnded, match]);

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 p-4 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={onBack}>
              ← Back to Fixtures
            </Button>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-800">
                {timeLeft}s
              </div>
              <div className="text-sm text-gray-600">Time Remaining</div>
            </div>
            <div className="w-24"></div>
          </div>
        </Card>

        {/* Score Display */}
        <Card className="mb-6 p-6 bg-white/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl mb-2">{match.homeTeam.logo}</div>
              <div className="font-semibold">{match.homeTeam.name}</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">{homeGoals}</div>
            </div>
            
            <div className="text-center">
              <div className="text-xl font-bold text-gray-400">VS</div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl mb-2">{match.awayTeam.logo}</div>
              <div className="font-semibold">{match.awayTeam.name}</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">{awayGoals}</div>
            </div>
          </div>
        </Card>

        {/* Game Arena */}
        <Card className="p-6 bg-white/95 backdrop-blur">
          <div className="text-center mb-4">
            {!gameStarted ? (
              <div>
                <h3 className="text-xl font-bold mb-4">Match Ready!</h3>
                <Button onClick={startGame} size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Start Match
                </Button>
              </div>
            ) : gameEnded ? (
              <div>
                <h3 className="text-xl font-bold text-green-600 mb-2">Final Whistle!</h3>
                <p className="text-gray-600">Saving result...</p>
              </div>
            ) : (
              <h3 className="text-lg font-semibold text-purple-700">Match in Progress</h3>
            )}
          </div>
          
          <div className="flex justify-center">
            <canvas 
              ref={canvasRef}
              width={500}
              height={400}
              className="border-2 border-purple-200 rounded-lg bg-green-50"
            />
          </div>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Club logos bounce around the arena. Score by getting into the green goal!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
