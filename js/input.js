/**
 * INPUT.JS - Mouse and Touch Input Handling
 * 
 * This module handles:
 * - Mouse events for desktop interaction
 * - Touch events for mobile devices
 * - Converting screen coordinates to grid coordinates
 * - Path drawing logic
 */

// ===========================
// INPUT HANDLER CLASS
// ===========================

class InputHandler {
    constructor(canvas, gameInstance) {
        this.canvas = canvas;
        this.game = gameInstance;
        this.isDrawing = false;
        this.lastGridPosition = null;
        
        this.setupEventListeners();
        
        debugLog('Input Handler Initialized', {
            canvas: this.canvas.id,
            hasGame: !!this.game
        });
    }
    
    /**
     * Sets up all mouse and touch event listeners
     */
    setupEventListeners() {
        // Mouse events for desktop
        this.canvas.addEventListener('mousedown', this.handleStart.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleEnd.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleEnd.bind(this));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this));
        
        // Prevent default touch behaviors
        this.canvas.addEventListener('touchstart', this.preventDefault, { passive: false });
        this.canvas.addEventListener('touchmove', this.preventDefault, { passive: false });
    }
    
    /**
     * Prevents default touch behaviors to avoid scrolling
     * @param {Event} e - Touch event
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
     * Handles the start of drawing (mouse down or touch start)
     * @param {Event} event - Input event
     */
    handleStart(event) {
        const gridPos = this.getGridPositionFromEvent(event);
        if (!gridPos) return;
        
        debugLog('Drawing Start', gridPos);
        
        // Only start drawing from the start point
        if (this.game && this.game.canStartDrawingAt(gridPos)) {
            this.isDrawing = true;
            this.lastGridPosition = gridPos;
            this.game.startPath(gridPos);
            
            // Update cursor
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    /**
     * Handles drawing movement (mouse move or touch move)
     * @param {Event} event - Input event
     */
    handleMove(event) {
        if (!this.isDrawing || !this.game) return;
        
        const gridPos = this.getGridPositionFromEvent(event);
        if (!gridPos) return;
        
        // Only add point if it's different from the last point
        if (!this.lastGridPosition || 
            !pointsEqual(gridPos, this.lastGridPosition)) {
            
            // Check if the new point is adjacent to the last point
            if (areAdjacent(this.lastGridPosition, gridPos)) {
                this.lastGridPosition = gridPos;
                this.game.addPointToPath(gridPos);
                
                debugLog('Path Extended', gridPos);
            }
        }
    }
    
    /**
     * Handles the end of drawing (mouse up or touch end)
     * @param {Event} event - Input event
     */
    handleEnd(event) {
        if (!this.isDrawing) return;
        
        debugLog('Drawing End', this.lastGridPosition);
        
        this.isDrawing = false;
        this.lastGridPosition = null;
        
        // Reset cursor
        this.canvas.style.cursor = 'crosshair';
        
        // Validate the path
        if (this.game) {
            this.game.finishPath();
        }
    }
    
    /**
     * Handles touch start events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            // Use the first touch point
            const touch = event.touches[0];
            this.handleStart(touch);
        }
    }
    
    /**
     * Handles touch move events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            // Use the first touch point
            const touch = event.touches[0];
            this.handleMove(touch);
        }
    }
    
    /**
     * Handles touch end events
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        this.handleEnd(event);
    }
    
    /**
     * Enables input handling
     */
    enable() {
        this.canvas.style.pointerEvents = 'auto';
        this.canvas.style.cursor = 'crosshair';
    }
    
    /**
     * Disables input handling
     */
    disable() {
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.cursor = 'default';
        this.isDrawing = false;
        this.lastGridPosition = null;
    }
    
    /**
     * Updates the game instance reference
     * @param {Game} gameInstance - New game instance
     */
    setGame(gameInstance) {
        this.game = gameInstance;
    }
    
    /**
     * Gets current drawing state
     * @returns {boolean} - True if currently drawing
     */
    isCurrentlyDrawing() {
        return this.isDrawing;
    }
    
    /**
     * Gets the last grid position that was interacted with
     * @returns {Object|null} - {x, y} grid coordinates or null
     */
    getLastPosition() {
        return this.lastGridPosition;
    }
    
    /**
     * Cleanup method to remove event listeners
     */
    destroy() {
        // Remove mouse events
        this.canvas.removeEventListener('mousedown', this.handleStart.bind(this));
        this.canvas.removeEventListener('mousemove', this.handleMove.bind(this));
        this.canvas.removeEventListener('mouseup', this.handleEnd.bind(this));
        this.canvas.removeEventListener('mouseleave', this.handleEnd.bind(this));
        
        // Remove touch events
        this.canvas.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        this.canvas.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        this.canvas.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        this.canvas.removeEventListener('touchcancel', this.handleTouchEnd.bind(this));
        
        debugLog('Input Handler Destroyed', {});
    }
}

// ===========================
// HELPER FUNCTIONS
// ===========================

/**
 * Checks if a point is within the canvas bounds
 * @param {Object} point - {x, y} coordinates
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {boolean} - True if point is within bounds
 */
function isPointInCanvas(point, canvas) {
    const rect = canvas.getBoundingClientRect();
    return point.x >= 0 && point.x <= rect.width &&
           point.y >= 0 && point.y <= rect.height;
}

/**
 * Gets the distance between two points in pixels
 * @param {Object} point1 - {x, y} pixel coordinates
 * @param {Object} point2 - {x, y} pixel coordinates
 * @returns {number} - Distance in pixels
 */
function getPixelDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Smooths a path by removing redundant points
 * @param {Array} path - Array of {x, y} coordinates
 * @returns {Array} - Smoothed path
 */
function smoothPath(path) {
    if (path.length <= 2) return path;
    
    const smoothed = [path[0]]; // Always keep first point
    
    for (let i = 1; i < path.length - 1; i++) {
        const prev = path[i - 1];
        const current = path[i];
        const next = path[i + 1];
        
        // Keep point if it changes direction
        if (!isCollinear(prev, current, next)) {
            smoothed.push(current);
        }
    }
    
    smoothed.push(path[path.length - 1]); // Always keep last point
    return smoothed;
}

/**
 * Checks if three points are collinear (on the same line)
 * @param {Object} p1 - {x, y} coordinates
 * @param {Object} p2 - {x, y} coordinates
 * @param {Object} p3 - {x, y} coordinates
 * @returns {boolean} - True if points are collinear
 */
function isCollinear(p1, p2, p3) {
    // Calculate the area of triangle formed by three points
    // If area is 0, points are collinear
    const area = Math.abs((p1.x * (p2.y - p3.y) + 
                          p2.x * (p3.y - p1.y) + 
                          p3.x * (p1.y - p2.y)) / 2);
    return area < 0.01; // Small threshold for floating point precision
}

// ===========================
// EXPORT FOR OTHER MODULES
// ===========================

// Make InputHandler available globally
window.InputHandler = InputHandler;