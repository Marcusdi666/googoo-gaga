# Star Wars Battlefront 2 Style Game

## Overview
This is a real-time multiplayer game inspired by Star Wars Battlefront 2 featuring the Rebel Alliance and Galactic Empire teams.

## Key Features
- **Multiple Players:** Players can spawn on various locations on the battlefield.
- **Projectile Combat:** Engage in intense battles using projectiles.
- **Health Pickups:** Collect health items to sustain gameplay.
- **Objective-Based Gameplay:** Complete various objectives to win the game.

## Game Setup
1. Initialize game client and server.
2. Set up teams - Rebel Alliance and Galactic Empire.
3. Allow players to choose their team and spawn at designated locations.

## Game Loop
- Listen for player actions (move, shoot, pickup).
- Update game state (player health, positions, objectives).
- Render the game scene based on the current game state.

## Sample Code Snippet
```python
class Player:
    def __init__(self, name, team):
        self.name = name
        self.team = team
        self.health = 100
        self.position = (0, 0)

    def move(self, new_position):
        self.position = new_position

    def shoot(self, target):
        if self.team != target.team:
            target.health -= 20
            if target.health <= 0:
                print(f'{target.name} is eliminated!')

# Initialize players
player1 = Player('Luke', 'Rebel')
player2 = Player('Vader', 'Empire')

# Sample gameplay
player1.move((1, 1))
player1.shoot(player2)
```