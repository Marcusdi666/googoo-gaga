import React, { useRef, useEffect, useMemo } from 'react';
import { GameEngine, type Inputs } from '../engine/GameLoop';
import { type GameState, CHARACTERS } from '../types/game';

interface BattlefieldProps {
  onStateUpdate: (state: GameState) => void;
  selectedCharacterId: string;
}

const Battlefield: React.FC<BattlefieldProps> = ({ onStateUpdate, selectedCharacterId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputsRef = useRef<Inputs>({ up: false, down: false, left: false, right: false });

  // Initial Game State
  const initialGameState: GameState = useMemo(() => ({
    player: {
      position: { x: 400, y: 300 },
      health: CHARACTERS[selectedCharacterId].health,
      character: CHARACTERS[selectedCharacterId],
    },
    viewport: { width: 800, height: 600 },
  }), [selectedCharacterId]);

  useEffect(() => {
    // Setup inputs
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

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create or reset engine
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
    <div style={{ position: 'relative', border: '2px solid #333' }}>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        style={{ display: 'block' }}
      />
    </div>
  );
};

export default Battlefield;
