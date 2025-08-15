/**
 * INPUT.JS - Simple and Reliable Mouse Following for Maze Navigation
 * 
 * This module handles:
 * - Single click to start/stop following
 * - Smooth mouse movement tracking through maze paths
 * - Simple pathfinding that actually works
 * - Touch support for mobile devices
 */

// ===========================
// SIMPLE INPUT HANDLER CLASS
// ===========================

class MazeInputHandler {
    constructor(canvas, gameInstance) {
        this.canvas = canvas;
        this.game = gameInstance;
        this.isFollowing = false;     // Whether line is following mouse
        this.currentPosition = null;  // Current position in maze
        this.currentPath = [];        // Path taken so far
        this.lastMousePosition = null;
        
        // Simple timing to prevent too rapid updates
        this.lastUpdateTime = 0;
        this.updateDelay = 50; // 50ms between updates
        
        this.setupEventListeners();
        
        debugLog('Simple Maze Input Handler Initialized', {
            canvas: this.canvas.id,
            hasGame: !!this.game
        });
    }
    
    /**
     * Sets up all mouse and touch event listeners
     */
    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // REMOVE ALL EXISTING EVENT LISTENERS FIRST
        this.canvas.removeEventListener('click', this.handleClick);
        
        // Test if our method exists
        console.log('🔍 handleClick method exists:', typeof this.handleClick);
        
        // Use a single, clear event listener
        this.canvas.addEventListener('click', (event) => {
            console.log('🖱️ === MAIN CLICK HANDLER TRIGGERED ===');
            
            // Prevent other handlers from running
            event.stopPropagation();
            event.stopImmediatePropagation();
            
            this.handleClick(event);
        }, true); // Use capture phase to run first
        
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        this.canvas.addEventListener('mouseleave', (event) => {
            this.handleMouseLeave(event);
        });
        
        console.log('✅ Clean event listeners setup complete');
    }
    
    /**
     * Prevents default touch behaviors
     */
    preventDefault(e) {
        e.preventDefault();
    }
    
    /**
     * Gets grid position from event coordinates
     * @param {Event} event - Mouse or touch event
     * @returns {Object|null} - {x, y} grid coordinates or null
     */
    getGridPositionFromEvent(event) {
        const position = getEventPosition(event, this.canvas);
        return pixelToGrid(position.x, position.y);
    }
    
    /**
     * Handles mouse clicks - start/stop following
     * @param {MouseEvent} event - Mouse click event
     */
    handleClick(event) {
        if (!this.game || !this.game.currentPuzzle) return;
        
        const gridPos = this.getGridPositionFromEvent(event);
        if (!gridPos) return;
        
        debugLog('Click', { gridPos, isFollowing: this.isFollowing });
        
        if (!this.isFollowing) {
            // Try to start following from start position
            if (this.game.currentPuzzle.isStartPosition(gridPos)) {
                this.startFollowing(gridPos);
            } else {
                this.game.updateStatus("Click the green circle to start!");
            }
        } else {
            // Stop following
            this.stopFollowing();
        }
    }
    
    /**
     * Handles mouse movement - follow through maze with high precision
     * @param {MouseEvent} event - Mouse move event
     */
    handleMouseMove(event) {
        if (!this.isFollowing || !this.game || !this.game.currentPuzzle) return;
        
        const currentTime = Date.now();
        if (currentTime - this.lastUpdateTime < this.updateDelay) {
            return; // Too soon since last update
        }
        
        const mousePos = getEventPosition(event, this.canvas);
        this.lastMousePosition = mousePos;
        
        // Find the closest valid adjacent movement cell to mouse
        const nextPos = this.findClosestValidMovementToMouse(mousePos);
        
        if (nextPos && !pointsEqual(nextPos, this.currentPosition)) {
            this.moveToPosition(nextPos);
            this.lastUpdateTime = currentTime;
        }
    }
    
    /**
     * Finds the closest valid movement toward mouse position
     * @param {Object} mousePos - Mouse position {x, y}
     * @returns {Object|null} - Next movement position or null
     */
    findClosestValidMovementToMouse(mousePos) {
        if (!this.currentPosition) return null;
        
        // Get all valid adjacent movement cells (8 directions for smooth movement)
        const validMoves = getValidAdjacentMovementCells(
            this.currentPosition.x, 
            this.currentPosition.y, 
            this.game.currentPuzzle.maze
        );
        
        if (validMoves.length === 0) return null;
        
        // Convert mouse position to movement grid coordinates
        const mouseMovement = pixelToMovementGrid(mousePos.x, mousePos.y);
        
        // Find the valid move closest to mouse position
        let closestMove = null;
        let closestDistance = Infinity;
        
        for (const move of validMoves) {
            // Calculate distance from this move to mouse position
            const distance = Math.sqrt(
                Math.pow(move.x - mouseMovement.x, 2) + 
                Math.pow(move.y - mouseMovement.y, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestMove = move;
            }
        }
        
        return closestMove;
    }
    
    /**
     * Starts following the mouse from given position (convert to movement coordinates)
     * @param {Object} startPos - Starting position {x, y} in visual coordinates
     */
    startFollowing(startPos) {
        this.isFollowing = true;
        
        // Convert visual coordinates to movement coordinates (center of visual cell)
        const movementStart = visualToMovementGrid(startPos.x, startPos.y);
        movementStart.x += GAME_CONFIG.MOVEMENT_RESOLUTION / 2; // Center
        movementStart.y += GAME_CONFIG.MOVEMENT_RESOLUTION / 2; // Center
        
        this.currentPosition = { ...movementStart };
        this.currentPath = [{ ...movementStart }];
        this.lastUpdateTime = 0;
        
        // Update cursor and game state
        this.canvas.style.cursor = 'crosshair';
        this.game.startPath(this.currentPath);
        this.game.updateStatus("Move mouse to navigate through the maze. Click to stop.");
        
        debugLog('Started Following', { 
            visualStart: startPos,
            movementStart: movementStart 
        });
    }
    
    /**
     * Handles mouse leaving canvas
     */
    handleMouseLeave(event) {
        // Don't stop following when mouse leaves
        this.lastMousePosition = null;
    }
    
    /**
     * Handles touch start events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.handleClick(touch);
        }
    }
    
    /**
     * Handles touch move events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.handleMouseMove(touch);
        }
    }
    
    /**
     * Handles touch end events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        // For touch, we don't stop following on touch end
    }
    
    /**
     * Starts following the mouse from given position
     * @param {Object} startPos - Starting position {x, y}
     */
    startFollowing(startPos) {
        this.isFollowing = true;
        this.currentPosition = { ...startPos };
        this.currentPath = [{ ...startPos }];
        this.lastUpdateTime = 0;
        
        // Update cursor and game state
        this.canvas.style.cursor = 'crosshair';
        this.game.startPath(this.currentPath);
        this.game.updateStatus("Move mouse to navigate through the maze. Click to stop.");
        
        debugLog('Started Following', { startPos });
    }
    
    /**
     * Stops following the mouse
     */
    stopFollowing() {
        this.isFollowing = false;
        this.canvas.style.cursor = 'default';
        
        this.game.updateStatus("Click the green circle to start again.");
        
        debugLog('Stopped Following', { 
            pathLength: this.currentPath.length,
            currentPos: this.currentPosition 
        });
    }
    
    /**
     * Moves to a new position in the maze - SIMPLIFIED
     * @param {Object} newPos - New position {x, y} in grid coordinates
     */
    moveToPosition(newPos) {
        console.log('🏃 Moving to position:', newPos);
        
        if (!this.game.currentPuzzle.isValidPosition(newPos)) {
            console.log('❌ Invalid position:', newPos);
            return;
        }
        
        // Check if we're going back to a previous position (backtracking)
        const existingIndex = this.currentPath.findIndex(pos => pointsEqual(pos, newPos));
        
        if (existingIndex !== -1) {
            // Backtracking - cut the path at this position
            this.currentPath = this.currentPath.slice(0, existingIndex + 1);
            console.log('🔄 Backtracking to index', existingIndex);
        } else {
            // Moving to new position - add it to path
            this.currentPath.push({ ...newPos });
            console.log('➕ Adding new position to path');
        }
        
        this.currentPosition = { ...newPos };
        
        // Update game with new path
        this.game.updatePath(this.currentPath);
        
        // Check if we reached the end
        if (this.game.currentPuzzle.isEndPosition(newPos)) {
            console.log('🎉 Reached the end!');
            this.reachedEnd();
        }
        
        console.log('✅ Position updated, path length:', this.currentPath.length);
    }
    
    /**
     * Handles reaching the end of the maze
     */
    reachedEnd() {
        this.isFollowing = false;
        this.canvas.style.cursor = 'default';
        
        // Automatically solve the puzzle
        this.game.finishPath();
        
        debugLog('Reached End', { 
            pathLength: this.currentPath.length 
        });
    }
    
    /**
     * Clears the current path and resets state
     */
    clearPath() {
        this.isFollowing = false;
        this.currentPosition = null;
        this.currentPath = [];
        this.lastMousePosition = null;
        this.lastUpdateTime = 0;
        this.canvas.style.cursor = 'default';
        
        debugLog('Path Cleared', {});
    }
    
    /**
     * Enables input handling
     */
    enable() {
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.cursor = 'default';
    }
    
    /**
     * Disables input handling
     */
    disable() {
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.cursor = 'default';
        this.clearPath();
    }
    
    /**
     * Updates the game instance reference
     * @param {Game} gameInstance - New game instance
     */
    setGame(gameInstance) {
        this.game = gameInstance;
    }
    
    /**
     * Gets current following state
     * @returns {boolean} - True if currently following mouse
     */
    isCurrentlyFollowing() {
        return this.isFollowing;
    }
    
    /**
     * Gets the current path
     * @returns {Array} - Array of {x, y} coordinates
     */
    getCurrentPath() {
        return [...this.currentPath];
    }
    
    /**
     * Gets the current position
     * @returns {Object|null} - Current position {x, y} or null
     */
    getCurrentPosition() {
        return this.currentPosition ? { ...this.currentPosition } : null;
    }
    
    /**
     * Cleanup method to remove event listeners
     */
    destroy() {
        // Remove mouse events
        this.canvas.removeEventListener('click', this.handleClick.bind(this));
        this.canvas.removeEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        // Remove touch events
        this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        
        debugLog('Simple Maze Input Handler Destroyed', {});
    }
}

// ===========================
// EXPORT FOR OTHER MODULES
// ===========================

// Make MazeInputHandler available globally
window.MazeInputHandler = MazeInputHandler;