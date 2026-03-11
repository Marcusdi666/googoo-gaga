import { type GameState, type Position } from '../types/game';

export interface Inputs {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

export class GameEngine {
  private state: GameState;
  private lastUpdate: number;

  constructor(initialState: GameState) {
    this.state = initialState;
    this.lastUpdate = performance.now();
  }

  public update(inputs: Inputs, now: number): GameState {
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    const { player, viewport } = this.state;
    const { speed } = player.character;
    
    // Normalize speed (assuming 60fps constant for simplicity, but dt is available for frame-independent movement)
    const baseSpeed = speed * 40; // Scale speed for canvas pixels/sec

    const newPosition: Position = { ...player.position };

    if (inputs.up) newPosition.y -= baseSpeed * dt;
    if (inputs.down) newPosition.y += baseSpeed * dt;
    if (inputs.left) newPosition.x -= baseSpeed * dt;
    if (inputs.right) newPosition.x += baseSpeed * dt;

    // Boundary check
    newPosition.x = Math.max(0, Math.min(viewport.width, newPosition.x));
    newPosition.y = Math.max(0, Math.min(viewport.height, newPosition.y));

    this.state = {
      ...this.state,
      player: {
        ...player,
        position: newPosition,
      },
    };

    return this.state;
  }

  public render(ctx: CanvasRenderingContext2D, state: GameState) {
    const { player } = state;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);

    // Draw grid (minimal background)
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    for (let x = 0; x < state.viewport.width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, state.viewport.height);
      ctx.stroke();
    }
    for (let y = 0; y < state.viewport.height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(state.viewport.width, y);
      ctx.stroke();
    }

    // Draw player
    ctx.fillStyle = player.character.color;
    ctx.beginPath();
    ctx.arc(player.position.x, player.position.y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Add glow effect based on faction
    ctx.shadowBlur = 10;
    ctx.shadowColor = player.character.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  public getState(): GameState {
    return this.state;
  }

  public setState(newState: GameState) {
    this.state = newState;
  }
}
