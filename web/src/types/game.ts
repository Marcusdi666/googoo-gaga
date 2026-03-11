export interface Position {
  x: number;
  y: number;
}

export interface Character {
  id: string;
  name: string;
  faction: 'rebels' | 'galactic_empire';
  color: string;
  speed: number;
  health: number;
}

export interface PlayerState {
  position: Position;
  health: number;
  character: Character;
}

export interface GameState {
  player: PlayerState;
  viewport: {
    width: number;
    height: number;
  };
}

export const CHARACTERS: Record<string, Character> = {
  yoda: {
    id: 'yoda',
    name: 'Yoda',
    faction: 'rebels',
    color: '#00FF00', // Green
    speed: 7,
    health: 120,
  },
  stormtrooper: {
    id: 'stormtrooper',
    name: 'Stormtrooper',
    faction: 'galactic_empire',
    color: '#FFFFFF', // White
    speed: 5,
    health: 100,
  },
};
