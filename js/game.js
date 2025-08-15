/**
 * GAME.JS - Main Game Controller
 * 
 * This module handles:
 * - Game state management
 * - Coordination between modules
 * - Level progression
 * - Score tracking
 */

class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            console.error(`Canvas with id '${canvasId}' not found`);
            return;
        }
        
        // Game settings
        this.mazeSize = GAME_CONFIG.DEFAULT_GRID_SIZE;
        this.cellSize = GAME_CONFIG.DEFAULT_CELL_SIZE;
        this.resolution = GAME_CONFIG.DEFAULT_RESOLUTION;
        
        // Initialize modules
        //this.mazeGenerator = new MazeGenerator();
        this.gridGenerator = new GridGenerator();
   
        this.rulesEngine = new RulesEngine();
        this.renderer = new Renderer(this.canvas);
        this.inputHandler = new InputHandler(this.canvas, this);
        
        // Game state
        //this.currentMaze = null;
        this.currentGrid = null; 
        this.currentPath = [];
        this.level = 1;
        this.score = 0;
        this.showingSolution = false;
        
        // Initialize game
        this.init();
    }
    
    /**
     * Initialize the game
     */
    init() {
        this.updateCanvasSize();
        this.generateNewPuzzle();
        this.render();
        
        debugLog('Game', 'Initialized successfully');
    }
    
    /**
     * Update canvas size based on maze dimensions
     */
    updateCanvasSize() {
        const size = this.mazeSize * this.cellSize;
        this.canvas.width = size;
        this.canvas.height = size;
        this.renderer.updateSize(size, size);
        this.renderer.updateSettings(this.cellSize, this.resolution);
    }
    
    /**
     * Generate a new maze
     */
    generateNewPuzzle() {
        // Generate maze
        //this.currentMaze = this.mazeGenerator.generate(this.mazeSize, this.mazeSize);
        this.currentGrid = this.gridGenerator.generate(this.mazeSize, this.mazeSize);
  
        // Clear current path
        this.currentPath = [];
        this.showingSolution = false;
        
        // Clear input state
        this.inputHandler.clear();
        
        // Update UI
        updateStatus('Click the green circle to start!');
        
        // Render
        this.render();
        
        debugLog('Game', `Generated new ${this.mazeSize}x${this.mazeSize} maze`);
    }
    
    /**
     * Start drawing path from position
     * @param {Object} highResPos - High-resolution starting position
     */
    startPath(highResPos) {
        this.currentPath = [highResPos];
        updateStatus('Navigate to the red square!');
        this.render();
    }
    
    /**
     * Add point to current path
     * @param {Object} point - High-resolution point to add
     */
    addPathPoint(point) {
        // Check if backtracking
        const existingIndex = this.currentPath.findIndex(p => 
            pointsEqual(p, point)
        );
        
        if (existingIndex !== -1) {
            // Backtrack to this point
            this.currentPath = this.currentPath.slice(0, existingIndex + 1);
        } else {
            // Add new point
            this.currentPath.push(point);
        }
        
        this.render();
    }
    
    /**
     * Check if position is the start
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @returns {boolean} True if start position
     */
    isStartPosition(x, y) {
        return this.currentMaze && 
               this.currentMaze.startPos &&
               this.currentMaze.startPos.x === x && 
               this.currentMaze.startPos.y === y;
    }
    
    /**
     * Check if position is the end
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @returns {boolean} True if end position
     */
    isEndPosition(x, y) {
        return this.currentMaze && 
               this.currentMaze.endPos &&
               this.currentMaze.endPos.x === x && 
               this.currentMaze.endPos.y === y;
    }
    
    /**
     * Check if position is on current path
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @returns {boolean} True if on path
     */
    isOnPath(x, y) {
        for (const point of this.currentPath) {
            const gridPos = highResToGrid(point.x, point.y, this.resolution);
            if (gridPos.x === x && gridPos.y === y) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if move is valid
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @returns {boolean} True if valid move
     */
    isValidMove(x, y) {
        if (!this.currentMaze) return false;
        
        // Check bounds
        if (x < 0 || x >= this.currentMaze.width || 
            y < 0 || y >= this.currentMaze.height) {
            return false;
        }
        
        // Check if it's a valid path
        return this.gridGenerator.isValidPath(x, y);
    }
    
    /**
     * Validate path and complete if all rules pass
     */
    validateAndComplete() {
        // Create validation context
        const context = {
            path: this.currentPath,
            maze: this.currentMaze.maze,
            startPos: this.currentMaze.startPos,
            endPos: this.currentMaze.endPos,
            resolution: this.resolution,
            requiredPoints: this.currentMaze.requiredPoints
        };
        
        // Validate against all rules
        const validation = this.rulesEngine.validate(context);
        
        if (validation.passed) {
            this.onPuzzleComplete();
        } else {
            updateStatus(validation.message, 'error');
            
            // Show which rules failed
            const failedRules = validation.results
                .filter(r => !r.passed)
                .map(r => r.rule)
                .join(', ');
            
            debugLog('Game', `Validation failed: ${failedRules}`);
        }
    }
    
    /**
     * Handle puzzle completion
     */
    onPuzzleComplete() {
        updateStatus('🎉 Puzzle solved! Excellent!', 'success');
        
        // Calculate score
        const pathLength = this.currentPath.length;
        const optimalLength = this.currentMaze.solution ? 
            this.currentMaze.solution.length * this.resolution : pathLength;
        const efficiency = optimalLength / pathLength;
        const points = Math.floor(100 * this.level * efficiency);
        
        this.score += points;
        this.level++;
        
        debugLog('Game', `Puzzle complete! Score: +${points}, Total: ${this.score}`);
        
        // Animate success
        this.renderer.animateSuccess(() => {
            // Generate next puzzle after animation
            this.generateNewPuzzle();
        });
    }
    
    /**
     * Clear current path
     */
    clearPath() {
        this.currentPath = [];
        this.inputHandler.clear();
        updateStatus('Path cleared. Click the green circle to start!');
        this.render();
    }
    
    /**
     * Show solution
     */
    showSolution() {
        if (!this.currentMaze || !this.currentMaze.solution) return;
        
        // Convert solution to high-res path
        this.currentPath = [];
        for (const pos of this.currentMaze.solution) {
            const highRes = gridToHighRes(pos.x, pos.y, this.resolution);
            
            // Add multiple points to fill the cell
            for (let i = 0; i < this.resolution; i++) {
                for (let j = 0; j < this.resolution; j++) {
                    this.currentPath.push({
                        x: pos.x * this.resolution + i,
                        y: pos.y * this.resolution + j
                    });
                }
            }
        }
        
        this.showingSolution = true;
        updateStatus('Solution shown!');
        this.render();
    }
    
    /**
     * Update game settings
     * @param {number} mazeSize - New maze size
     * @param {number} cellSize - New cell size
     * @param {number} resolution - New resolution
     */
    updateSettings(mazeSize, cellSize, resolution) {
        this.mazeSize = parseInt(mazeSize);
        this.cellSize = parseInt(cellSize);
        this.resolution = parseInt(resolution);
        
        this.updateCanvasSize();
        this.generateNewPuzzle();
        
        debugLog('Game', `Settings updated: ${this.mazeSize}x${this.mazeSize}, ${this.cellSize}px cells, ${this.resolution}x resolution`);
    }
    
    /**
     * Render current game state
     */
    render() {
        const gameState = {
            maze: this.currentMaze ? this.currentMaze.maze : null,
            startPos: this.currentMaze ? this.currentMaze.startPos : null,
            endPos: this.currentMaze ? this.currentMaze.endPos : null,
            currentPath: this.currentPath,
            isDrawing: this.inputHandler ? this.inputHandler.isDrawing : false,
            showSolution: this.showingSolution,
            requiredPoints: this.currentMaze ? this.currentMaze.requiredPoints : null,
            solution: this.currentMaze ? this.currentMaze.solution : null
        };
        
        this.renderer.render(gameState);
    }
    
    /**
     * Get current game statistics
     * @returns {Object} Game stats
     */
    getStats() {
        return {
            level: this.level,
            score: this.score,
            mazeSize: this.mazeSize,
            cellSize: this.cellSize,
            resolution: this.resolution,
            pathLength: this.currentPath.length,
            activeRules: this.rulesEngine.getActiveRules()
        };
    }
}

// Export for use in other modules
window.Game = Game;