/**
 * RENDERER.JS - Debug Renderer - Let's see what's happening
 */

class MazeRenderer {
    constructor(canvasId) {
        console.log('🔍 Trying to find canvas with ID:', canvasId);
        
        this.canvas = document.getElementById(canvasId);
        
        if (!this.canvas) {
            console.error('❌ Canvas not found! Available elements:', 
                Array.from(document.querySelectorAll('canvas')).map(c => c.id));
            return;
        }
        
        console.log('✅ Canvas found:', this.canvas);
        
        this.ctx = this.canvas.getContext('2d');
        
        if (!this.ctx) {
            console.error('❌ Could not get 2D context');
            return;
        }
        
        console.log('✅ 2D context obtained');
        
        // Test draw immediately
        this.testDraw();
        
        console.log('✅ MazeRenderer initialized successfully');
    }
    
    /**
     * Test if canvas is working at all
     */
    testDraw() {
        console.log('🎨 Testing canvas drawing...');
        
        const ctx = this.ctx;
        
        // Clear with bright color so we know it's working
        ctx.fillStyle = '#ff0000'; // Bright red
        ctx.fillRect(0, 0, 500, 500);
        
        // Draw test pattern
        ctx.fillStyle = '#00ff00'; // Bright green
        ctx.fillRect(50, 50, 100, 100);
        
        ctx.fillStyle = '#0000ff'; // Bright blue
        ctx.fillRect(200, 200, 100, 100);
        
        // Draw text
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px Arial';
        ctx.fillText('CANVAS WORKING!', 150, 300);
        
        console.log('✅ Test drawing complete - you should see red background with green/blue squares');
    }
    
    /**
     * Resize canvas
     */
    resizeCanvas(width, height) {
        console.log('📐 Resizing canvas to:', width, 'x', height);
        
        this.canvas.width = width * 20; // Make it bigger
        this.canvas.height = height * 20;
        this.canvas.style.width = (width * 20) + 'px';
        this.canvas.style.height = (height * 20) + 'px';
        
        // Test draw after resize
        this.testDraw();
    }
    
    /**
     * Clear canvas
     */
    clear() {
        console.log('🧹 Clearing canvas');
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * Draw everything - now let's try to show the actual maze
     */
    drawAll(puzzle, path = []) {
        console.log('🎯 DrawAll called with:', {
            puzzle: puzzle ? 'EXISTS' : 'NULL',
            puzzleType: puzzle ? typeof puzzle : 'N/A',
            hasMaze: puzzle && puzzle.maze ? 'YES' : 'NO',
            mazeSize: puzzle && puzzle.maze ? `${puzzle.maze.length}x${puzzle.maze[0]?.length}` : 'N/A',
            pathLength: path ? path.length : 0,
            startPoint: puzzle?.startPoint,
            endPoint: puzzle?.endPoint
        });
        
        // Clear first
        this.clear();
        
        if (!puzzle) {
            console.log('❌ No puzzle provided to drawAll');
            this.drawErrorMessage('NO PUZZLE DATA');
            return;
        }
        
        if (!puzzle.maze) {
            console.log('❌ Puzzle has no maze data');
            this.drawErrorMessage('NO MAZE DATA');
            return;
        }
        
        // Try to draw the real maze now
        console.log('🧱 Attempting to draw maze...');
        this.drawMaze(puzzle.maze);
        
        // Draw start/end if they exist
        if (puzzle.startPoint) {
            console.log('📍 Drawing start point:', puzzle.startPoint);
            this.drawStartPoint(puzzle.startPoint);
        } else {
            console.log('⚠️ No start point found');
        }
        
        if (puzzle.endPoint) {
            console.log('🎯 Drawing end point:', puzzle.endPoint);
            this.drawEndPoint(puzzle.endPoint);
        } else {
            console.log('⚠️ No end point found');
        }
        
        // Draw path if it exists
        if (path && path.length > 0) {
            console.log('🛤️ Drawing path with', path.length, 'points');
            this.drawPath(path);
        }
        
        console.log('✅ DrawAll complete');
    }
    
    /**
     * Draw error message
     */
    drawErrorMessage(message) {
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(0, 0, 400, 400);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(message, 50, 200);
    }
    
    /**
     * Draw the actual maze - improved version
     */
    drawMaze(maze) {
        console.log('🧱 Drawing maze, size:', maze.length, 'x', maze[0].length);
        console.log('🔍 First few cells:', maze[0].slice(0, 5));
        console.log('🔍 CELL_TYPES available:', typeof CELL_TYPES !== 'undefined' ? CELL_TYPES : 'NOT DEFINED');
        
        const cellSize = 20;
        const ctx = this.ctx;
        
        // Draw background first
        ctx.fillStyle = '#1a1a2e'; // Dark background
        ctx.fillRect(0, 0, maze[0].length * cellSize, maze.length * cellSize);
        
        for (let y = 0; y < maze.length; y++) {
            for (let x = 0; x < maze[y].length; x++) {
                const cell = maze[y][x];
                const pixelX = x * cellSize;
                const pixelY = y * cellSize;
                
                // Try to detect what each cell value means
                if (cell === 0) {
                    // Assuming 0 = wall
                    ctx.fillStyle = '#16213e'; // Dark blue walls
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                } else if (cell === 1) {
                    // Assuming 1 = path
                    ctx.fillStyle = '#e3f2fd'; // Light blue paths
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                } else if (cell === 2) {
                    // Assuming 2 = start
                    ctx.fillStyle = '#c8e6c9'; // Light green
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                } else if (cell === 3) {
                    // Assuming 3 = end
                    ctx.fillStyle = '#ffcdd2'; // Light red
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                } else {
                    // Unknown cell type - make it bright magenta so we notice
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillRect(pixelX, pixelY, cellSize, cellSize);
                    console.log(`⚠️ Unknown cell type ${cell} at (${x}, ${y})`);
                }
            }
        }
        
        console.log('✅ Maze drawn successfully');
    }
    
    /**
     * Draw start point
     */
    drawStartPoint(startPoint) {
        const cellSize = 20;
        const ctx = this.ctx;
        const centerX = startPoint.x * cellSize + cellSize / 2;
        const centerY = startPoint.y * cellSize + cellSize / 2;
        
        ctx.fillStyle = '#00ff00'; // Bright green
        ctx.beginPath();
        ctx.arc(centerX, centerY, cellSize / 3, 0, 2 * Math.PI);
        ctx.fill();
        
        console.log('✅ Start point drawn at:', centerX, centerY);
    }
    
    /**
     * Draw end point
     */
    drawEndPoint(endPoint) {
        const cellSize = 20;
        const ctx = this.ctx;
        const centerX = endPoint.x * cellSize + cellSize / 2;
        const centerY = endPoint.y * cellSize + cellSize / 2;
        
        ctx.fillStyle = '#ff0000'; // Bright red
        ctx.fillRect(centerX - cellSize/3, centerY - cellSize/3, cellSize*2/3, cellSize*2/3);
        
        console.log('✅ End point drawn at:', centerX, centerY);
    }
    
    /**
     * Draw path
     */
    drawPath(path) {
        if (!path || path.length < 2) return;
        
        console.log('🛤️ Drawing path with', path.length, 'points');
        
        const cellSize = 20;
        const ctx = this.ctx;
        
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            const x = point.x * cellSize / 10 + cellSize / 2;
            const y = point.y * cellSize / 10 + cellSize / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    /**
     * Celebration
     */
    celebrateWin(path, puzzle, callback) {
        console.log('🎉 CELEBRATING WIN!');
        
        // Flash the screen
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        setTimeout(() => {
            this.drawAll(puzzle, path);
            if (callback) callback();
        }, 1000);
    }
    
    /**
     * Get canvas
     */
    getCanvas() {
        return this.canvas;
    }
    
    /**
     * Get context
     */
    getContext() {
        return this.ctx;
    }
}

// Export
window.MazeRenderer = MazeRenderer;