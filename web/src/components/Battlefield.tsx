import React, { useRef, useEffect, useMemo, useState } from 'react';
import { GameEngine, type Inputs } from '../engine/GameLoop';
import { type GameState, type ChairState, type GameMode, CHARACTERS } from '../types/game';

interface BattlefieldProps {
  onStateUpdate: (state: GameState) => void;
  selectedCharacterId: string;
}

const Battlefield: React.FC<BattlefieldProps> = ({ onStateUpdate, selectedCharacterId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>('friend');
  const lastLeftClickTimeRef = useRef<number>(0);
  const inputsRef = useRef<Inputs>({ 
    up: false, down: false, left: false, right: false, isSwinging: false,
    isThrowRequested: false, mouseX: 0, mouseY: 0, isDraggingPlayer: false, isDraggingOpponent: false
  });

  // Initial Game State
  const initialGameState: GameState = useMemo(() => {
    const opponentId = selectedCharacterId === 'garfield' ? 'tom' : 'garfield';
    const chairs: ChairState[] = [];
    
    if (gameMode === 'flight') {
      chairs.push({
        id: 'chair1',
        holder: 'player',
        position: { x: 220, y: 300 },
        isFlying: false,
      });
      chairs.push({
        id: 'chair2',
        holder: 'opponent',
        position: { x: 580, y: 300 },
        isFlying: false,
      });
    } else {
      chairs.push({
        id: 'chair1',
        holder: 'player',
        position: { x: 220, y: 300 },
        isFlying: false,
      });
    }

    return {
      player: {
        position: { x: 200, y: 300 },
        health: CHARACTERS[selectedCharacterId].health,
        character: CHARACTERS[selectedCharacterId],
      },
      opponent: {
        position: { x: 600, y: 300 },
        health: CHARACTERS[opponentId].health,
        character: CHARACTERS[opponentId],
      },
      chairs,
      gameMode,
      viewport: { width: 800, height: 600 },
    };
  }, [selectedCharacterId, gameMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) inputsRef.current.up = true;
      if (['ArrowDown', 's', 'S'].includes(e.key)) inputsRef.current.down = true;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) inputsRef.current.left = true;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) inputsRef.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) inputsRef.current.up = false;
      if (['ArrowDown', 's', 'S'].includes(e.key)) inputsRef.current.down = false;
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) inputsRef.current.left = false;
      if (['ArrowRight', 'd', 'D'].includes(e.key)) inputsRef.current.right = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas || !engineRef.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const state = engineRef.current.getState();

      if (e.button === 0) { // Left Click
        const now = performance.now();
        if (now - lastLeftClickTimeRef.current < 300) {
          inputsRef.current.isThrowRequested = true;
          inputsRef.current.isSwinging = false;
        } else {
          const distToPlayer = Math.hypot(x - state.player.position.x, y - state.player.position.y);
          if (distToPlayer < 30) {
            inputsRef.current.isDraggingPlayer = true;
          } else {
            const distToOpponent = Math.hypot(x - state.opponent.position.x, y - state.opponent.position.y);
            if (distToOpponent < 30) {
              inputsRef.current.isDraggingOpponent = true;
            } else {
              inputsRef.current.isSwinging = true;
            }
          }
        }
        lastLeftClickTimeRef.current = now;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      inputsRef.current.mouseX = e.clientX - rect.left;
      inputsRef.current.mouseY = e.clientY - rect.top;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) {
        inputsRef.current.isThrowRequested = false;
        inputsRef.current.isDraggingPlayer = false;
        inputsRef.current.isDraggingOpponent = false;
        inputsRef.current.isSwinging = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    engineRef.current = new GameEngine(initialGameState);

    let animationId: number;
    const loop = (now: number) => {
      if (engineRef.current && ctx) {
        const state = engineRef.current.update(inputsRef.current, now);
        engineRef.current.render(ctx, state);
        onStateUpdate(state);
      }
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [initialGameState, onStateUpdate]);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div className="mode-selector" style={{ display: 'flex', gap: '10px' }}>
        <button 
          className={`mode-btn ${gameMode === 'flight' ? 'active' : ''}`}
          onClick={() => setGameMode('flight')}
          style={{ 
            padding: '8px 16px', 
            background: gameMode === 'flight' ? '#EE4B2B' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          FLIGHT (2 Chairs)
        </button>
        <button 
          className={`mode-btn ${gameMode === 'friend' ? 'active' : ''}`}
          onClick={() => setGameMode('friend')}
          style={{ 
            padding: '8px 16px', 
            background: gameMode === 'friend' ? '#4CAF50' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          FRIEND (1 Chair)
        </button>
      </div>
      <div style={{ position: 'relative', border: '2px solid #333' }}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={600} 
          style={{ display: 'block' }}
        />
      </div>
    </div>
  );
};

export default Battlefield;