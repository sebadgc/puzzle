/**
 * PUZZLE.JS - Maze Puzzle Generation and Validation
 * 
 * This module handles:
 * - Generating random mazes with configurable sizes
 * - Placing start and end points
 * - Validating maze solutions
 * - Managing puzzle difficulty progression
 */

// ===========================
// PUZZLE CLASS
// ===========================

class MazePuzzle {
    constructor(width = GAME_CONFIG.DEFAULT_GRID_WIDTH, height = GAME_CONFIG.DEFAULT_GRID_HEIGHT) {
        this.width = width;
        this.height = height;
        this.maze = null;
        this.startPoint = null;
        this.endPoint = null;
        this.solution = null;
        
        this.generate();
    }
    
    /**
     * Generates a new maze puzzle
     */
    generate() {
        // Ensure odd dimensions for proper maze generation
        const mazeWidth = this.width % 2 === 0 ? this.width + 1 : this.width;
        const mazeHeight = this.height % 2 === 0 ? this.height + 1 : this.height;
        
        // Generate the maze
        this.maze = generateMaze(mazeWidth, mazeHeight);
        
        // Place start and end points
        const points = placeStartAndEnd(this.maze);
        this.startPoint = points.start;
        this.endPoint = points.end;
        
        // Calculate solution path for validation
        this.solution = this.findOptimalPath();
        
        debugLog('Maze Generated', {
            size: `${mazeWidth}x${mazeHeight}`,
            start: this.startPoint,
            end: this.endPoint,
            solutionLength: this.solution ? this.solution.length : 0
        });
    }
    
    /**
     * Finds the optimal path from start to end using A* algorithm
     * @returns {Array|null} - Array of {x, y} coordinates or null if no path
     */
    findOptimalPath() {
        return this.findPath(this.startPoint, this.endPoint);
    }
    
    /**
     * Finds a path between two points using A* pathfinding
     * @param {Object} start - Start position {x, y}
     * @param {Object} end - End position {x, y}
     * @returns {Array|null} - Path as array of coordinates or null
     */
    findPath(start, end) {
        const openSet = [start];
        const closedSet = new Set();
        const cameFrom = new Map();
        const gScore = new Map();
        const fScore = new Map();
        
        const getKey = (point) => `${point.x},${point.y}`;
        
        gScore.set(getKey(start), 0);
        fScore.set(getKey(start), getDistance(start, end));
        
        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                if (fScore.get(getKey(openSet[i])) < fScore.get(getKey(current))) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }
            
            // Remove current from openSet
            openSet.splice(currentIndex, 1);
            closedSet.add(getKey(current));
            
            // Check if we reached the goal
            if (pointsEqual(current, end)) {
                // Reconstruct path
                const path = [];
                let temp = current;
                
                while (temp) {
                    path.unshift(temp);
                    temp = cameFrom.get(getKey(temp));
                }
                
                return path;
            }
            
            // Check neighbors
            const neighbors = getValidAdjacentCells(current.x, current.y, this.maze);
            
            for (const neighbor of neighbors) {
                const neighborKey = getKey(neighbor);
                
                if (closedSet.has(neighborKey)) continue;
                
                const tentativeGScore = gScore.get(getKey(current)) + 1;
                
                if (!openSet.find(p => pointsEqual(p, neighbor))) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= gScore.get(neighborKey)) {
                    continue;
                }
                
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + getDistance(neighbor, end));
            }
        }
        
        return null; // No path found
    }
    
    /**
     * Checks if a position is valid (not a wall)
     * @param {Object} pos - Position {x, y}
     * @returns {boolean} - True if position is valid
     */
    isValidPosition(pos) {
        if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
            return false;
        }
        
        const cell = this.maze[pos.y][pos.x];
        return cell === CELL_TYPES.PATH || cell === CELL_TYPES.START || cell === CELL_TYPES.END;
    }
    
    /**
     * Checks if a position is the start point
     * @param {Object} pos - Position {x, y}
     * @returns {boolean} - True if position is start
     */
    isStartPosition(pos) {
        return pointsEqual(pos, this.startPoint);
    }
    
    /**
     * Checks if a position is the end point
     * @param {Object} pos - Position {x, y}
     * @returns {boolean} - True if position is end
     */
    isEndPosition(pos) {
        return pointsEqual(pos, this.endPoint);
    }
    
    /**
     * Gets the maze cell type at a position
     * @param {Object} pos - Position {x, y}
     * @returns {number} - Cell type constant
     */
    getCellType(pos) {
        if (pos.x < 0 || pos.x >= this.width || pos.y < 0 || pos.y >= this.height) {
            return CELL_TYPES.WALL;
        }
        
        return this.maze[pos.y][pos.x];
    }
    
    /**
     * Validates if a path solves the puzzle
     * @param {Array} path - Array of {x, y} coordinates
     * @returns {Object} - {isValid: boolean, message: string}
     */
    validateSolution(path) {
        if (!path || path.length === 0) {
            return {
                isValid: false,
                message: "No path provided"
            };
        }
        
        // Check if path starts at start point
        if (!pointsEqual(path[0], this.startPoint)) {
            return {
                isValid: false,
                message: "Path must start at the green circle"
            };
        }
        
        // Check if path ends at end point
        if (!pointsEqual(path[path.length - 1], this.endPoint)) {
            return {
                isValid: false,
                message: "Path must end at the red square"
            };
        }
        
        // Check if all points in path are valid and connected
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            
            // Check if point is valid
            if (!this.isValidPosition(point)) {
                return {
                    isValid: false,
                    message: "Path goes through walls"
                };
            }
            
            // Check if points are connected (except for first point)
            if (i > 0 && !areAdjacent(path[i-1], point)) {
                return {
                    isValid: false,
                    message: "Path must be continuous"
                };
            }
        }
        
        return {
            isValid: true,
            message: "🎉 Maze solved! Excellent work!"
        };
    }
    
    /**
     * Gets a hint for the current puzzle
     * @returns {string} - Hint message
     */
    getHint() {
        if (this.solution && this.solution.length > 0) {
            const efficiency = Math.round((this.solution.length / (this.width + this.height)) * 100);
            return `💡 Hint: The optimal path has ${this.solution.length} steps. Try to be efficient!`;
        }
        return "💡 Hint: Click the green circle to start, move mouse to navigate the maze!";
    }
    
    /**
     * Gets puzzle statistics
     * @returns {Object} - Puzzle statistics
     */
    getStats() {
        const pathCells = this.maze.flat().filter(cell => 
            cell === CELL_TYPES.PATH || cell === CELL_TYPES.START || cell === CELL_TYPES.END
        ).length;
        
        const wallCells = this.maze.flat().filter(cell => 
            cell === CELL_TYPES.WALL
        ).length;
        
        return {
            width: this.width,
            height: this.height,
            totalCells: this.width * this.height,
            pathCells,
            wallCells,
            complexity: Math.round((pathCells / (this.width * this.height)) * 100),
            optimalPath: this.solution ? this.solution.length : 0
        };
    }
    
    /**
     * Generates a new puzzle with different parameters
     * @param {number} width - New width
     * @param {number} height - New height
     */
    regenerate(width = this.width, height = this.height) {
        this.width = Math.max(GAME_CONFIG.MIN_GRID_SIZE, Math.min(GAME_CONFIG.MAX_GRID_SIZE, width));
        this.height = Math.max(GAME_CONFIG.MIN_GRID_SIZE, Math.min(GAME_CONFIG.MAX_GRID_SIZE, height));
        this.generate();
    }
    
    /**
     * Exports puzzle data for saving
     * @returns {Object} - Serializable puzzle data
     */
    serialize() {
        return {
            width: this.width,
            height: this.height,
            maze: this.maze,
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            solution: this.solution
        };
    }
    
    /**
     * Imports puzzle data
     * @param {Object} data - Puzzle data to import
     */
    deserialize(data) {
        this.width = data.width;
        this.height = data.height;
        this.maze = data.maze;
        this.startPoint = data.startPoint;
        this.endPoint = data.endPoint;
        this.solution = data.solution;
    }
}

// ===========================
// PUZZLE FACTORY FUNCTIONS
// ===========================

/**
 * Creates a new random maze puzzle
 * @param {number} width - Maze width
 * @param {number} height - Maze height
 * @returns {MazePuzzle} - New puzzle instance
 */
function createRandomMazePuzzle(width, height) {
    return new MazePuzzle(width, height);
}

/**
 * Creates a puzzle for a specific difficulty level
 * @param {number} level - Difficulty level (1-10)
 * @returns {MazePuzzle} - New puzzle instance
 */
function createLevelPuzzle(level) {
    // Scale maze size based on level
    const baseSize = 11;
    const sizeIncrease = Math.floor(level / 2);
    const size = Math.min(baseSize + sizeIncrease, GAME_CONFIG.MAX_GRID_SIZE);
    
    return new MazePuzzle(size, size);
}

// ===========================
// EXPORT FOR OTHER MODULES
// ===========================

// Make classes and functions available globally
window.MazePuzzle = MazePuzzle;
window.createRandomMazePuzzle = createRandomMazePuzzle;
window.createLevelPuzzle = createLevelPuzzle;
window.CELL_TYPES = CELL_TYPES;