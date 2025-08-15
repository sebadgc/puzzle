class GridGenerator {
    constructor() {
        this.gridWidth = 0;
        this.gridHeight = 0;
        this.nodes = [];        // Intersection points
        this.edges = [];        // Available paths between nodes
        this.cells = [];        // Cell contents (for elements)
        this.startNode = null;
        this.endNode = null;
    }
    
    /**
     * Generate a new grid puzzle
     * @param {number} width - Grid width (number of cells)
     * @param {number} height - Grid height (number of cells)
     */
    generate(width, height) {
        this.gridWidth = width;
        this.gridHeight = height;
        
        // Create nodes (intersection points)
        // For a 5x5 grid of cells, we need 6x6 nodes
        this.nodes = [];
        for (let y = 0; y <= height; y++) {
            for (let x = 0; x <= width; x++) {
                this.nodes.push({
                    x: x,
                    y: y,
                    id: `${x},${y}`,
                    isStart: false,
                    isEnd: false
                });
            }
        }
        console.log('Created nodes:', this.nodes.length, 'First:', this.nodes[0], 'Last:', this.nodes[this.nodes.length - 1]);
        console.log('Looking for bottom-left (0,', height, ')');

        // Create edges (all possible paths)
        this.edges = [];
        
        // Horizontal edges
        for (let y = 0; y <= height; y++) {
            for (let x = 0; x < width; x++) {
                this.edges.push({
                    from: `${x},${y}`,
                    to: `${x + 1},${y}`,
                    type: 'horizontal'
                });
            }
        }
        
        // Vertical edges
        for (let y = 0; y < height; y++) {
            for (let x = 0; x <= width; x++) {
                this.edges.push({
                    from: `${x},${y}`,
                    to: `${x},${y + 1}`,
                    type: 'vertical'
                });
            }
        }
        
        // Initialize cells (for future elements)
        this.cells = [];
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.cells.push({
                    x: x,
                    y: y,
                    element: null  // Will hold squares, stars, etc.
                });
            }
        }
        
        // Set start at bottom-left
        this.startNode = this.nodes.find(n => n.x === 0 && n.y === height);
        console.log(this.nodes)
        if (!this.startNode) {
            console.error('Start node not found! Total nodes:', this.nodes.length);
            // Fallback to first node
            this.startNode = this.nodes[0];
        }

        this.startNode.isStart = true;
        
        // Set random end point
        this.placeRandomEnd();
        
        // Add some test elements to cells
        this.placeTestElements();
        
        return this.getGridData();
    }
    
    placeRandomEnd() {
        // Choose a random edge node (not corner)
        const edgeNodes = this.nodes.filter(node => {
            const isEdge = node.x === 0 || node.x === this.gridWidth || 
                          node.y === 0 || node.y === this.gridHeight;
            const isNotStart = !node.isStart;
            return isEdge && isNotStart;
        });
        
        const randomEnd = edgeNodes[Math.floor(Math.random() * edgeNodes.length)];
        randomEnd.isEnd = true;
        this.endNode = randomEnd;
    }
    
    placeTestElements() {
        // Add some colored squares for testing
        if (this.cells.length > 4) {
            this.cells[1].element = { type: 'square', color: '#ffeb3b' };
            this.cells[3].element = { type: 'square', color: '#ff9800' };
            this.cells[this.cells.length - 2].element = { type: 'square', color: '#ffeb3b' };
        }
    }
    
    getNodeAt(x, y) {
        return this.nodes.find(n => n.x === x && n.y === y);
    }
    
    getEdge(fromId, toId) {
        return this.edges.find(e => 
            (e.from === fromId && e.to === toId) ||
            (e.from === toId && e.to === fromId)
        );
    }
    
    getGridData() {
        return {
            width: this.gridWidth,
            height: this.gridHeight,
            nodes: this.nodes,
            edges: this.edges,
            cells: this.cells,
            startNode: this.startNode,
            endNode: this.endNode
        };
    }

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

window.GridGenerator = GridGenerator;