/**
 * RENDERER.JS - Canvas Drawing and Visual Effects
 * 
 * This module handles all visual rendering:
 * - Drawing the grid and puzzle elements
 * - Rendering the player's path
 * - Visual effects and animations
 * - Canvas management
 */

// ===========================
// RENDERER CLASS
// ===========================

class GameRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Set up high-DPI canvas for crisp graphics
        this.setupHighDPICanvas();
        
        debugLog('Renderer Initialized', {
            canvasSize: `${this.canvas.width}x${this.canvas.height}`,
            dpr: window.devicePixelRatio
        });
    }
    
    /**
     * Sets up canvas for high-DPI displays
     */
    setupHighDPICanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    /**
     * Clears the entire canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Draws everything on the canvas
     * @param {Puzzle} puzzle - Current puzzle
     * @param {Array} currentPath - Player's current path
     */
    drawAll(puzzle, currentPath = []) {
        this.clear();
        this.drawGrid();
        this.drawPuzzleElements(puzzle);
        this.drawPath(currentPath);
    }
    
    /**
     * Draws the background grid
     */
    drawGrid() {
        const ctx = this.ctx;
        const gridSize = GAME_CONFIG.GRID_SIZE;
        const cellSize = GAME_CONFIG.CELL_SIZE;
        
        // Draw grid lines
        ctx.strokeStyle = GAME_CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x <= gridSize; x++) {
            const pixelX = x * cellSize + cellSize / 2;
            ctx.beginPath();
            ctx.moveTo(pixelX, cellSize / 2);
            ctx.lineTo(pixelX, gridSize * cellSize + cellSize / 2);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y <= gridSize; y++) {
            const pixelY = y * cellSize + cellSize / 2;
            ctx.beginPath();
            ctx.moveTo(cellSize / 2, pixelY);
            ctx.lineTo(gridSize * cellSize + cellSize / 2, pixelY);
            ctx.stroke();
        }
        
        // Draw intersection dots
        ctx.fillStyle = GAME_CONFIG.COLORS.GRID_DOT;
        for (let x = 0; x <= gridSize; x++) {
            for (let y = 0; y <= gridSize; y++) {
                const pixel = gridToPixel(x, y);
                ctx.beginPath();
                ctx.arc(pixel.x, pixel.y, 3, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
    
    /**
     * Draws puzzle elements (start point, end point, etc.)
     * @param {Puzzle} puzzle - Current puzzle
     */
    drawPuzzleElements(puzzle) {
        if (!puzzle) return;
        
        this.drawStartPoint(puzzle.startPoint);
        this.drawEndPoint(puzzle.endPoint);
        
        // Future: Draw other puzzle elements (colored squares, stars, etc.)
        this.drawPuzzleSpecificElements(puzzle);
    }
    
    /**
     * Draws the start point (green circle)
     * @param {Object} startPoint - {x, y} grid coordinates
     */
    drawStartPoint(startPoint) {
        if (!startPoint) return;
        
        const pixel = gridToPixel(startPoint.x, startPoint.y);
        const ctx = this.ctx;
        
        // Draw main circle
        ctx.fillStyle = GAME_CONFIG.COLORS.START_POINT;
        ctx.beginPath();
        ctx.arc(pixel.x, pixel.y, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * Draws the end point (red rounded square)
     * @param {Object} endPoint - {x, y} grid coordinates
     */
    drawEndPoint(endPoint) {
        if (!endPoint) return;
        
        const pixel = gridToPixel(endPoint.x, endPoint.y);
        const ctx = this.ctx;
        
        // Draw rounded square
        ctx.fillStyle = GAME_CONFIG.COLORS.END_POINT;
        ctx.beginPath();
        ctx.roundRect(pixel.x - 10, pixel.y - 10, 20, 20, 3);
        ctx.fill();
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    /**
     * Draws puzzle-specific elements
     * @param {Puzzle} puzzle - Current puzzle
     */
    drawPuzzleSpecificElements(puzzle) {
        // Future implementation for different puzzle types
        switch (puzzle.type) {
            case PUZZLE_TYPES.COLORED_SQUARES:
                this.drawColoredSquares(puzzle.elements);
                break;
            case PUZZLE_TYPES.STARS:
                this.drawStars(puzzle.elements);
                break;
            case PUZZLE_TYPES.TETRIS:
                this.drawTetrisShapes(puzzle.elements);
                break;
        }
    }
    
    /**
     * Draws the player's current path
     * @param {Array} path - Array of {x, y} grid coordinates
     */
    drawPath(path) {
        if (!path || path.length < 2) return;
        
        const ctx = this.ctx;
        
        ctx.strokeStyle = GAME_CONFIG.COLORS.PATH;
        ctx.lineWidth = GAME_CONFIG.LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        
        // Convert grid coordinates to pixel coordinates and draw path
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const pixel = gridToPixel(point.x, point.y);
            
            if (i === 0) {
                ctx.moveTo(pixel.x, pixel.y);
            } else {
                ctx.lineTo(pixel.x, pixel.y);
            }
        }
        
        ctx.stroke();
        
        // Draw path endpoints
        this.drawPathEndpoints(path);
    }
    
    /**
     * Draws small circles at path endpoints for better visibility
     * @param {Array} path - Array of {x, y} grid coordinates
     */
    drawPathEndpoints(path) {
        if (!path || path.length === 0) return;
        
        const ctx = this.ctx;
        
        // Draw start of path
        const startPixel = gridToPixel(path[0].x, path[0].y);
        ctx.fillStyle = GAME_CONFIG.COLORS.PATH;
        ctx.beginPath();
        ctx.arc(startPixel.x, startPixel.y, GAME_CONFIG.LINE_WIDTH / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw end of path (if different from start)
        if (path.length > 1) {
            const endPixel = gridToPixel(path[path.length - 1].x, path[path.length - 1].y);
            ctx.beginPath();
            ctx.arc(endPixel.x, endPixel.y, GAME_CONFIG.LINE_WIDTH / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
    
    /**
     * Draws a glowing effect around the path (for success animation)
     * @param {Array} path - Array of {x, y} grid coordinates
     * @param {number} glowIntensity - Glow intensity (0-20)
     */
    drawGlowingPath(path, glowIntensity = 10) {
        if (!path || path.length < 2) return;
        
        const ctx = this.ctx;
        
        // Save current state
        ctx.save();
        
        // Set up glow effect
        ctx.shadowBlur = glowIntensity;
        ctx.shadowColor = GAME_CONFIG.COLORS.GLOW;
        ctx.strokeStyle = GAME_CONFIG.COLORS.GLOW;
        ctx.lineWidth = GAME_CONFIG.LINE_WIDTH + 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const pixel = gridToPixel(point.x, point.y);
            
            if (i === 0) {
                ctx.moveTo(pixel.x, pixel.y);
            } else {
                ctx.lineTo(pixel.x, pixel.y);
            }
        }
        
        ctx.stroke();
        
        // Restore state
        ctx.restore();
        
        // Draw regular path on top
        this.drawPath(path);
    }
    
    /**
     * Future: Draw colored squares for puzzle type
     * @param {Array} elements - Array of colored square elements
     */
    drawColoredSquares(elements) {
        // Implementation for colored squares puzzle type
        // This will be added when we implement that puzzle type
    }
    
    /**
     * Future: Draw stars for collection puzzle type
     * @param {Array} elements - Array of star elements
     */
    drawStars(elements) {
        // Implementation for stars puzzle type
        // This will be added when we implement that puzzle type
    }
    
    /**
     * Future: Draw tetris shapes for outline puzzle type
     * @param {Array} elements - Array of tetris shape elements
     */
    drawTetrisShapes(elements) {
        // Implementation for tetris puzzle type
        // This will be added when we implement that puzzle type
    }
    
    /**
     * Animates a celebration effect when puzzle is solved
     * @param {Array} path - The solved path
     * @param {Function} callback - Called when animation completes
     */
    celebrateWin(path, callback) {
        let glowIntensity = 0;
        let increasing = true;
        let animationCount = 0;
        const maxAnimations = 3;
        
        const animate = () => {
            // Clear and redraw everything
            this.clear();
            this.drawGrid();
            
            // Draw the glowing path
            this.drawGlowingPath(path, glowIntensity);
            
            // Update glow intensity
            if (increasing) {
                glowIntensity += 2;
                if (glowIntensity >= GAME_CONFIG.MAX_GLOW) {
                    increasing = false;
                }
            } else {
                glowIntensity -= 2;
                if (glowIntensity <= 0) {
                    increasing = true;
                    animationCount++;
                }
            }
            
            // Continue animation or finish
            if (animationCount < maxAnimations) {
                setTimeout(animate, GAME_CONFIG.GLOW_SPEED);
            } else {
                // Final draw without glow
                this.clear();
                this.drawGrid();
                this.drawPath(path);
                if (callback) callback();
            }
        };
        
        animate();
    }
    
    /**
     * Gets the canvas element (useful for input handling)
     * @returns {HTMLCanvasElement} - The canvas element
     */
    getCanvas() {
        return this.canvas;
    }
    
    /**
     * Gets the 2D rendering context
     * @returns {CanvasRenderingContext2D} - The 2D context
     */
    getContext() {
        return this.ctx;
    }
}

// ===========================
// EXPORT FOR OTHER MODULES
// ===========================

// Make GameRenderer available globally
window.GameRenderer = GameRenderer;