/**
 * MAZEGENERATOR.JS - Maze Generation Module
 * 
 * This module handles:
 * - Maze generation algorithms
 * - Start/end point placement
 * - Solution finding
 */

class MazeGenerator {
    constructor() {
        this.maze = null;
        this.width = 0;
        this.height = 0;
        this.startPos = null;
        this.endPos = null;
        this.solution = null;
        this.requiredPoints = [];
    }
    
    /**
     * Generate a new maze
     * @param {number} width - Maze width (should be odd)
     * @param {number} height - Maze height (should be odd)
     * @returns {Object} Generated maze data
     */
    generate(width, height) {
        // Ensure odd dimensions for proper maze generation
        this.width = width % 2 === 0 ? width + 1 : width;
        this.height = height % 2 === 0 ? height + 1 : height;
        
        // Initialize maze with all walls
        this.maze = Array(this.height).fill().map(() => 
            Array(this.width).fill(CELL_TYPES.WALL)
        );
        
        // Generate maze using recursive backtracking
        this.recursiveBacktracking();
        
        // Place start and end points
        this.placeStartAndEnd();

        // Add 2 points to the maze
        this.placeRequiredPoints(2);

        // Find solution path
        this.solution = this.findSolution();

        return this.getMazeData();
    }
    
    /**
     * Recursive backtracking maze generation algorithm
     */
    recursiveBacktracking() {
        const stack = [];
        const visited = Array(this.height).fill().map(() => 
            Array(this.width).fill(false)
        );
        
        // Start from (1,1)
        let current = { x: 1, y: 1 };
        this.maze[1][1] = CELL_TYPES.PATH;
        visited[1][1] = true;
        stack.push(current);
        
        while (stack.length > 0) {
            const neighbors = this.getUnvisitedNeighbors(current, visited);
            
            if (neighbors.length > 0) {
                // Choose random neighbor
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];
                
                // Remove wall between current and next
                const wallX = current.x + (next.x - current.x) / 2;
                const wallY = current.y + (next.y - current.y) / 2;
                this.maze[wallY][wallX] = CELL_TYPES.PATH;
                this.maze[next.y][next.x] = CELL_TYPES.PATH;
                
                visited[next.y][next.x] = true;
                stack.push(next);
                current = next;
            } else {
                // Backtrack
                current = stack.pop();
            }
        }
    }
    
    /**
     * Get unvisited neighbors for maze generation
     * @param {Object} pos - Current position
     * @param {Array} visited - Visited cells array
     * @returns {Array} Array of unvisited neighbors
     */
    getUnvisitedNeighbors(pos, visited) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -2 }, // Up
            { x: 2, y: 0 },  // Right
            { x: 0, y: 2 },  // Down
            { x: -2, y: 0 }  // Left
        ];
        
        for (const dir of directions) {
            const newX = pos.x + dir.x;
            const newY = pos.y + dir.y;
            
            if (newX > 0 && newX < this.width - 1 && 
                newY > 0 && newY < this.height - 1 && 
                !visited[newY][newX]) {
                neighbors.push({ x: newX, y: newY });
            }
        }
        
        return neighbors;
    }
    
    /**
     * Place start and end points in the maze
     */
    placeStartAndEnd() {
        // Find all path cells
        const pathCells = [];
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === CELL_TYPES.PATH) {
                    pathCells.push({ x, y });
                }
            }
        }
        
        if (pathCells.length < 2) {
            console.error('Not enough path cells for start and end points');
            return;
        }
        
        // Place start at a random corner area
        const corners = pathCells.filter(cell => 
            (cell.x < 3 || cell.x > this.width - 4) && 
            (cell.y < 3 || cell.y > this.height - 4)
        );
        
        this.startPos = corners.length > 0 ? 
            corners[Math.floor(Math.random() * corners.length)] : 
            pathCells[0];
        
        // Place end at farthest point from start
        let maxDist = 0;
        this.endPos = pathCells[0];
        
        for (const cell of pathCells) {
            const dist = manhattanDistance(cell, this.startPos);
            if (dist > maxDist) {
                maxDist = dist;
                this.endPos = cell;
            }
        }
        
        // Mark start and end in maze
        this.maze[this.startPos.y][this.startPos.x] = CELL_TYPES.START;
        this.maze[this.endPos.y][this.endPos.x] = CELL_TYPES.END;
    }

    placeRequiredPoints(count = 2) {
        this.requiredPoints = [];
        const pathCells = [];
        
        // Find all valid path cells (excluding start and end)
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.maze[y][x] === CELL_TYPES.PATH &&
                    !pointsEqual({x, y}, this.startPos) &&
                    !pointsEqual({x, y}, this.endPos)) {
                    pathCells.push({ x, y });
                }
            }
        }
        
        // Randomly select required points
        for (let i = 0; i < Math.min(count, pathCells.length); i++) {
            const index = Math.floor(Math.random() * pathCells.length);
            const point = pathCells.splice(index, 1)[0];
            this.requiredPoints.push(point);
            
            // Mark in maze for rendering (optional: use a new cell type)
            // this.maze[point.y][point.x] = CELL_TYPES.REQUIRED;
        }
    }
    /**
     * Find solution path using BFS
     * @returns {Array} Solution path or null
     */
    findSolution() {
        if (!this.startPos || !this.endPos) return null;
        
        const queue = [{ pos: this.startPos, path: [this.startPos] }];
        const visited = new Set();
        visited.add(`${this.startPos.x},${this.startPos.y}`);
        
        while (queue.length > 0) {
            const { pos, path } = queue.shift();
            
            // Check if reached end
            if (pointsEqual(pos, this.endPos)) {
                return path;
            }
            
            // Check all 4 directions
            const neighbors = getAdjacent4(pos.x, pos.y);
            
            for (const neighbor of neighbors) {
                const key = `${neighbor.x},${neighbor.y}`;
                
                // Check if valid and unvisited
                if (neighbor.x >= 0 && neighbor.x < this.width && 
                    neighbor.y >= 0 && neighbor.y < this.height &&
                    (this.maze[neighbor.y][neighbor.x] === CELL_TYPES.PATH || 
                     this.maze[neighbor.y][neighbor.x] === CELL_TYPES.END) &&
                    !visited.has(key)) {
                    
                    visited.add(key);
                    queue.push({
                        pos: neighbor,
                        path: [...path, neighbor]
                    });
                }
            }
        }
        
        return null; // No solution found
    }
    
    /**
     * Get maze data
     * @returns {Object} Maze data object
     */
    getMazeData() {
        return {
            maze: this.maze,
            width: this.width,
            height: this.height,
            startPos: this.startPos,
            endPos: this.endPos,
            solution: this.solution,
            requiredPoints: this.requiredPoints
        };
    }
    
    /**
     * Check if position is valid path
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if valid path
     */
    isValidPath(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return false;
        }
        
        const cell = this.maze[y][x];
        return cell === CELL_TYPES.PATH || 
               cell === CELL_TYPES.START || 
               cell === CELL_TYPES.END;
    }
}

// Export for use in other modules
window.MazeGenerator = MazeGenerator;