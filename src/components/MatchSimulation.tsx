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
  const rotationRef = useRef<number>(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [homeGoals, setHomeGoals] = useState(0);
  const [awayGoals, setAwayGoals] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showGoalNotification, setShowGoalNotification] = useState(false);
  const [goalScorer, setGoalScorer] = useState<'home' | 'away' | null>(null);
  const [gamePaused, setGamePaused] = useState(false);

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
    if (gameStarted && timeLeft > 0 && !gameEnded && !gamePaused) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded) {
      setGameEnded(true);
      setTimeout(() => onMatchEnd(homeGoals, awayGoals), 2000);
    }
  }, [timeLeft, gameStarted, gameEnded, gamePaused, homeGoals, awayGoals, onMatchEnd]);

  const handleGoalScored = (team: 'home' | 'away') => {
    console.log(`Goal scored by ${team}!`);
    
    // Update score immediately
    if (team === 'home') {
      setHomeGoals(prev => {
        const newScore = prev + 1;
        console.log(`Home goals updated to: ${newScore}`);
        return newScore;
      });
    } else {
      setAwayGoals(prev => {
        const newScore = prev + 1;
        console.log(`Away goals updated to: ${newScore}`);
        return newScore;
      });
    }
    
    // Show goal notification and pause game
    setGoalScorer(team);
    setShowGoalNotification(true);
    setGamePaused(true);
    
    // Hide notification and resume game after 2 seconds
    setTimeout(() => {
      setShowGoalNotification(false);
      setGoalScorer(null);
      setGamePaused(false);
    }, 2000);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameStarted) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const arenaRadius = 180;
    const ballRadius = 12;
    const goalOpeningAngle = Math.PI / 4; // 45 degrees opening

    function animate() {
      if (!ctx || !canvas) return;

      // Update rotation only if game is not paused
      if (!gamePaused) {
        rotationRef.current += 0.008;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Save context for rotation
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotationRef.current);
      ctx.translate(-centerX, -centerY);

      // Draw arena circle with opening on the right side
      ctx.strokeStyle = '#37003C';
      ctx.lineWidth = 4;
      ctx.beginPath();
      // Draw arc with opening - from bottom of opening to top of opening
      ctx.arc(centerX, centerY, arenaRadius, goalOpeningAngle / 2, 2 * Math.PI - goalOpeningAngle / 2);
      ctx.stroke();

      // Draw goal posts at the opening
      const goalPostLength = 25;
      const topPostX = centerX + Math.cos(-goalOpeningAngle / 2) * arenaRadius;
      const topPostY = centerY + Math.sin(-goalOpeningAngle / 2) * arenaRadius;
      const bottomPostX = centerX + Math.cos(goalOpeningAngle / 2) * arenaRadius;
      const bottomPostY = centerY + Math.sin(goalOpeningAngle / 2) * arenaRadius;
      
      ctx.strokeStyle = '#00FF41';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(topPostX, topPostY);
      ctx.lineTo(topPostX + goalPostLength, topPostY);
      ctx.moveTo(bottomPostX, bottomPostY);
      ctx.lineTo(bottomPostX + goalPostLength, bottomPostY);
      ctx.stroke();

      // Restore context
      ctx.restore();

      // Update and draw balls only if game is not paused
      if (!gamePaused) {
        balls.current.forEach((ball, index) => {
          // Update position
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Check if ball has exited the arena
          const dx = ball.x - centerX;
          const dy = ball.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > arenaRadius + ballRadius + 10) {
            // Ball has completely exited the arena
            const angle = Math.atan2(dy, dx);
            
            // Check if ball exited through the goal opening (right side)
            const isInGoalOpening = dx > 0 && Math.abs(angle) <= goalOpeningAngle / 2;
            
            if (isInGoalOpening) {
              console.log(`GOAL! Ball ${index} (team: ${ball.team}) exited through goal opening`);
              
              // Score a goal
              handleGoalScored(ball.team);
              
              // Reset ball position to center area
              ball.x = centerX + (Math.random() - 0.5) * 60;
              ball.y = centerY + (Math.random() - 0.5) * 60;
              ball.vx = (Math.random() - 0.5) * 4;
              ball.vy = (Math.random() - 0.5) * 4;
            } else {
              // Ball exited through the wall, reset position and bounce back
              const resetAngle = Math.atan2(dy, dx);
              ball.x = centerX + Math.cos(resetAngle) * (arenaRadius - ballRadius - 5);
              ball.y = centerY + Math.sin(resetAngle) * (arenaRadius - ballRadius - 5);
              
              // Reverse velocity with some damping
              ball.vx *= -0.8;
              ball.vy *= -0.8;
            }
          } else if (distance >= arenaRadius - ballRadius) {
            // Ball is at the arena boundary
            const angle = Math.atan2(dy, dx);
            
            // Check if ball is in the goal opening area - allow it to pass through
            const isInGoalOpening = dx > 0 && Math.abs(angle) <= goalOpeningAngle / 2;
            
            if (!isInGoalOpening) {
              // Normal wall collision - bounce back
              const collisionAngle = angle;
              
              // Reflect velocity based on collision angle
              const normalX = Math.cos(collisionAngle);
              const normalY = Math.sin(collisionAngle);
              
              // Dot product of velocity and normal
              const dotProduct = ball.vx * normalX + ball.vy * normalY;
              
              // Reflect velocity
              ball.vx = ball.vx - 2 * dotProduct * normalX;
              ball.vy = ball.vy - 2 * dotProduct * normalY;
              
              // Add some randomness and maintain energy
              ball.vx *= 0.9 + Math.random() * 0.2;
              ball.vy *= 0.9 + Math.random() * 0.2;
              
              // Ensure minimum speed
              const newSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
              if (newSpeed < 2) {
                ball.vx = (ball.vx / newSpeed) * 2.5;
                ball.vy = (ball.vy / newSpeed) * 2.5;
              }
              
              // Push ball back inside arena
              ball.x = centerX + Math.cos(collisionAngle) * (arenaRadius - ballRadius - 2);
              ball.y = centerY + Math.sin(collisionAngle) * (arenaRadius - ballRadius - 2);
            }
            // If in goal opening, let the ball continue through without collision
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
        });
      }

      // Draw balls
      balls.current.forEach((ball) => {
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

      // Draw goal notification if active
      if (showGoalNotification && goalScorer) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('GOAL!', centerX, centerY - 20);
        
        ctx.font = 'bold 24px Arial';
        const teamName = goalScorer === 'home' ? match.homeTeam.name : match.awayTeam.name;
        ctx.fillText(teamName, centerX, centerY + 30);
      }

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
  }, [gameStarted, gameEnded, gamePaused, showGoalNotification, goalScorer, match]);

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
              <h3 className="text-lg font-semibold text-purple-700">
                {gamePaused ? 'Goal Celebration!' : 'Match in Progress'}
              </h3>
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
            <p>Club logos bounce around the arena. Score by exiting through the green goal opening!</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
