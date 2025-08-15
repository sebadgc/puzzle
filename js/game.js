/**
 * GAME.JS - Main Maze Game Logic and State Management
 * 
 * This module handles:
 * - Maze game state management
 * - Path validation and tracking
 * - Level progression with increasing difficulty
 * - Score calculation and statistics
 * - Integration between all maze components
 */

// ===========================
// MAZE GAME CLASS
// ===========================

class MazeGame {
    constructor(canvasId) {
        // Initialize core components
        this.renderer = new MazeRenderer(canvasId);
        this.inputHandler = new MazeInputHandler(this.renderer.getCanvas(), this);
        
        // Game state
        this.currentPuzzle = null;
        this.currentPath = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.level = 1;
        this.score = 0;
        this.solvedPuzzles = 0;
        
        // Maze settings
        this.currentWidth = GAME_CONFIG.DEFAULT_GRID_WIDTH;
        this.currentHeight = GAME_CONFIG.DEFAULT_GRID_HEIGHT;
        
        // UI elements
        this.statusElement = document.getElementById('status');
        this.levelElement = document.getElementById('levelNumber');
        this.scoreElement = document.getElementById('scoreNumber');
        this.progressElement = document.getElementById('progressFill');
        
        this.initialize();
        
        debugLog('Maze Game Initialized', {
            level: this.level,
            score: this.score,
            mazeSize: `${this.currentWidth}x${this.currentHeight}`
        });
    }
    
    /**
     * Initializes the game with first maze
     */
    initialize() {
        this.generateNewMaze();
        this.updateUI();
        this.isPlaying = true;
    }
    
    /**
     * Generates a new maze puzzle
     * @param {number} width - Optional width override
     * @param {number} height - Optional height override
     */
    generateNewMaze(width = null, height = null) {
        // Use provided dimensions or calculate based on level
        if (width && height) {
            this.currentWidth = Math.max(GAME_CONFIG.MIN_GRID_SIZE, Math.min(GAME_CONFIG.MAX_GRID_SIZE, width));
            this.currentHeight = Math.max(GAME_CONFIG.MIN_GRID_SIZE, Math.min(GAME_CONFIG.MAX_GRID_SIZE, height));
        } else {
            // Increase maze size every few levels
            const sizeIncrease = Math.floor(this.level / 3);
            this.currentWidth = Math.min(GAME_CONFIG.DEFAULT_GRID_WIDTH + sizeIncrease, GAME_CONFIG.MAX_GRID_SIZE);
            this.currentHeight = Math.min(GAME_CONFIG.DEFAULT_GRID_HEIGHT + sizeIncrease, GAME_CONFIG.MAX_GRID_SIZE);
        }
        
        // Create new maze puzzle
        this.currentPuzzle = new MazePuzzle(this.currentWidth, this.currentHeight);
        this.currentPath = [];
        
        // Resize canvas to fit new maze
        this.renderer.resizeCanvas(this.currentWidth, this.currentHeight);
        
        // Clear input handler state
        if (this.inputHandler) {
            this.inputHandler.clearPath();
        }
        
        this.render();
        this.updateStatus("Click the green circle to start navigating the maze!");
        this.updateProgress(0);
        
        debugLog('New Maze Generated', {
            size: `${this.currentWidth}x${this.currentHeight}`,
            level: this.level,
            start: this.currentPuzzle.startPoint,
            end: this.currentPuzzle.endPoint
        });
    }
    
    /**
     * Starts a new path from the given position
     * @param {Array} path - Starting path (usually just start position)
     */
    startPath(path) {
        this.currentPath = [...path];
        this.updateStatus("Navigate to the red square. Click again to stop following.");
        this.render();
        
        debugLog('Path Started', { pathLength: path.length });
    }
    
    /**
     * Updates the current path
     * @param {Array} newPath - Updated path
     */
    updatePath(newPath) {
        this.currentPath = [...newPath];
        this.render();
        this.updateProgress();
        
        debugLog('Path Updated', {
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
     * Handles successful maze completion
     */
    handleSuccess() {
        this.updateStatus("🎉 Maze solved! Excellent navigation!", "success");
        this.score += this.calculateScore();
        this.solvedPuzzles++;
        
        // Show completion animation
        this.showCompletionAnimation();
        
        // Start celebration animation
        this.renderer.celebrateWin(this.currentPath, this.currentPuzzle, () => {
            // Auto-advance to next level after a delay
            setTimeout(() => {
                this.nextLevel();
            }, 2000);
        });
        
        this.updateUI();
        this.updateProgress(100);
        
        debugLog('Maze Solved', {
            score: this.score,
            level: this.level,
            solvedPuzzles: this.solvedPuzzles,
            pathLength: this.currentPath.length,
            optimalLength: this.currentPuzzle.solution ? this.currentPuzzle.solution.length : 0
        });
    }
    
    /**
     * Handles maze failure
     * @param {string} message - Error message
     */
    handleFailure(message) {
        this.updateStatus(message, "error");
        
        debugLog('Maze Failed', { message });
    }
    
    /**
     * Calculates score based on path efficiency and maze complexity
     * @returns {number} - Points earned
     */
    calculateScore() {
        if (!this.currentPath || !this.currentPuzzle) return 0;
        
        const baseScore = 100;
        const pathLength = this.currentPath.length;
        const optimalLength = this.currentPuzzle.solution ? this.currentPuzzle.solution.length : pathLength;
        
        // Efficiency bonus (more points for shorter paths)
        const efficiency = optimalLength / pathLength;
        const efficiencyBonus = Math.floor((efficiency - 0.5) * 100);
        
        // Maze complexity bonus
        const stats = this.currentPuzzle.getStats();
        const complexityBonus = Math.floor(stats.complexity * 2);
        
        // Level multiplier
        const levelMultiplier = this.level;
        
        const totalScore = Math.max(50, (baseScore + efficiencyBonus + complexityBonus) * levelMultiplier);
        
        return Math.floor(totalScore);
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
            }, GAME_CONFIG.CELEBRATION_DURATION);
        }
    }
    
    /**
     * Advances to the next level
     */
    nextLevel() {
        this.level++;
        this.generateNewMaze();
        this.updateUI();
        
        debugLog('Level Advanced', { 
            newLevel: this.level,
            newSize: `${this.currentWidth}x${this.currentHeight}`
        });
    }
    
    /**
     * Clears the current path
     */
    clearPath() {
        this.currentPath = [];
        
        // Clear input handler state
        if (this.inputHandler) {
            this.inputHandler.clearPath();
        }
        
        this.render();
        this.updateStatus("Click the green circle to start navigating!");
        this.updateProgress(0);
        
        debugLog('Path Cleared', {});
    }
    
    /**
     * Shows a hint for the current maze
     */
    showHint() {
        if (!this.currentPuzzle) return;
        
        const hint = this.currentPuzzle.getHint();
        this.updateStatus(hint, "");
        
        // Reset status after a few seconds
        setTimeout(() => {
            if (this.inputHandler && this.inputHandler.isCurrentlyFollowing()) {
                this.updateStatus("Navigate to the red square. Click to stop following.");
            } else {
                this.updateStatus("Click the green circle to start navigating!");
            }
        }, 3000);
        
        debugLog('Hint Shown', { hint });
    }
    
    /**
     * Sets custom maze dimensions
     * @param {number} width - Maze width
     * @param {number} height - Maze height
     */
    setMazeSize(width, height) {
        this.generateNewMaze(width, height);
        
        debugLog('Maze Size Changed', { 
            newSize: `${width}x${height}`,
            level: this.level 
        });
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
        if (percentage === null && this.currentPuzzle) {
            // Calculate progress based on distance to goal
            if (this.currentPath.length > 0) {
                const currentPos = this.currentPath[this.currentPath.length - 1];
                const distance = getDistance(currentPos, this.currentPuzzle.endPoint);
                const maxDistance = getDistance(this.currentPuzzle.startPoint, this.currentPuzzle.endPoint);
                percentage = Math.max(0, 100 - (distance / maxDistance) * 100);
            } else {
                percentage = 0;
            }
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
        this.updateStatus("Click the green circle to start navigating!");
        
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
        this.currentWidth = GAME_CONFIG.DEFAULT_GRID_WIDTH;
        this.currentHeight = GAME_CONFIG.DEFAULT_GRID_HEIGHT;
        
        this.generateNewMaze();
        this.updateUI();
        this.updateProgress(0);
        
        debugLog('Game Reset', {});
    }
    
    /**
     * Gets current game statistics
     * @returns {Object} - Game statistics
     */
    getStats() {
        const mazeStats = this.currentPuzzle ? this.currentPuzzle.getStats() : {};
        
        return {
            level: this.level,
            score: this.score,
            solvedPuzzles: this.solvedPuzzles,
            currentPathLength: this.currentPath.length,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            mazeSize: `${this.currentWidth}x${this.currentHeight}`,
            ...mazeStats
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
            currentPath: this.currentPath,
            currentWidth: this.currentWidth,
            currentHeight: this.currentHeight,
            currentPuzzle: this.currentPuzzle ? this.currentPuzzle.serialize() : null,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('mazeNavigationGame', JSON.stringify(gameData));
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
            const savedData = localStorage.getItem('mazeNavigationGame');
            if (!savedData) return false;
            
            const gameData = JSON.parse(savedData);
            
            this.level = gameData.level || 1;
            this.score = gameData.score || 0;
            this.solvedPuzzles = gameData.solvedPuzzles || 0;
            this.currentPath = gameData.currentPath || [];
            this.currentWidth = gameData.currentWidth || GAME_CONFIG.DEFAULT_GRID_WIDTH;
            this.currentHeight = gameData.currentHeight || GAME_CONFIG.DEFAULT_GRID_HEIGHT;
            
            if (gameData.currentPuzzle) {
                this.currentPuzzle = new MazePuzzle();
                this.currentPuzzle.deserialize(gameData.currentPuzzle);
                this.renderer.resizeCanvas(this.currentWidth, this.currentHeight);
            } else {
                this.generateNewMaze();
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
// MAZE GAME MANAGER FUNCTIONS
// ===========================

/**
 * Creates and initializes a new maze game instance
 * @param {string} canvasId - Canvas element ID
 * @returns {MazeGame} - New game instance
 */
function createMazeGame(canvasId) {
    return new MazeGame(canvasId);
}

/**
 * Sets up control button event listeners for maze game
 * @param {MazeGame} game - Game instance
 */
function setupMazeControlButtons(game) {
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
            game.generateNewMaze();
        });
    }
    
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            game.showHint();
        });
    }
    
    debugLog('Maze Control Buttons Setup', {
        clearBtn: !!clearBtn,
        newPuzzleBtn: !!newPuzzleBtn,
        hintBtn: !!hintBtn
    });
}

/**
 * Sets up maze-specific keyboard shortcuts
 * @param {MazeGame} game - Game instance
 */
function setupMazeKeyboardControls(game) {
    document.addEventListener('keydown', (event) => {
        if (!game.isPlaying) return;
        
        switch (event.key) {
            case 'c':
            case 'C':
                game.clearPath();
                break;
            case 'n':
            case 'N':
                game.generateNewMaze();
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
            case '+':
            case '=':
                // Increase maze size
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    const newSize = Math.min(game.currentWidth + 2, GAME_CONFIG.MAX_GRID_SIZE);
                    game.setMazeSize(newSize, newSize);
                }
                break;
            case '-':
            case '_':
                // Decrease maze size
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    const newSize = Math.max(game.currentWidth - 2, GAME_CONFIG.MIN_GRID_SIZE);
                    game.setMazeSize(newSize, newSize);
                }
                break;
        }
    });
    
    debugLog('Maze Keyboard Controls Setup', {});
}

/**
 * Creates maze size selector UI
 * @param {MazeGame} game - Game instance
 */
function createMazeSizeSelector(game) {
    // This would create a UI element for selecting maze size
    // Implementation depends on where you want to place it in the UI
    const sizeSelector = document.createElement('div');
    sizeSelector.className = 'maze-size-selector';
    sizeSelector.innerHTML = `
        <label>Maze Size: </label>
        <select id="mazeSizeSelect">
            <option value="11">Small (11x11)</option>
            <option value="15" selected>Medium (15x15)</option>
            <option value="19">Large (19x19)</option>
            <option value="23">Extra Large (23x23)</option>
        </select>
    `;
    
    const select = sizeSelector.querySelector('#mazeSizeSelect');
    select.addEventListener('change', (e) => {
        const size = parseInt(e.target.value);
        game.setMazeSize(size, size);
    });
    
    return sizeSelector;
}

// ===========================
// EXPORT FOR OTHER MODULES
// ===========================

// Make MazeGame class and functions available globally
window.MazeGame = MazeGame;
window.createMazeGame = createMazeGame;
window.setupMazeControlButtons = setupMazeControlButtons;
window.setupMazeKeyboardControls = setupMazeKeyboardControls;
window.createMazeSizeSelector = createMazeSizeSelector;