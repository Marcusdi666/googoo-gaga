import { type GameState, type Position, type ChairState } from '../types/game';

export interface Inputs {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  isSwinging: boolean;
  isThrowRequested: boolean;
  mouseX: number;
  mouseY: number;
  isDraggingPlayer: boolean;
  isDraggingOpponent: boolean;
}

export class GameEngine {
  private state: GameState;
  private lastUpdate: number;
  private swingTimer: number = 0;
  private isSwinging: boolean = false;

  constructor(initialState: GameState) {
    this.state = initialState;
    this.lastUpdate = performance.now();
  }

  public update(inputs: Inputs, now: number): GameState {
    const dt = (now - this.lastUpdate) / 1000;
    this.lastUpdate = now;

    const { player, opponent, chairs, viewport } = this.state;
    
    let newPlayerPos: Position = { ...player.position };
    let newOpponentPos: Position = { ...opponent.position };
    let newChairs = chairs.map(c => ({ ...c }));

    // Handle Dragging
    if (inputs.isDraggingPlayer) {
      newPlayerPos = { x: inputs.mouseX, y: inputs.mouseY };
    } else {
      const playerSpeed = player.character.speed * 40; 
      if (inputs.up) newPlayerPos.y -= playerSpeed * dt;
      if (inputs.down) newPlayerPos.y += playerSpeed * dt;
      if (inputs.left) newPlayerPos.x -= playerSpeed * dt;
      if (inputs.right) newPlayerPos.x += playerSpeed * dt;
    }

    if (inputs.isDraggingOpponent) {
      newOpponentPos = { x: inputs.mouseX, y: inputs.mouseY };
    }

    // Boundary checks
    newPlayerPos.x = Math.max(0, Math.min(viewport.width, newPlayerPos.x));
    newPlayerPos.y = Math.max(0, Math.min(viewport.height, newPlayerPos.y));
    newOpponentPos.x = Math.max(0, Math.min(viewport.width, newOpponentPos.x));
    newOpponentPos.y = Math.max(0, Math.min(viewport.height, newOpponentPos.y));

    // Handle Chair Throw Logic
    if (inputs.isThrowRequested) {
      // Find a chair held by the player or opponent to throw
      // In flight mode, we might throw the one being clicked. For now, let's pick the first available held chair.
      const heldChair = newChairs.find(c => !c.isFlying && c.holder !== 'none');
      
      if (heldChair) {
        const holder = heldChair.holder;
        const throwerPos = holder === 'player' ? newPlayerPos : newOpponentPos;
        const targetPos = holder === 'player' ? newOpponentPos : newPlayerPos;
        
        const dx = targetPos.x - throwerPos.x;
        const dy = targetPos.y - throwerPos.y;
        const dist = Math.hypot(dx, dy);
        
        heldChair.isFlying = true;
        heldChair.holder = 'none';
        heldChair.position = { ...throwerPos };
        heldChair.velocity = { x: (dx / dist) * 800, y: (dy / dist) * 800 };
        heldChair.throwCooldown = 0.2;
      }
    }

    // Update Chairs
    newChairs.forEach(chair => {
      if (chair.isFlying && chair.velocity) {
        chair.position.x += chair.velocity.x * dt;
        chair.position.y += chair.velocity.y * dt;
        
        if (chair.throwCooldown && chair.throwCooldown > 0) {
          chair.throwCooldown -= dt;
        }

        const distToPlayer = Math.hypot(chair.position.x - newPlayerPos.x, chair.position.y - newPlayerPos.y);
        const distToOpponent = Math.hypot(chair.position.x - newOpponentPos.x, chair.position.y - newOpponentPos.y);

        if (!chair.throwCooldown || chair.throwCooldown <= 0) {
          if (distToPlayer < 30) {
            chair.isFlying = false;
            chair.holder = 'player';
            chair.velocity = undefined;
          } else if (distToOpponent < 30) {
            chair.isFlying = false;
            chair.holder = 'opponent';
            chair.velocity = undefined;
          }
        }

        if (chair.position.x < 0 || chair.position.x > viewport.width || 
            chair.position.y < 0 || chair.position.y > viewport.height) {
          chair.isFlying = false;
          chair.velocity = undefined;
        }
      }
    });

    // Swing logic
    if (inputs.isSwinging && !this.isSwinging) {
      if (newChairs.some(c => c.holder === 'player')) {
        this.isSwinging = true;
        this.swingTimer = 0.3;
      }
    }
    if (this.isSwinging) {
      this.swingTimer -= dt;
      if (this.swingTimer <= 0) this.isSwinging = false;
    }

    this.state = {
      ...this.state,
      player: { ...player, position: newPlayerPos },
      opponent: { ...opponent, position: newOpponentPos },
      chairs: newChairs
    };

    return this.state;
  }

  private drawChair(ctx: CanvasRenderingContext2D, pos: Position, rotation: number) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(rotation);
    
    // 1. Metal Frame (Legs) - Light Grey
    ctx.strokeStyle = '#D3D3D3';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -10, 20, 20); 
    
    // 2. Plastic Seat - Vibrant Red (School chair look)
    ctx.fillStyle = '#EE4B2B'; 
    ctx.fillRect(-10, -8, 18, 18);
    
    // 3. Prominent Backrest - Vibrant Red
    ctx.fillStyle = '#EE4B2B';
    ctx.fillRect(-10, -28, 4, 20); 
    ctx.fillRect(-12, -30, 2, 24); 
    
    // 4. Student Tablet Arm (Small side desk) - Bright Wood
    ctx.fillStyle = '#DEB887'; // BurlyWood (lighter wood)
    ctx.fillRect(-5, -15, 15, 8);
    
    ctx.restore();
  }

  public render(ctx: CanvasRenderingContext2D, state: GameState) {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, state.viewport.width, state.viewport.height);

    // Draw background grid
    ctx.strokeStyle = '#2a2a2a'; ctx.lineWidth = 1;
    for (let x = 0; x < state.viewport.width; x += 40) {
      for (let y = 0; y < state.viewport.height; y += 40) { ctx.strokeRect(x, y, 40, 40); }
    }

    // Render all chairs
    state.chairs.forEach(chair => {
      if (chair.isFlying) {
        this.drawChair(ctx, chair.position, performance.now() / 100);
      } else if (chair.holder === 'none') {
        this.drawChair(ctx, chair.position, 0);
      } else if (chair.holder === 'player') {
        const rot = this.isSwinging ? (0.3 - this.swingTimer) * 25 : 0;
        this.drawChair(ctx, { x: state.player.position.x + 20, y: state.player.position.y }, rot);
      } else if (chair.holder === 'opponent') {
        this.drawChair(ctx, { x: state.opponent.position.x + 20, y: state.opponent.position.y }, 0);
      }
    });

    this.drawCat(ctx, state.player.position, state.player.character.color, false, 0);
    this.drawCat(ctx, state.opponent.position, state.opponent.character.color, false, 0);
  }

  private drawCat(ctx: CanvasRenderingContext2D, pos: Position, color: string, isSwinging: boolean, swingTimer: number) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    // Tail
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-15, 5); ctx.quadraticCurveTo(-25, 15, -20, 0); ctx.stroke();
    // Body
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, 0, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
    // Head
    ctx.beginPath(); ctx.arc(16, -6, 11, 0, Math.PI * 2); ctx.fill();
    // Ears
    ctx.beginPath(); ctx.moveTo(10, -14); ctx.lineTo(14, -24); ctx.lineTo(18, -14); ctx.fill();
    ctx.beginPath(); ctx.moveTo(18, -14); ctx.lineTo(22, -24); ctx.lineTo(26, -14); ctx.fill();
    // Eyes
    ctx.fillStyle = 'white'; ctx.beginPath(); ctx.arc(19, -8, 3, 0, Math.PI * 2); ctx.arc(24, -8, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'black'; ctx.beginPath(); ctx.arc(20, -8, 1.5, 0, Math.PI * 2); ctx.arc(25, -8, 1.5, 0, Math.PI * 2); ctx.fill();
    // Whiskers
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.beginPath();
    ctx.moveTo(25, -4); ctx.lineTo(35, -6); ctx.moveTo(25, -2); ctx.lineTo(35, -2); ctx.moveTo(25, 0); ctx.lineTo(35, 2);
    ctx.stroke();
    ctx.restore();
  }

  public getState(): GameState {
    return this.state;
  }

  public setState(newState: GameState) {
    this.state = newState;
  }
}