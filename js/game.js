/**
 * GAME.JS - Main Game Logic and State Management
 * 
 * This module handles:
 * - Game state management
 * - Path validation and drawing logic
 * - Level progression
 * - Score and statistics tracking
 * - Integration between all other modules
 */

// ===========================
// GAME CLASS
// ===========================

class Game {
    constructor(canvasId) {
        // Initialize core components
        this.renderer = new GameRenderer(canvasId);
        this.inputHandler = new InputHandler(this.renderer.getCanvas(), this);
        
        // Game state
        this.currentPuzzle = null;
        this.currentPath = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.level = 1;
        this.score = 0;
        this.solvedPuzzles = 0;
        
        // UI elements
        this.statusElement = document.getElementById('status');
        this.levelElement = document.getElementById('levelNumber');
        this.scoreElement = document.getElementById('scoreNumber');
        this.progressElement = document.getElementById('progressFill');
        
        this.initialize();
        
        debugLog('Game Initialized', {
            level: this.level,
            score: this.score
        });
    }
    
    /**
     * Initializes the game with first puzzle
     */
    initialize() {
        this.generateNewPuzzle();
        this.updateUI();
        this.isPlaying = true;
    }
    
    /**
     * Generates a new puzzle based on current level
     */
    generateNewPuzzle() {
        // For now, create basic puzzles
        // Later we can add complexity based on level
        this.currentPuzzle = createRandomPuzzle(PUZZLE_TYPES.BASIC);
        this.currentPath = [];
        
        this.render();
        this.updateStatus("Draw a line from start to end!");
        
        debugLog('New Puzzle Generated', {
            type: this.currentPuzzle.type,
            level: this.level
        });
    }
    
    /**
     * Checks if drawing can start at the given position
     * @param {Object} gridPos - {x, y} grid coordinates
     * @returns {boolean} - True if drawing can start here
     */
    canStartDrawingAt(gridPos) {
        if (!this.currentPuzzle || !this.isPlaying) return false;
        
        return pointsEqual(gridPos, this.currentPuzzle.startPoint);
    }
    
    /**
     * Starts a new path from the given position
     * @param {Object} gridPos - {x, y} grid coordinates
     */
    startPath(gridPos) {
        if (!this.canStartDrawingAt(gridPos)) return;
        
        this.currentPath = [gridPos];
        this.updateStatus("Drawing path...");
        this.render();
        
        debugLog('Path Started', gridPos);
    }
    
    /**
     * Adds a point to the current path
     * @param {Object} gridPos - {x, y} grid coordinates
     */
    addPointToPath(gridPos) {
        if (!this.isPlaying || this.currentPath.length === 0) return;
        
        // Check if this point is already in the path (avoid loops)
        const existingIndex = this.currentPath.findIndex(point => 
            pointsEqual(point, gridPos)
        );
        
        if (existingIndex !== -1) {
            // If we're backtracking, remove points after this one
            if (existingIndex < this.currentPath.length - 1) {
                this.currentPath = this.currentPath.slice(0, existingIndex + 1);
            }
        } else {
            // Add new point
            this.currentPath.push(gridPos);
        }
        
        this.render();
        this.updateProgress();
        
        debugLog('Point Added', {
            point: gridPos,
            pathLength: this.currentPath.length
        });
    }
    
    /**
     * Finishes the current path and validates the solution
     */
    finishPath() {
        if (!this.isPlaying || this.currentPath.length === 0) return;
        
        const validation = this.currentPuzzle.validateSolution(this.currentPath);
        
        if (validation.isValid) {
            this.handleSuccess();
        } else {
            this.handleFailure(validation.message);
        }
        
        debugLog('Path Finished', {
            isValid: validation.isValid,
            message: validation.message,
            pathLength: this.currentPath.length
        });
    }
    
    /**
     * Handles successful puzzle completion
     */
    handleSuccess() {
        this.updateStatus("🎉 Puzzle Solved! Great job!", "success");
        this.score += this.calculateScore();
        this.solvedPuzzles++;
        
        // Show completion animation
        this.showCompletionAnimation();
        
        // Start celebration animation
        this.renderer.celebrateWin(this.currentPath, () => {
            // Auto-advance to next puzzle after a delay
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        });
        
        this.updateUI();
        this.updateProgress(100);
        
        debugLog('Puzzle Solved', {
            score: this.score,
            level: this.level,
            solvedPuzzles: this.solvedPuzzles
        });
    }
    
    /**
     * Handles puzzle failure
     * @param {string} message - Error message
     */
    handleFailure(message) {
        this.updateStatus(message, "error");
        
        // Optional: Add visual feedback for failure
        // this.showFailureEffect();
        
        debugLog('Puzzle Failed', { message });
    }
    
    /**
     * Calculates score based on path efficiency and time
     * @returns {number} - Points earned
     */
    calculateScore() {
        if (!this.currentPath || !this.currentPuzzle) return 0;
        
        const baseScore = 100;
        const pathLength = this.currentPath.length;
        const minPath = this.getMinimumPathLength();
        
        // Bonus for efficient path
        const efficiencyBonus = Math.max(0, (minPath * 2 - pathLength) * 10);
        
        // Level multiplier
        const levelMultiplier = this.level;
        
        return Math.floor((baseScore + efficiencyBonus) * levelMultiplier);
    }
    
    /**
     * Estimates minimum path length for current puzzle
     * @returns {number} - Minimum possible path length
     */
    getMinimumPathLength() {
        if (!this.currentPuzzle) return 1;
        
        // Simple Manhattan distance for basic puzzles
        const start = this.currentPuzzle.startPoint;
        const end = this.currentPuzzle.endPoint;
        
        return Math.abs(end.x - start.x) + Math.abs(end.y - start.y) + 1;
    }
    
    /**
     * Shows completion animation overlay
     */
    showCompletionAnimation() {
        const animationElement = document.getElementById('completionAnimation');
        if (animationElement) {
            animationElement.classList.add('show');
            
            // Hide after animation
            setTimeout(() => {
                animationElement.classList.remove('show');
            }, 2000);
        }
    }
    
    /**
     * Advances to the next level
     */
    nextLevel() {
        this.level++;
        this.generateNewPuzzle();
        this.updateUI();
        
        debugLog('Level Advanced', { newLevel: this.level });
    }
    
    /**
     * Clears the current path
     */
    clearPath() {
        this.currentPath = [];
        this.render();
        this.updateStatus("Draw a line from start to end!");
        this.updateProgress(0);
        
        debugLog('Path Cleared', {});
    }
    
    /**
     * Shows a hint for the current puzzle
     */
    showHint() {
        if (!this.currentPuzzle) return;
        
        const hint = this.currentPuzzle.getHint();
        this.updateStatus(hint, "");
        
        // Reset status after a few seconds
        setTimeout(() => {
            this.updateStatus("Draw a line from start to end!");
        }, 3000);
        
        debugLog('Hint Shown', { hint });
    }
    
    /**
     * Renders the current game state
     */
    render() {
        this.renderer.drawAll(this.currentPuzzle, this.currentPath);
    }
    
    /**
     * Updates the status message
     * @param {string} message - Status message
     * @param {string} className - CSS class for styling
     */
    updateStatus(message, className = "") {
        updateStatus(message, className);
    }
    
    /**
     * Updates the progress bar based on path completion
     * @param {number} percentage - Progress percentage (0-100)
     */
    updateProgress(percentage = null) {
        if (percentage === null) {
            // Calculate progress based on path length vs minimum path
            const minPath = this.getMinimumPathLength();
            const currentLength = this.currentPath.length;
            percentage = Math.min(100, (currentLength / minPath) * 100);
        }
        
        if (this.progressElement) {
            this.progressElement.style.width = `${percentage}%`;
        }
    }
    
    /**
     * Updates all UI elements
     */
    updateUI() {
        if (this.levelElement) {
            this.levelElement.textContent = this.level.toString().padStart(2, '0');
        }
        
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score.toString();
        }
    }
    
    /**
     * Pauses the game
     */
    pause() {
        this.isPaused = true;
        this.inputHandler.disable();
        this.updateStatus("Game Paused", "");
        
        debugLog('Game Paused', {});
    }
    
    /**
     * Resumes the game
     */
    resume() {
        this.isPaused = false;
        this.inputHandler.enable();
        this.updateStatus("Draw a line from start to end!");
        
        debugLog('Game Resumed', {});
    }
    
    /**
     * Resets the game to initial state
     */
    reset() {
        this.level = 1;
        this.score = 0;
        this.solvedPuzzles = 0;
        this.currentPath = [];
        this.generateNewPuzzle();
        this.updateUI();
        this.updateProgress(0);
        
        debugLog('Game Reset', {});
    }
    
    /**
     * Gets current game statistics
     * @returns {Object} - Game statistics
     */
    getStats() {
        return {
            level: this.level,
            score: this.score,
            solvedPuzzles: this.solvedPuzzles,
            currentPathLength: this.currentPath.length,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused
        };
    }
    
    /**
     * Saves game state to localStorage
     */
    saveGame() {
        const gameData = {
            level: this.level,
            score: this.score,
            solvedPuzzles: this.solvedPuzzles,
            currentPuzzle: this.currentPuzzle ? this.currentPuzzle.serialize() : null,
            currentPath: this.currentPath,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('lineDrawingPuzzleGame', JSON.stringify(gameData));
            debugLog('Game Saved', gameData);
        } catch (error) {
            debugLog('Save Failed', { error: error.message });
        }
    }
    
    /**
     * Loads game state from localStorage
     * @returns {boolean} - True if load was successful
     */
    loadGame() {
        try {
            const savedData = localStorage.getItem('lineDrawingPuzzleGame');
            if (!savedData) return false;
            
            const gameData = JSON.parse(savedData);
            
            this.level = gameData.level || 1;
            this.score = gameData.score || 0;
            this.solvedPuzzles = gameData.solvedPuzzles || 0;
            this.currentPath = gameData.currentPath || [];
            
            if (gameData.currentPuzzle) {
                this.currentPuzzle = new Puzzle();
                this.currentPuzzle.deserialize(gameData.currentPuzzle);
            } else {
                this.generateNewPuzzle();
            }
            
            this.updateUI();
            this.render();
            
            debugLog('Game Loaded', gameData);
            return true;
        } catch (error) {
            debugLog('Load Failed', { error: error.message });
            return false;
        }
    }
    
    /**
     * Destroys the game instance and cleans up resources
     */
    destroy() {
        this.inputHandler.destroy();
        this.isPlaying = false;
        
        debugLog('Game Destroyed', {});
    }
}

// ===========================
// GAME MANAGER FUNCTIONS
// ===========================

/**
 * Creates and initializes a new game instance
 * @param {string} canvasId - Canvas element ID
 * @returns {Game} - New game instance
 */
function createGame(canvasId) {
    return new Game(canvasId);
}

/**
 * Sets up control button event listeners
 * @param {Game} game - Game instance
 */
function setupControlButtons(game) {
    const clearBtn = document.getElementById('clearBtn');
    const newPuzzleBtn = document.getElementById('newPuzzleBtn');
    const hintBtn = document.getElementById('hintBtn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            game.clearPath();
        });
    }
    
    if (newPuzzleBtn) {
        newPuzzleBtn.addEventListener('click', () => {
            game.generateNewPuzzle();
        });
    }
    
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            game.showHint();
        });
    }
    
    debugLog('Control Buttons Setup', {
        clearBtn: !!clearBtn,
        newPuzzleBtn: !!newPuzzleBtn,
        hintBtn: !!hintBtn
    });
}

/**
 * Sets up keyboard shortcuts
 * @param {Game} game - Game instance
 */
function setupKeyboardControls(game) {
    document.addEventListener('keydown', (event) => {
        if (!game.isPlaying) return;
        
        switch (event.key) {
            case 'c':
            case 'C':
                game.clearPath();
                break;
            case 'n':
            case 'N':
                game.generateNewPuzzle();
                break;
            case 'h':
            case 'H':
                game.showHint();
                break;
            case 'p':
            case 'P':
                if (game.isPaused) {
                    game.resume();
                } else {
                    game.pause();
                }
                break;
            case 'r':
            case 'R':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    game.reset();
                }
                break;
        }
    });
    
    debugLog('Keyboard Controls Setup', {});
}

/**
 * Sets up auto-save functionality
 * @param {Game} game - Game instance
 */
function setupAutoSave(game) {
    // Save game every 30 seconds
    setInterval(() => {
        if (game.isPlaying) {
            game.saveGame();
        }
    }, 30000);
    
    // Save when page is about to close
    window.addEventListener('beforeunload', () => {
        game.saveGame();
    });
    
    debugLog('Auto-save Setup', {});
}

// ===========================
// EXPORT FOR OTHER MODULES
// ===========================

// Make Game class and functions available globally
window.Game = Game;
window.createGame = createGame;
window.setupControlButtons = setupControlButtons;
window.setupKeyboardControls = setupKeyboardControls;
window.setupAutoSave = setupAutoSave;