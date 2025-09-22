import pygame
import random
import math

# Configuración del laberinto
CELL_SIZE = 40
GRID_WIDTH = 15
GRID_HEIGHT = 15
FPS = 60
MOVE_DELAY = 100  # ms entre pasos mientras se mantiene pulsada una tecla

# Colores
WALL_COLOR = (46, 46, 46)        # #2e2e2e
PATH_COLOR = (229, 229, 229)     # #e5e5e5
PLAYER_COLOR = WALL_COLOR
GOAL_COLOR = PATH_COLOR
TEXT_COLOR = (50, 50, 50)
BG_COLOR = WALL_COLOR

# Inicializar Pygame
pygame.init()
screen = pygame.display.set_mode((0, 0), pygame.FULLSCREEN)
SCREEN_WIDTH, SCREEN_HEIGHT = screen.get_size()
clock = pygame.time.Clock()
font = pygame.font.SysFont("Arial", 24, bold=True)

# Posición de inicio para centrar el laberinto
offset_x = (SCREEN_WIDTH - GRID_WIDTH * CELL_SIZE) // 2
offset_y = (SCREEN_HEIGHT - GRID_HEIGHT * CELL_SIZE - 50) // 2

# Generar laberinto con DFS recursivo
def generate_maze(width, height):
    maze = [[1 for _ in range(width)] for _ in range(height)]
    stack = []
    start_x, start_y = 0, 0
    maze[start_y][start_x] = 0
    stack.append((start_x, start_y))

    while stack:
        x, y = stack[-1]
        neighbors = []

        directions = [(-2, 0), (2, 0), (0, -2), (0, 2)]
        random.shuffle(directions)

        for dx, dy in directions:
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and maze[ny][nx] == 1:
                neighbors.append((nx, ny, dx, dy))

        if neighbors:
            nx, ny, dx, dy = random.choice(neighbors)
            maze[ny][nx] = 0
            maze[y + dy//2][x + dx//2] = 0
            stack.append((nx, ny))
        else:
            stack.pop()

    return maze

# Dibujar jugador circular
def draw_player(x, y):
    center = (offset_x + x*CELL_SIZE + CELL_SIZE//2, offset_y + y*CELL_SIZE + CELL_SIZE//2)
    radius = CELL_SIZE//2 - 5
    pygame.draw.circle(screen, PLAYER_COLOR, center, radius)

# Dibujar objetivo circular con borde
def draw_goal(x, y):
    center = (offset_x + x*CELL_SIZE + CELL_SIZE//2, offset_y + y*CELL_SIZE + CELL_SIZE//2)
    radius = CELL_SIZE//2 - 5
    pygame.draw.circle(screen, GOAL_COLOR, center, radius)
    pygame.draw.circle(screen, WALL_COLOR, center, radius, 3)  # borde fino

# Comprobar vecinos para bordes redondeados en paths
def get_path_border_radius(maze, x, y):
    radius = 10
    neighbors = [
        maze[y-1][x] if y > 0 else 1,
        maze[y+1][x] if y < GRID_HEIGHT-1 else 1,
        maze[y][x-1] if x > 0 else 1,
        maze[y][x+1] if x < GRID_WIDTH-1 else 1
    ]
    # Solo redondeamos esquinas expuestas
    if neighbors[0] == 1 and neighbors[2] == 1:
        return radius
    if neighbors[0] == 1 and neighbors[3] == 1:
        return radius
    if neighbors[1] == 1 and neighbors[2] == 1:
        return radius
    if neighbors[1] == 1 and neighbors[3] == 1:
        return radius
    return 0
    

# Dibujar laberinto con bordes redondeados en paths
def draw_maze(maze):
    for y in range(GRID_HEIGHT):
        for x in range(GRID_WIDTH):
            if maze[y][x] == 0:
                radius = get_path_border_radius(maze, x, y)
                pygame.draw.rect(screen, PATH_COLOR,
                                 (offset_x + x*CELL_SIZE, offset_y + y*CELL_SIZE, CELL_SIZE, CELL_SIZE),
                                 border_radius=radius)
            else:
                pygame.draw.rect(screen, WALL_COLOR,
                                 (offset_x + x*CELL_SIZE, offset_y + y*CELL_SIZE, CELL_SIZE, CELL_SIZE))

# Variables del juego
player_x, player_y = 0, 0
goal_x, goal_y = GRID_WIDTH - 1, GRID_HEIGHT - 1
maze = generate_maze(GRID_WIDTH, GRID_HEIGHT)
mazes_completed = 0
t = 0
last_move = pygame.time.get_ticks()
move_dir = None

# Bucle principal
running = True
while running:
    clock.tick(FPS)
    keys = pygame.key.get_pressed()
    current_time = pygame.time.get_ticks()

    # Movimiento continuo
    if current_time - last_move > MOVE_DELAY:
        if keys[pygame.K_LEFT]:
            move_dir = "LEFT"
        elif keys[pygame.K_RIGHT]:
            move_dir = "RIGHT"
        elif keys[pygame.K_UP]:
            move_dir = "UP"
        elif keys[pygame.K_DOWN]:
            move_dir = "DOWN"

        if move_dir == "LEFT" and player_x > 0 and maze[player_y][player_x - 1] == 0:
            player_x -= 1
            last_move = current_time
        elif move_dir == "RIGHT" and player_x < GRID_WIDTH - 1 and maze[player_y][player_x + 1] == 0:
            player_x += 1
            last_move = current_time
        elif move_dir == "UP" and player_y > 0 and maze[player_y - 1][player_x] == 0:
            player_y -= 1
            last_move = current_time
        elif move_dir == "DOWN" and player_y < GRID_HEIGHT - 1 and maze[player_y + 1][player_x] == 0:
            player_y += 1
            last_move = current_time

    # Eventos
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.KEYDOWN:
            if event.key == pygame.K_ESCAPE:
                running = False

    # Comprobar si ha llegado al objetivo
    if player_x == goal_x and player_y == goal_y:
        mazes_completed += 1
        maze = generate_maze(GRID_WIDTH, GRID_HEIGHT)
        player_x, player_y = 0, 0
        goal_x, goal_y = GRID_WIDTH - 1, GRID_HEIGHT - 1

    # Dibujar
    screen.fill(BG_COLOR)
    draw_maze(maze)
    draw_goal(goal_x, goal_y)
    draw_player(player_x, player_y)
    text = font.render(f"Laberintos completados: {mazes_completed}", True, TEXT_COLOR)
    screen.blit(text, (offset_x, SCREEN_HEIGHT - 40))

    pygame.display.flip()

pygame.quit()
