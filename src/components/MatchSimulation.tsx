
import React, { useState, useEffect, useRef } from 'react';
import { Match } from '../context/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MatchSimulationProps {
  match: Match;
  onMatchEnd: (homeGoals: number, awayGoals: number) => void;
  onBack: () => void;
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  team: 'home' | 'away';
  color: string;
}

export function MatchSimulation({ match, onMatchEnd, onBack }: MatchSimulationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [timeLeft, setTimeLeft] = useState(90);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  const balls = useRef<Ball[]>([
    { 
      x: 200, 
      y: 200, 
      vx: 3, 
      vy: 2, 
      team: 'home',
      color: match.homeTeam.primaryColor
    },
    { 
      x: 400, 
      y: 300, 
      vx: -2.5, 
      vy: -3, 
      team: 'away',
      color: match.awayTeam.primaryColor
    }
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
    const arenaRadius = 180;
    const ballRadius = 12;
    const goalWidth = 100; // Increased from 60
    const goalHeight = 35; // Increased from 20

    function animate() {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw arena circle
      ctx.strokeStyle = '#37003C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, arenaRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Draw goal - bigger size
      ctx.fillStyle = '#00FF41';
      ctx.fillRect(centerX + arenaRadius - 15, centerY - goalHeight/2, 25, goalHeight);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.strokeRect(centerX + arenaRadius - 15, centerY - goalHeight/2, 25, goalHeight);

      // Update and draw balls
      balls.current.forEach((ball, index) => {
        // Update position
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Check collision with arena boundary
        const dx = ball.x - centerX;
        const dy = ball.y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance >= arenaRadius - ballRadius) {
          // Check if entering goal area
          if (ball.x >= centerX + arenaRadius - 35 && 
              ball.y >= centerY - goalHeight/2 - ballRadius && 
              ball.y <= centerY + goalHeight/2 + ballRadius) {
            // Goal scored!
            if (ball.team === 'home') {
              setHomeGoals(prev => prev + 1);
            } else {
              setAwayGoals(prev => prev + 1);
            }
            
            // Reset ball position to center area
            ball.x = centerX + (Math.random() - 0.5) * 80;
            ball.y = centerY + (Math.random() - 0.5) * 80;
            ball.vx = (Math.random() - 0.5) * 6;
            ball.vy = (Math.random() - 0.5) * 6;
          } else {
            // Enhanced bouncing physics - more sensitive
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            
            // Reflect velocity based on collision angle
            const normalX = Math.cos(angle);
            const normalY = Math.sin(angle);
            
            // Dot product of velocity and normal
            const dotProduct = ball.vx * normalX + ball.vy * normalY;
            
            // Reflect velocity
            ball.vx = ball.vx - 2 * dotProduct * normalX;
            ball.vy = ball.vy - 2 * dotProduct * normalY;
            
            // Add some randomness and maintain energy
            ball.vx *= 0.95 + Math.random() * 0.1;
            ball.vy *= 0.95 + Math.random() * 0.1;
            
            // Ensure minimum speed
            const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            if (newSpeed < 2) {
              ball.vx = (ball.vx / newSpeed) * 2.5;
              ball.vy = (ball.vy / newSpeed) * 2.5;
            }
            
            // Push ball back inside arena
            ball.x = centerX + Math.cos(angle) * (arenaRadius - ballRadius - 2);
            ball.y = centerY + Math.sin(angle) * (arenaRadius - ballRadius - 2);
          }
        }

        // Ball-to-ball collision detection
        balls.current.forEach((otherBall, otherIndex) => {
          if (index !== otherIndex) {
            const dx = ball.x - otherBall.x;
            const dy = ball.y - otherBall.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < ballRadius * 2) {
              // Collision detected - exchange velocities with some randomness
              const tempVx = ball.vx;
              const tempVy = ball.vy;
              
              ball.vx = otherBall.vx * 0.8 + (Math.random() - 0.5) * 2;
              ball.vy = otherBall.vy * 0.8 + (Math.random() - 0.5) * 2;
              otherBall.vx = tempVx * 0.8 + (Math.random() - 0.5) * 2;
              otherBall.vy = tempVy * 0.8 + (Math.random() - 0.5) * 2;
              
              // Separate balls to prevent sticking
              const angle = Math.atan2(dy, dx);
              const targetX = otherBall.x + Math.cos(angle) * ballRadius * 2;
              const targetY = otherBall.y + Math.sin(angle) * ballRadius * 2;
              ball.x += (targetX - ball.x) * 0.5;
              ball.y += (targetY - ball.y) * 0.5;
            }
          }
        });

        // Draw ball as colored circle
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Add team initial in center of ball
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          ball.team === 'home' ? match.homeTeam.shortName[0] : match.awayTeam.shortName[0],
          ball.x,
          ball.y
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
