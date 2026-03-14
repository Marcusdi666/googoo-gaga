export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  name: string;
  team: 'orange_cats' | 'grey_cats';
  color: string;
  speed: number;
  health: number;
}

export interface PlayerState {
  position: Position;
  health: number;
  character: Character;
}

export type GameMode = 'flight' | 'friend';

export interface ChairState {
  id: string;
  holder: 'player' | 'opponent' | 'none';
  position: Position;
  isFlying: boolean;
  velocity?: { x: number; y: number };
  throwCooldown?: number;
}

export interface GameState {
  player: PlayerState;
  opponent: PlayerState;
  chairs: ChairState[];
  gameMode: GameMode;
  viewport: {
    width: number;
    height: number;
  };
}

export const CHARACTERS: Record<string, Character> = {
  garfield: {
    id: 'garfield',
    name: 'Garfield',
    team: 'orange_cats',
    color: '#FF8C00', // DarkOrange
    speed: 4,
    health: 150,
  },
  tom: {
    id: 'tom',
    name: 'Tom',
    team: 'grey_cats',
    color: '#808080', // Grey
    speed: 6,
    health: 120,
  },
};
