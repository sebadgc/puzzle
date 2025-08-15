/**
 * INPUTHANDLER.JS - Input Handling Module
 * 
 * This module handles:
 * - Mouse and touch input
 * - Path drawing with maze constraints
 * - High-resolution movement tracking
 */

class InputHandler {
    constructor(canvas, gameController) {
        this.canvas = canvas;
        this.game = gameController;
        
        // Input state
        this.isDrawing = false;
        this.mousePos = { x: 0, y: 0 };
        this.lastGridCell = null;
        
        this.setupEventListeners();
    }
    
    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    /**
     * Get mouse position relative to canvas
     * @param {Event} event - Mouse or touch event
     * @returns {Object} Position {x, y}
     */
    getEventPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        
        // Handle both mouse and touch events
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);
        
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    /**
     * Handle mouse down event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseDown(event) {
        const pos = this.getEventPosition(event);
        const gridPos = pixelToGrid(pos.x, pos.y, this.game.cellSize);
        
        // Check if clicking on start position
        if (this.game.isStartPosition(gridPos.x, gridPos.y)) {
            this.startDrawing(gridPos);
        }
    }
    
    /**
     * Handle mouse move event
     * @param {MouseEvent} event - Mouse event
     */
    // handleMouseMove(event) {
    //     this.mousePos = this.getEventPosition(event);
        
    //     if (this.isDrawing) {
    //         this.updatePath();
    //     }
    // }
    
    /**
     * Handle mouse up event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseUp(event) {
        // Don't stop drawing on mouse up - continue until reaching end or clicking again
        if (this.isDrawing) {
            const pos = this.getEventPosition(event);
            const gridPos = pixelToGrid(pos.x, pos.y, this.game.cellSize);
            
            // Stop drawing if clicking somewhere other than the current path
            if (!this.game.isOnPath(gridPos.x, gridPos.y)) {
                this.stopDrawing();
            }
        }
    }
    
    /**
     * Handle mouse leave event
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseLeave(event) {
        // Continue drawing even when mouse leaves canvas
        this.mousePos = null;
    }
    
    /**
     * Handle touch start event
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
            this.handleMouseDown(mouseEvent);
        }
    }
    
    /**
     * Handle touch move event
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            const mouseEvent = { clientX: touch.clientX, clientY: touch.clientY };
            this.handleMouseMove(mouseEvent);
        }
    }
    
    /**
     * Handle touch end event
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        event.preventDefault();
        this.handleMouseUp(event);
    }
    
    /**
     * Start drawing from position
     * @param {Object} gridPos - Starting grid position
     */
    startDrawing(gridPos) {
        this.isDrawing = true;
        this.lastGridCell = { ...gridPos };
        
        // Initialize path with high-resolution center point
        const highResPos = gridToHighRes(gridPos.x, gridPos.y, this.game.resolution);
        this.game.startPath(highResPos);
        
        debugLog('InputHandler', `Started drawing from (${gridPos.x}, ${gridPos.y})`);
    }
    
    /**
     * Update path based on mouse position
     */
    updatePath() {
        if (!this.mousePos || !this.isDrawing) return;
        
        // Get current grid cell under mouse
        const gridPos = pixelToGrid(this.mousePos.x, this.mousePos.y, this.game.cellSize);
        
        // Build path from last position to mouse position
        const pathToMouse = this.buildContinuousPath(this.lastGridCell, gridPos);
        
        // Add all intermediate cells to ensure no gaps
        for (const cell of pathToMouse) {
            if (this.game.isValidMove(cell.x, cell.y)) {
                this.extendPathToCell(cell);
                this.lastGridCell = { ...cell };
                
                // Check if reached end
                if (this.game.isEndPosition(cell.x, cell.y)) {
                    this.completeDrawing();
                    return;
                }
            }
        }
}


    buildContinuousPath(from, to) {
        if (!from) return [to];
        
        const path = [];
        let current = { ...from };
        
        // Use Bresenham's line algorithm for continuous path
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        const sx = from.x < to.x ? 1 : -1;
        const sy = from.y < to.y ? 1 : -1;
        let err = dx - dy;
        
        while (current.x !== to.x || current.y !== to.y) {
            const e2 = 2 * err;
            
            if (e2 > -dy) {
                err -= dy;
                current.x += sx;
                path.push({ ...current });
            }
            
            if (e2 < dx) {
                err += dx;
                current.y += sy;
                path.push({ ...current });
            }
        }
        
        return path;
    }
    // Key changes to InputHandler class:

    handleMouseMove(event) {
        this.mousePos = this.getEventPosition(event);
        
        if (this.isDrawing) {
            // Find nearest node to mouse
            const nearestNode = this.findNearestNode(this.mousePos);
            
            if (nearestNode && this.canMoveTo(nearestNode)) {
                this.extendPathToNode(nearestNode);
            }
        }
    }

    findNearestNode(mousePos) {
        const padding = 40;
        const cellSize = this.game.cellSize;
        const nodes = this.game.currentGrid.nodes;
        
        let nearest = null;
        let minDist = Infinity;
        
        for (const node of nodes) {
            const nodeX = padding + node.x * cellSize;
            const nodeY = padding + node.y * cellSize;
            const dist = Math.sqrt(
                Math.pow(mousePos.x - nodeX, 2) + 
                Math.pow(mousePos.y - nodeY, 2)
            );
            
            if (dist < minDist && dist < 30) { // 30px threshold
                minDist = dist;
                nearest = node;
            }
        }
        
        return nearest;
    }

    canMoveTo(node) {
        if (!this.game.currentPath || this.game.currentPath.length === 0) {
            return false;
        }
        
        const lastNode = this.game.currentPath[this.game.currentPath.length - 1];
        
        // Check if nodes are adjacent (connected by an edge)
        const edge = this.game.currentGrid.edges.find(e =>
            (e.from === lastNode.id && e.to === node.id) ||
            (e.from === node.id && e.to === lastNode.id)
        );
        
        return edge !== null;
    }

    extendPathToNode(node) {
        // Check if backtracking
        const existingIndex = this.game.currentPath.findIndex(n => n.id === node.id);
        
        if (existingIndex !== -1) {
            // Backtrack
            this.game.currentPath = this.game.currentPath.slice(0, existingIndex + 1);
        } else {
            // Add new node
            this.game.currentPath.push(node);
        }
        
        // Check if reached end
        if (node.isEnd) {
            this.completeDrawing();
        }
        
        this.game.render();
    }
    /**
     * Extend path to cover a cell
     * @param {Object} gridPos - Target grid position
     */
    extendPathToCell(gridPos) {
        // Generate high-res path points to fill the cell
        const cellPath = this.generateCellPath(gridPos);
        
        // Add to game path
        for (const point of cellPath) {
            this.game.addPathPoint(point);
        }
    }
    
    /**
     * Generate high-resolution path points for a cell
     * @param {Object} gridPos - Grid position
     * @returns {Array} Array of high-res points
     */
    generateCellPath(gridPos) {
        const points = [];
        const res = this.game.resolution;
        
        // Instead of filling the whole cell, create a smooth line through it
        const centerX = gridPos.x * res + Math.floor(res / 2);
        const centerY = gridPos.y * res + Math.floor(res / 2);
        
        // Get last point in current path
        const lastPoint = this.game.currentPath[this.game.currentPath.length - 1];
        
        if (lastPoint) {
            // Interpolate from last point to center of new cell
            const steps = res;
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                points.push({
                    x: Math.round(lastPoint.x + (centerX - lastPoint.x) * t),
                    y: Math.round(lastPoint.y + (centerY - lastPoint.y) * t)
                });
            }
        } else {
            points.push({ x: centerX, y: centerY });
        }
        
        return points;
    }
    
    /**
     * Stop drawing
     */
    stopDrawing() {
        this.isDrawing = false;
        this.lastGridCell = null;
        
        debugLog('InputHandler', 'Stopped drawing');
    }
    
    /**
     * Complete drawing (reached end)
     */
    completeDrawing() {
        this.isDrawing = false;
        this.lastGridCell = null;
        
        // Trigger validation
        this.game.validateAndComplete();
        
        debugLog('InputHandler', 'Drawing completed - reached end');
    }
    
    /**
     * Clear input state
     */
    clear() {
        this.isDrawing = false;
        this.mousePos = { x: 0, y: 0 };
        this.lastGridCell = null;
    }
    
    /**
     * Destroy event listeners
     */
    destroy() {
        // Remove all event listeners
        const newCanvas = this.canvas.cloneNode(true);
        this.canvas.parentNode.replaceChild(newCanvas, this.canvas);
    }
}

// Export for use in other modules
window.InputHandler = InputHandler;