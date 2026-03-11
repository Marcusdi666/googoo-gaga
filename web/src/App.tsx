import { useState, useCallback } from 'react'
import Battlefield from './components/Battlefield'
import { GameState, CHARACTERS } from './types/game'
import './App.css'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState('yoda')
  const [gameState, setGameState] = useState<GameState | null>(null)

  const handleStateUpdate = useCallback((state: GameState) => {
    setGameState(state)
  }, [])

  return (
    <div className="game-container">
      {!isPlaying ? (
        <div className="menu-screen">
          <h1 className="title">STAR WARS</h1>
          <h2 className="subtitle">BATTLEFRONT PROTO</h2>
          
          <div className="character-selector">
            <h3>SELECT YOUR WARRIOR</h3>
            <div className="character-grid">
              {Object.values(CHARACTERS).map((char) => (
                <div 
                  key={char.id}
                  className={`character-card ${selectedCharacter === char.id ? 'active' : ''}`}
                  onClick={() => setSelectedCharacter(char.id)}
                  style={{ borderColor: char.color }}
                >
                  <div className="char-name">{char.name}</div>
                  <div className="char-faction">{char.faction.replace('_', ' ').toUpperCase()}</div>
                  <div className="char-stats">
                    HP: {char.health} | SPEED: {char.speed}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="start-btn" onClick={() => setIsPlaying(true)}>
            COMMENCE BATTLE
          </button>
        </div>
      ) : (
        <div className="battlefield-container">
          <div className="hud">
            <div className="hud-left">
              <div className="player-hp">
                <div className="label">HEALTH</div>
                <div className="hp-bar-outer">
                  <div 
                    className="hp-bar-inner" 
                    style={{ 
                      width: `${(gameState?.player.health || 0) / (gameState?.player.character.health || 1) * 100}%`,
                      backgroundColor: gameState?.player.character.color
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="hud-center">
              <div className="team-indicator">
                {gameState?.player.character.faction.toUpperCase()}
              </div>
            </div>

            <div className="hud-right">
              <button className="quit-btn" onClick={() => setIsPlaying(false)}>
                WITHDRAW
              </button>
            </div>
          </div>

          <Battlefield 
            onStateUpdate={handleStateUpdate} 
            selectedCharacterId={selectedCharacter}
          />

          <div className="controls-hint">
            USE ARROW KEYS OR WASD TO MOVE
          </div>
        </div>
      )}
    </div>
  )
}

export default App
