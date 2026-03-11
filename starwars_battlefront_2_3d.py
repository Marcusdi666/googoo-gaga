import pygame
import random
import math

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Star Wars: Battlefront 2D - Survival')

# Colors
WHITE = (255, 255, 255)
BLACK = (10, 10, 20)  # Deep space
RED = (220, 50, 50)   # Empire
BLUE = (50, 150, 255) # Rebel
GREEN = (50, 255, 50) # Rebel Lasers
YELLOW = (255, 255, 0)

class Player:
    def __init__(self):
        self.x = WIDTH // 2
        self.y = HEIGHT // 2
        self.radius = 15
        self.speed = 5
        self.health = 100
        self.max_health = 100

    def move(self, keys):
        if keys[pygame.K_LEFT] or keys[pygame.K_a]:
            self.x -= self.speed
        if keys[pygame.K_RIGHT] or keys[pygame.K_d]:
            self.x += self.speed
        if keys[pygame.K_UP] or keys[pygame.K_w]:
            self.y -= self.speed
        if keys[pygame.K_DOWN] or keys[pygame.K_s]:
            self.y += self.speed

        # Keep on screen
        self.x = max(self.radius, min(WIDTH - self.radius, self.x))
        self.y = max(self.radius, min(HEIGHT - self.radius, self.y))

    def draw(self, surface):
        # Draw player
        pygame.draw.circle(surface, BLUE, (int(self.x), int(self.y)), self.radius)
        # Draw health bar
        bar_width = 40
        pygame.draw.rect(surface, RED, (self.x - bar_width//2, self.y - 25, bar_width, 5))
        if self.health > 0:
            pygame.draw.rect(surface, GREEN, (self.x - bar_width//2, self.y - 25, bar_width * (self.health / self.max_health), 5))

class Projectile:
    def __init__(self, x, y, target_x, target_y):
        self.x = x
        self.y = y
        self.speed = 10
        self.radius = 4
        self.color = GREEN
        
        angle = math.atan2(target_y - y, target_x - x)
        self.dx = math.cos(angle) * self.speed
        self.dy = math.sin(angle) * self.speed

    def move(self):
        self.x += self.dx
        self.y += self.dy

    def draw(self, surface):
        pygame.draw.circle(surface, self.color, (int(self.x), int(self.y)), self.radius)

class Enemy:
    def __init__(self):
        # Spawn outside the screen edges
        side = random.choice(['top', 'bottom', 'left', 'right'])
        if side == 'top':
            self.x = random.randint(0, WIDTH)
            self.y = -20
        elif side == 'bottom':
            self.x = random.randint(0, WIDTH)
            self.y = HEIGHT + 20
        elif side == 'left':
            self.x = -20
            self.y = random.randint(0, HEIGHT)
        else:
            self.x = WIDTH + 20
            self.y = random.randint(0, HEIGHT)
            
        self.radius = 15
        self.speed = random.uniform(1.5, 3.0)
        self.health = 20

    def move_towards(self, target_x, target_y):
        angle = math.atan2(target_y - self.y, target_x - self.x)
        self.x += math.cos(angle) * self.speed
        self.y += math.sin(angle) * self.speed

    def draw(self, surface):
        pygame.draw.circle(surface, RED, (int(self.x), int(self.y)), self.radius)

def main():
    clock = pygame.time.Clock()
    player = Player()
    projectiles = []
    enemies = []
    
    score = 0
    font = pygame.font.SysFont(None, 36)
    game_over = False
    
    enemy_spawn_timer = 0
    enemy_spawn_rate = 60  # Frames between spawns

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            elif event.type == pygame.MOUSEBUTTONDOWN and event.button == 1:
                if not game_over:
                    # Shoot towards mouse
                    mx, my = pygame.mouse.get_pos()
                    projectiles.append(Projectile(player.x, player.y, mx, my))
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r and game_over:
                    # Restart game
                    player = Player()
                    projectiles.clear()
                    enemies.clear()
                    score = 0
                    game_over = False
                    enemy_spawn_rate = 60

        if not game_over:
            keys = pygame.key.get_pressed()
            player.move(keys)

            # Spawn enemies periodically
            enemy_spawn_timer += 1
            if enemy_spawn_timer >= enemy_spawn_rate:
                enemies.append(Enemy())
                enemy_spawn_timer = 0
                if enemy_spawn_rate > 20:
                    enemy_spawn_rate -= 0.5  # Increase difficulty over time

            # Update enemies
            for enemy in enemies[:]:
                enemy.move_towards(player.x, player.y)
                
                # Check collision with player
                dist = math.hypot(player.x - enemy.x, player.y - enemy.y)
                if dist < player.radius + enemy.radius:
                    player.health -= 10
                    enemies.remove(enemy)
                    if player.health <= 0:
                        game_over = True

            # Update projectiles
            for proj in projectiles[:]:
                proj.move()
                # Remove if off screen
                if proj.x < 0 or proj.x > WIDTH or proj.y < 0 or proj.y > HEIGHT:
                    projectiles.remove(proj)
                    continue
                
                # Check collision with enemies
                hit = False
                for enemy in enemies[:]:
                    dist = math.hypot(proj.x - enemy.x, proj.y - enemy.y)
                    if dist < proj.radius + enemy.radius:
                        enemy.health -= 20
                        if enemy.health <= 0:
                            enemies.remove(enemy)
                            score += 10
                        hit = True
                        break
                if hit and proj in projectiles:
                    projectiles.remove(proj)

        # Render background
        screen.fill(BLACK)
        
        # Render entities
        for proj in projectiles:
            proj.draw(screen)
            
        for enemy in enemies:
            enemy.draw(screen)
            
        if not game_over:
            player.draw(screen)
            
        # Render UI
        score_text = font.render(f'Score: {score}', True, WHITE)
        screen.blit(score_text, (10, 10))
        
        if game_over:
            game_over_text = font.render('GAME OVER - Press R to Restart', True, YELLOW)
            text_rect = game_over_text.get_rect(center=(WIDTH/2, HEIGHT/2))
            screen.blit(game_over_text, text_rect)

        pygame.display.flip()
        clock.tick(60)

    pygame.quit()

if __name__ == '__main__':
    main()
