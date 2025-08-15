/**
 * UTILS.JS - Helper Functions and Constants
 * 
 * This file contains utility functions and constants used throughout the game.
 * Updated for maze-based puzzle system.
 */

// ===========================
// GAME CONSTANTS
// ===========================

const GAME_CONFIG = {
    // Maze dimensions
    DEFAULT_GRID_WIDTH: 15,     
    DEFAULT_GRID_HEIGHT: 15,    
    MIN_GRID_SIZE: 5,           
    MAX_GRID_SIZE: 25,          
    
    // Simple cell size
    CELL_SIZE: 24,              // Pixels per maze cell
    PATH_WIDTH: 6,              // Width of drawn path
    
    // Simple colors
    COLORS: {
        BACKGROUND: '#1a1a2e',
        WALL: '#16213e',
        PATH_AVAILABLE: '#e3f2fd',
        PATH_DRAWN: '#2196f3',
        START_POINT: '#4caf50',
        END_POINT: '#f44336'
    },
    
    // Movement settings
    MOVEMENT_RESOLUTION: 10,    // How many movement points per visual cell
    FOLLOW_SPEED: 20           
};

// ===========================
// MAZE CELL TYPES
// ===========================

const CELL_TYPES = {
    WALL: 0,
    PATH: 1,
    START: 2,
    END: 3
};

// ===========================
// DIRECTIONS
// ===========================

const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
};

// ===========================
// COORDINATE UTILITIES
// ===========================

/**
 * Simple coordinate conversion functions
 */

// Convert grid coordinates to pixel coordinates
function gridToPixel(gridX, gridY) {
    return {
        x: gridX * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
        y: gridY * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2
    };
}

// Convert pixel coordinates to movement grid coordinates (for smooth movement)
function pixelToGrid(pixelX, pixelY) {
    const gridX = Math.round(pixelX / (GAME_CONFIG.CELL_SIZE / GAME_CONFIG.MOVEMENT_RESOLUTION));
    const gridY = Math.round(pixelY / (GAME_CONFIG.CELL_SIZE / GAME_CONFIG.MOVEMENT_RESOLUTION));
    
    return { x: gridX, y: gridY };
}

// Get valid adjacent cells for maze pathfinding (4 directions only)
function getValidAdjacentCells(x, y, maze) {
    const adjacent = [];
    const width = maze[0].length;
    const height = maze.length;
    
    // Check 4 directions: up, right, down, left
    const directions = [
        { x: 0, y: -1 }, // Up
        { x: 1, y: 0 },  // Right
        { x: 0, y: 1 },  // Down
        { x: -1, y: 0 }  // Left
    ];
    
    directions.forEach(dir => {
        const newX = x + dir.x;
        const newY = y + dir.y;
        
        if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
            if (maze[newY][newX] === CELL_TYPES.PATH || 
                maze[newY][newX] === CELL_TYPES.START ||
                maze[newY][newX] === CELL_TYPES.END) {
                adjacent.push({ x: newX, y: newY });
            }
        }
    });
    
    return adjacent;
}

// Get valid adjacent cells for movement (8 directions for smooth movement)
function getValidAdjacentMovementCells(movementX, movementY, visualMaze) {
    const adjacent = [];
    
    // Check 8 directions
    const directions = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 },                   { x: 1, y: 0 },
        { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
    ];
    
    directions.forEach(dir => {
        const newMovementX = movementX + dir.x;
        const newMovementY = movementY + dir.y;
        
        // Convert to visual coordinates to check maze
        const visualX = Math.floor(newMovementX / GAME_CONFIG.MOVEMENT_RESOLUTION);
        const visualY = Math.floor(newMovementY / GAME_CONFIG.MOVEMENT_RESOLUTION);
        
        // Check bounds and if visual cell is passable
        if (visualX >= 0 && visualX < visualMaze[0].length && 
            visualY >= 0 && visualY < visualMaze.length) {
            
            if (visualMaze[visualY][visualX] === CELL_TYPES.PATH || 
                visualMaze[visualY][visualX] === CELL_TYPES.START ||
                visualMaze[visualY][visualX] === CELL_TYPES.END) {
                
                adjacent.push({ x: newMovementX, y: newMovementY });
            }
        }
    });
    
    return adjacent;
}

// ===========================
// MAZE UTILITIES
// ===========================

/**
 * Checks if two points are adjacent (neighbors)
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {boolean} - True if points are adjacent
 */
function areAdjacent(point1, point2) {
    const dx = Math.abs(point1.x - point2.x);
    const dy = Math.abs(point1.y - point2.y);
    
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * Checks if two points are the same
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {boolean} - True if points are identical
 */
function pointsEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}

/**
 * Gets valid adjacent cells in a movement grid based on visual maze
 * @param {number} movementX - Movement grid X coordinate
 * @param {number} movementY - Movement grid Y coordinate
 * @param {Array} visualMaze - 2D visual maze array
 * @returns {Array} - Array of valid adjacent movement positions
 */
function getValidAdjacentMovementCells(movementX, movementY, visualMaze) {
    const adjacent = [];
    
    // Check all 8 directions for smooth movement
    const directions = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },
        { x: -1, y: 0 },                   { x: 1, y: 0 },
        { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }
    ];
    
    directions.forEach(dir => {
        const newMovementX = movementX + dir.x;
        const newMovementY = movementY + dir.y;
        
        // Convert to visual coordinates to check maze
        const visualPos = movementToVisualGrid(newMovementX, newMovementY);
        
        // Check bounds
        if (visualPos.x >= 0 && visualPos.x < visualMaze[0].length && 
            visualPos.y >= 0 && visualPos.y < visualMaze.length) {
            
            // Check if visual cell is passable
            if (visualMaze[visualPos.y][visualPos.x] === CELL_TYPES.PATH || 
                visualMaze[visualPos.y][visualPos.x] === CELL_TYPES.START ||
                visualMaze[visualPos.y][visualPos.x] === CELL_TYPES.END) {
                
                adjacent.push({ x: newMovementX, y: newMovementY });
            }
        }
    });
    
    return adjacent;
}

/**
 * Finds the closest valid movement cell to mouse position
 * @param {number} mouseX - Mouse X coordinate
 * @param {number} mouseY - Mouse Y coordinate
 * @param {Object} currentPos - Current movement position
 * @param {Array} visualMaze - 2D visual maze array
 * @returns {Object|null} - Closest valid movement position or null
 */
function findClosestMovementCell(mouseX, mouseY, currentPos, visualMaze) {
    const mouseMovement = pixelToMovementGrid(mouseX, mouseY);
    const validAdjacent = getValidAdjacentMovementCells(currentPos.x, currentPos.y, visualMaze);
    
    if (validAdjacent.length === 0) return null;
    
    // Find the adjacent cell closest to mouse position
    let closest = validAdjacent[0];
    let minDistance = getDistance(mouseMovement, closest);
    
    for (let i = 1; i < validAdjacent.length; i++) {
        const distance = getDistance(mouseMovement, validAdjacent[i]);
        if (distance < minDistance) {
            minDistance = distance;
            closest = validAdjacent[i];
        }
    }
    
    return closest;
}

/**
 * Calculates distance between two points
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {number} - Distance between points
 */
function getDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ===========================
// MAZE GENERATION
// ===========================

/**
 * Generates a random maze using recursive backtracking
 * @param {number} width - Maze width
 * @param {number} height - Maze height
 * @returns {Array} - 2D array representing the maze
 */
function generateMaze(width, height) {
    // Initialize maze with all walls
    const maze = [];
    for (let y = 0; y < height; y++) {
        maze[y] = [];
        for (let x = 0; x < width; x++) {
            maze[y][x] = CELL_TYPES.WALL;
        }
    }
    
    // Recursive backtracking algorithm
    const stack = [];
    const startX = 1;
    const startY = 1;
    
    maze[startY][startX] = CELL_TYPES.PATH;
    stack.push({ x: startX, y: startY });
    
    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getUnvisitedNeighbors(current.x, current.y, maze);
        
        if (neighbors.length > 0) {
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            
            // Remove wall between current and next
            const wallX = current.x + (next.x - current.x) / 2;
            const wallY = current.y + (next.y - current.y) / 2;
            
            maze[wallY][wallX] = CELL_TYPES.PATH;
            maze[next.y][next.x] = CELL_TYPES.PATH;
            
            stack.push(next);
        } else {
            stack.pop();
        }
    }
    
    return maze;
}

/**
 * Gets unvisited neighbors for maze generation
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} maze - 2D maze array
 * @returns {Array} - Array of unvisited neighbor positions
 */
function getUnvisitedNeighbors(x, y, maze) {
    const neighbors = [];
    const width = maze[0].length;
    const height = maze.length;
    
    // Check all four directions (skip by 2 for maze generation)
    const directions = [
        { x: 0, y: -2 }, // Up
        { x: 2, y: 0 },  // Right
        { x: 0, y: 2 },  // Down
        { x: -2, y: 0 }  // Left
    ];
    
    directions.forEach(dir => {
        const newX = x + dir.x;
        const newY = y + dir.y;
        
        if (newX > 0 && newX < width - 1 && newY > 0 && newY < height - 1) {
            if (maze[newY][newX] === CELL_TYPES.WALL) {
                neighbors.push({ x: newX, y: newY });
            }
        }
    });
    
    return neighbors;
}

/**
 * Places random start and end points in the maze
 * @param {Array} maze - 2D maze array
 * @returns {Object} - {start: {x, y}, end: {x, y}}
 */
function placeStartAndEnd(maze) {
    const pathCells = [];
    
    // Find all path cells
    for (let y = 0; y < maze.length; y++) {
        for (let x = 0; x < maze[y].length; x++) {
            if (maze[y][x] === CELL_TYPES.PATH) {
                pathCells.push({ x, y });
            }
        }
    }
    
    // Choose random start and end points (ensure they're far apart)
    const start = pathCells[Math.floor(Math.random() * pathCells.length)];
    let end;
    let maxDistance = 0;
    
    // Find the farthest point from start
    pathCells.forEach(cell => {
        const distance = getDistance(start, cell);
        if (distance > maxDistance) {
            maxDistance = distance;
            end = cell;
        }
    });
    
    // Set start and end in maze
    maze[start.y][start.x] = CELL_TYPES.START;
    maze[end.y][end.x] = CELL_TYPES.END;
    
    return { start, end };
}

// ===========================
// DOM UTILITIES
// ===========================

/**
 * Updates the status message display
 * @param {string} message - Message to display
 * @param {string} className - CSS class for styling ('success', 'error', or '')
 */
function updateStatus(message, className = '') {
    const statusDiv = document.getElementById('status');
    if (statusDiv) {
        const textElement = statusDiv.querySelector('.status-text');
        if (textElement) {
            textElement.textContent = message;
        }
        statusDiv.className = 'status-content ' + className;
    }
}

/**
 * Gets mouse/touch position relative to canvas
 * @param {Event} event - Mouse or touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Object} - {x, y} coordinates relative to canvas
 */
function getEventPosition(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// ===========================
// DEBUGGING UTILITIES
// ===========================

/**
 * Logs game state information for debugging
 * @param {string} context - Context of the log (e.g., "Path Drawing")
 * @param {Object} data - Data to log
 */
function debugLog(context, data) {
    if (window.DEBUG_MODE) {
        // Skip logging click events to avoid interference
        if (context === 'Click') return;
        
        console.log(`[${context}]`, data);
    }
}

// Enable debug mode by setting this in browser console: window.DEBUG_MODE = true;
window.DEBUG_MODE = false;