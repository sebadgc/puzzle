/**
 * RENDERER.JS - Rendering Engine
 * 
 * This module handles:
 * - Canvas rendering
 * - Visual effects
 * - Path drawing with full cell coverage
 * - Animations
 */

class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Rendering settings
        this.cellSize = GAME_CONFIG.DEFAULT_CELL_SIZE;
        this.resolution = GAME_CONFIG.DEFAULT_RESOLUTION;
        this.pixelPerMovement = this.cellSize / this.resolution;
        
        // Animation state
        this.animations = [];
        this.glowIntensity = 0;
        this.glowDirection = 1;
        
        this.setupCanvas();
    }
    
    /**
     * Setup canvas with proper scaling
     */
    setupCanvas() {
        // Handle high DPI displays
        const dpr = window.devicePixelRatio || 1;
        
        if (dpr !== 1) {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        }
    }
    
    /**
     * Update canvas size
     * @param {number} width - Width in pixels
     * @param {number} height - Height in pixels
     */
    updateSize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupCanvas();
    }
    
    /**
     * Update rendering settings
     * @param {number} cellSize - Cell size in pixels
     * @param {number} resolution - Resolution multiplier
     */
    updateSettings(cellSize, resolution) {
        this.cellSize = cellSize;
        this.resolution = resolution;
        this.pixelPerMovement = cellSize / resolution;
    }
    
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Render the complete game state
     * @param {Object} gameState - Current game state
     */
    render(gameState) {
        this.clear();
        
        const { gridData, maze, startPos, endPos, currentPath, isDrawing, showSolution, solution, requiredPoints } = gameState;
        
        if (!maze) return;
        
        // Draw maze
        this.drawGrid(gridData)
        //this.drawMaze(maze);
        
        if (requiredPoints) {
        this.drawRequiredPoints(requiredPoints);
    }

        // Draw path (full cell coverage)
        if (currentPath && currentPath.length > 0) {
            this.drawGridPath(currentPath);
        }
        
        // Draw solution if requested
        if (showSolution && solution) {
            this.drawSolution(solution);
        }
        
        // Draw start and end points (on top)
        if (startPos) this.drawStartPoint(startPos);
        if (endPos) this.drawEndPoint(endPos);
        
        // Draw any active animations
        this.updateAnimations();
    }
    
    /**
     * Draw the maze grid
     * @param {Array} maze - 2D maze array
     */
    // drawMaze(maze) {
    //     const ctx = this.ctx;
        
    //     for (let y = 0; y < maze.length; y++) {
    //         for (let x = 0; x < maze[y].length; x++) {
    //             const pixelX = x * this.cellSize;
    //             const pixelY = y * this.cellSize;
                
    //             // Draw cell based on type
    //             if (maze[y][x] === CELL_TYPES.WALL) {
    //                 ctx.fillStyle = GAME_CONFIG.COLORS.WALL;
    //             } else {
    //                 ctx.fillStyle = GAME_CONFIG.COLORS.PATH;
    //             }
                
    //             ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                
    //             // Draw subtle grid lines
    //             ctx.strokeStyle = GAME_CONFIG.COLORS.PATH_BORDER;
    //             ctx.lineWidth = 1;
    //             ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
    //         }
    //     }
    // }

    drawGrid(gridData) {
        const ctx = this.ctx;
        const { nodes, edges, cells } = gridData;
        
        // Calculate spacing
        const cellSize = this.cellSize;
        const padding = 40; // Padding from canvas edge
        
        // Draw background
        ctx.fillStyle = GAME_CONFIG.COLORS.BACKGROUND;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw cells (background squares)
        for (const cell of cells) {
            const x = padding + cell.x * cellSize;
            const y = padding + cell.y * cellSize;
            
            ctx.fillStyle = GAME_CONFIG.COLORS.CELL_FILL;
            ctx.fillRect(x + 5, y + 5, cellSize - 10, cellSize - 10);
            
            // Draw element if present
            if (cell.element) {
                this.drawCellElement(x, y, cellSize, cell.element);
            }
        }
        
        // Draw grid lines (the paths you can draw on)
        ctx.strokeStyle = GAME_CONFIG.COLORS.PATH_LINE;
        ctx.lineWidth = GAME_CONFIG.LINE_THICKNESS;
        ctx.lineCap = 'round';
        
        for (const edge of edges) {
            const [fromX, fromY] = edge.from.split(',').map(Number);
            const [toX, toY] = edge.to.split(',').map(Number);
            
            ctx.beginPath();
            ctx.moveTo(padding + fromX * cellSize, padding + fromY * cellSize);
            ctx.lineTo(padding + toX * cellSize, padding + toY * cellSize);
            ctx.stroke();
        }
        
        // Draw nodes (intersection points)
        for (const node of nodes) {
            const x = padding + node.x * cellSize;
            const y = padding + node.y * cellSize;
            
            if (node.isStart) {
                // Start node - larger, green
                ctx.fillStyle = GAME_CONFIG.COLORS.START;
                ctx.beginPath();
                ctx.arc(x, y, GAME_CONFIG.NODE_RADIUS * 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (node.isEnd) {
                // End node - larger, orange
                ctx.fillStyle = GAME_CONFIG.COLORS.END;
                ctx.beginPath();
                ctx.arc(x, y, GAME_CONFIG.NODE_RADIUS * 1.5, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Regular node
                ctx.fillStyle = GAME_CONFIG.COLORS.NODE;
                ctx.beginPath();
                ctx.arc(x, y, GAME_CONFIG.NODE_RADIUS * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    drawCellElement(x, y, size, element) {
        const ctx = this.ctx;
        const centerX = x + size / 2;
        const centerY = y + size / 2;
        const elementSize = size * 0.4;
        
        if (element.type === 'square') {
            // Draw colored square
            ctx.fillStyle = element.color;
            ctx.fillRect(
                centerX - elementSize / 2,
                centerY - elementSize / 2,
                elementSize,
                elementSize
            );
        } else if (element.type === 'star') {
            // Draw star
            ctx.fillStyle = element.color;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                const x = centerX + Math.cos(angle) * elementSize / 2;
                const y = centerY + Math.sin(angle) * elementSize / 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
    }

    // Update drawPath to draw along grid lines:
    drawGridPath(path, gridData) {
        if (!path || path.length < 2) return;
        
        const ctx = this.ctx;
        const padding = 40;
        const cellSize = this.cellSize;
        
        // Draw the path
        ctx.strokeStyle = GAME_CONFIG.COLORS.DRAWN_LINE;
        ctx.lineWidth = GAME_CONFIG.LINE_THICKNESS;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Add glow effect
        ctx.shadowBlur = 20;
        ctx.shadowColor = GAME_CONFIG.COLORS.DRAWN_GLOW;
        
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            const node = path[i];
            const x = padding + node.x * cellSize;
            const y = padding + node.y * cellSize;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Draw head of path
        if (path.length > 0) {
            const lastNode = path[path.length - 1];
            const x = padding + lastNode.x * cellSize;
            const y = padding + lastNode.y * cellSize;
            
            ctx.fillStyle = GAME_CONFIG.COLORS.DRAWN_LINE;
            ctx.beginPath();
            ctx.arc(x, y, GAME_CONFIG.NODE_RADIUS * 0.8, 0, Math.PI * 2);
            ctx.fill();
        }
    } 
    /**
     * Draw path with full cell coverage
     * @param {Array} path - Array of high-resolution path points
     */
    drawPath(path) {
        if (!path || path.length === 0) return;
        
        const ctx = this.ctx;
        const visitedCells = new Set();
        
        // Convert high-res path to visual cells and track visited cells
        for (const point of path) {
            const gridX = Math.floor(point.x / this.resolution);
            const gridY = Math.floor(point.y / this.resolution);
            const key = `${gridX},${gridY}`;
            
            if (!visitedCells.has(key)) {
                visitedCells.add(key);
                
                // Draw full cell coverage
                const pixelX = gridX * this.cellSize;
                const pixelY = gridY * this.cellSize;
                
                // Fill the entire cell with path color
                ctx.fillStyle = GAME_CONFIG.COLORS.LINE;
                ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);
                
                // Add glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = GAME_CONFIG.COLORS.LINE_GLOW;
                ctx.fillRect(pixelX + 2, pixelY + 2, this.cellSize - 4, this.cellSize - 4);
                ctx.shadowBlur = 0;
            }
        }
        
        // Draw connection lines between cells for smooth appearance
        this.drawCellConnections(visitedCells);
    }
    
    /**
     * Draw smooth connections between cells
     * @param {Set} visitedCells - Set of visited cell keys
     */
    drawCellConnections(visitedCells) {
        const ctx = this.ctx;
        const cells = Array.from(visitedCells).map(key => {
            const [x, y] = key.split(',').map(Number);
            return { x, y };
        });
        
        // Draw connections between adjacent cells
        for (const cell of cells) {
            const key = `${cell.x},${cell.y}`;
            
            // Check right neighbor
            if (visitedCells.has(`${cell.x + 1},${cell.y}`)) {
                ctx.fillStyle = GAME_CONFIG.COLORS.LINE;
                ctx.fillRect(
                    cell.x * this.cellSize + this.cellSize - 2,
                    cell.y * this.cellSize,
                    4,
                    this.cellSize
                );
            }
            
            // Check bottom neighbor
            if (visitedCells.has(`${cell.x},${cell.y + 1}`)) {
                ctx.fillStyle = GAME_CONFIG.COLORS.LINE;
                ctx.fillRect(
                    cell.x * this.cellSize,
                    cell.y * this.cellSize + this.cellSize - 2,
                    this.cellSize,
                    4
                );
            }
        }
    }
    
    /**
     * Draw solution path
     * @param {Array} solution - Solution path in visual coordinates
     */
    drawSolution(solution) {
        if (!solution || solution.length < 2) return;
        
        const ctx = this.ctx;
        ctx.save();
        
        // Draw as dotted line through cell centers
        ctx.strokeStyle = GAME_CONFIG.COLORS.SUCCESS;
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        for (let i = 0; i < solution.length; i++) {
            const point = solution[i];
            const pixelX = point.x * this.cellSize + this.cellSize / 2;
            const pixelY = point.y * this.cellSize + this.cellSize / 2;
            
            if (i === 0) {
                ctx.moveTo(pixelX, pixelY);
            } else {
                ctx.lineTo(pixelX, pixelY);
            }
        }
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Draw start point
     * @param {Object} position - Start position {x, y}
     */
    drawStartPoint(position) {
        const ctx = this.ctx;
        const centerX = position.x * this.cellSize + this.cellSize / 2;
        const centerY = position.y * this.cellSize + this.cellSize / 2;
        
        // Draw circle
        ctx.fillStyle = GAME_CONFIG.COLORS.START;
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.cellSize / 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Add inner circle for depth
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(centerX - 3, centerY - 3, this.cellSize / 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    /**
     * Draw end point
     * @param {Object} position - End position {x, y}
     */
    drawEndPoint(position) {
        const ctx = this.ctx;
        const centerX = position.x * this.cellSize + this.cellSize / 2;
        const centerY = position.y * this.cellSize + this.cellSize / 2;
        const size = this.cellSize / 2.5;
        
        // Draw square
        ctx.fillStyle = GAME_CONFIG.COLORS.END;
        ctx.fillRect(
            centerX - size / 2,
            centerY - size / 2,
            size,
            size
        );
        
        // Add inner square for depth
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(
            centerX - size / 2 + 3,
            centerY - size / 2 + 3,
            size / 3,
            size / 3
        );
    }
    
    drawRequiredPoints(requiredPoints) {
        if (!requiredPoints || requiredPoints.length === 0) return;
        
        const ctx = this.ctx;
        
        for (const point of requiredPoints) {
            const centerX = point.x * this.cellSize + this.cellSize / 2;
            const centerY = point.y * this.cellSize + this.cellSize / 2;
            
            // Draw a diamond or star shape
            ctx.fillStyle = '#ffd700'; // Gold color
            ctx.strokeStyle = '#ff8c00'; // Dark orange border
            ctx.lineWidth = 2;
            
            // Draw star
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
                const x = centerX + Math.cos(angle) * (this.cellSize / 3);
                const y = centerY + Math.sin(angle) * (this.cellSize / 3);
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    /**
     * Animate success
     * @param {Function} callback - Callback when animation completes
     */
    animateSuccess(callback) {
        const animation = {
            type: 'success',
            startTime: Date.now(),
            duration: GAME_CONFIG.CELEBRATION_DURATION,
            callback
        };
        
        this.animations.push(animation);
        this.runSuccessAnimation(animation);
    }
    
    /**
     * Run success animation
     * @param {Object} animation - Animation object
     */
    runSuccessAnimation(animation) {
        const ctx = this.ctx;
        const elapsed = Date.now() - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        
        if (progress < 1) {
            // Draw celebration effect
            ctx.save();
            ctx.globalAlpha = 1 - progress;
            ctx.fillStyle = GAME_CONFIG.COLORS.SUCCESS;
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            ctx.restore();
            
            requestAnimationFrame(() => this.runSuccessAnimation(animation));
        } else {
            // Animation complete
            this.animations = this.animations.filter(a => a !== animation);
            if (animation.callback) animation.callback();
        }
    }
    
    /**
     * Update all active animations
     */
    updateAnimations() {
        // Update glow effect
        this.glowIntensity += 0.02 * this.glowDirection;
        if (this.glowIntensity > 1 || this.glowIntensity < 0) {
            this.glowDirection *= -1;
        }
    }
    
    /**
     * Draw mouse cursor indicator
     * @param {Object} mousePos - Mouse position {x, y}
     * @param {boolean} isDrawing - Whether currently drawing
     */
    drawCursor(mousePos, isDrawing) {
        if (!isDrawing) return;
        
        const ctx = this.ctx;
        
        // Draw cursor indicator
        ctx.strokeStyle = `rgba(0, 245, 255, ${0.3 + this.glowIntensity * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 10, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Export for use in other modules
window.Renderer = Renderer;