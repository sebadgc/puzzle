/**
 * PUZZLE.JS - Puzzle Generation and Validation
 * 
 * This module handles:
 * - Creating puzzle configurations
 * - Validating puzzle solutions
 * - Managing puzzle rules and constraints
 */

// ===========================
// PUZZLE TYPES
// ===========================

const PUZZLE_TYPES = {
    BASIC: 'basic',           // Just start to end
    COLORED_SQUARES: 'colored_squares',  // Future: separate colored regions
    STARS: 'stars',           // Future: collect all stars
    TETRIS: 'tetris',         // Future: outline tetris shapes
    SYMMETRY: 'symmetry'      // Future: symmetric paths
};

// ===========================
// PUZZLE CLASS
// ===========================

class Puzzle {
    constructor(type = PUZZLE_TYPES.BASIC) {
        this.type = type;
        this.gridSize = GAME_CONFIG.GRID_SIZE;
        this.startPoint = null;
        this.endPoint = null;
        this.rules = [];
        this.elements = []; // Colored squares, stars, etc.
        
        this.generate();
    }
    
    /**
     * Generates a new puzzle based on the type
     */
    generate() {
        switch (this.type) {
            case PUZZLE_TYPES.BASIC:
                this.generateBasicPuzzle();
                break;
            // Future puzzle types will be added here
            default:
                this.generateBasicPuzzle();
        }
    }
    
    /**
     * Creates a simple puzzle with just start and end points
     */
    generateBasicPuzzle() {
        // Place start point on left side
        this.startPoint = {
            x: 0,
            y: Math.floor(this.gridSize / 2)
        };
        
        // Place end point on right side
        this.endPoint = {
            x: this.gridSize,
            y: Math.floor(this.gridSize / 2)
        };
        
        this.rules = ['reach_end']; // Simple rule: reach the end
        this.elements = [];
        
        debugLog('Puzzle Generated', {
            type: this.type,
            start: this.startPoint,
            end: this.endPoint
        });
    }
    
    /**
     * Validates if a given path solves the puzzle
     * @param {Array} path - Array of {x, y} coordinates
     * @returns {Object} - {isValid: boolean, message: string}
     */
    validateSolution(path) {
        if (!path || path.length === 0) {
            return {
                isValid: false,
                message: "No path drawn"
            };
        }
        
        // Check if path starts at start point
        const firstPoint = path[0];
        if (!pointsEqual(firstPoint, this.startPoint)) {
            return {
                isValid: false,
                message: "Path must start at the green circle"
            };
        }
        
        // Check if path ends at end point
        const lastPoint = path[path.length - 1];
        if (!pointsEqual(lastPoint, this.endPoint)) {
            return {
                isValid: false,
                message: "Path must end at the red square"
            };
        }
        
        // Check if path is continuous (all points are adjacent)
        for (let i = 1; i < path.length; i++) {
            if (!areAdjacent(path[i-1], path[i])) {
                return {
                    isValid: false,
                    message: "Path must be continuous"
                };
            }
        }
        
        // Validate specific puzzle rules
        const ruleValidation = this.validateRules(path);
        if (!ruleValidation.isValid) {
            return ruleValidation;
        }
        
        return {
            isValid: true,
            message: "🎉 Puzzle Solved! Great job!"
        };
    }
    
    /**
     * Validates puzzle-specific rules
     * @param {Array} path - Array of {x, y} coordinates
     * @returns {Object} - {isValid: boolean, message: string}
     */
    validateRules(path) {
        // For basic puzzles, just reaching the end is enough
        if (this.type === PUZZLE_TYPES.BASIC) {
            return {
                isValid: true,
                message: "Basic puzzle rules satisfied"
            };
        }
        
        // Future: Add validation for other puzzle types
        // - Colored squares: ensure regions are properly separated
        // - Stars: ensure all stars are collected
        // - Tetris: ensure shapes are properly outlined
        
        return {
            isValid: true,
            message: "All rules satisfied"
        };
    }
    
    /**
     * Gets a hint for the current puzzle
     * @returns {string} - Hint message
     */
    getHint() {
        switch (this.type) {
            case PUZZLE_TYPES.BASIC:
                return "💡 Hint: Try drawing a straight line from green circle to red square!";
            default:
                return "💡 Hint: Start at the green circle and end at the red square!";
        }
    }
    
    /**
     * Gets puzzle data for saving/loading
     * @returns {Object} - Serializable puzzle data
     */
    serialize() {
        return {
            type: this.type,
            gridSize: this.gridSize,
            startPoint: this.startPoint,
            endPoint: this.endPoint,
            rules: this.rules,
            elements: this.elements
        };
    }
    
    /**
     * Loads puzzle from saved data
     * @param {Object} data - Puzzle data
     */
    deserialize(data) {
        this.type = data.type;
        this.gridSize = data.gridSize;
        this.startPoint = data.startPoint;
        this.endPoint = data.endPoint;
        this.rules = data.rules;
        this.elements = data.elements;
    }
}

// ===========================
// PUZZLE FACTORY FUNCTIONS
// ===========================

/**
 * Creates a new random puzzle
 * @param {string} type - Puzzle type
 * @returns {Puzzle} - New puzzle instance
 */
function createRandomPuzzle(type = PUZZLE_TYPES.BASIC) {
    return new Puzzle(type);
}

/**
 * Creates a puzzle with specific parameters
 * @param {Object} config - Puzzle configuration
 * @returns {Puzzle} - New puzzle instance
 */
function createCustomPuzzle(config) {
    const puzzle = new Puzzle();
    puzzle.deserialize(config);
    return puzzle;
}

// ===========================
// PUZZLE VALIDATION HELPERS
// ===========================

/**
 * Checks if a path has any self-intersections
 * @param {Array} path - Array of {x, y} coordinates
 * @returns {boolean} - True if path intersects itself
 */
function hasPathIntersections(path) {
    // Create a set of visited positions
    const visited = new Set();
    
    for (const point of path) {
        const key = `${point.x},${point.y}`;
        if (visited.has(key)) {
            return true; // Found intersection
        }
        visited.add(key);
    }
    
    return false;
}

/**
 * Gets all unique points in a path
 * @param {Array} path - Array of {x, y} coordinates
 * @returns {Array} - Array of unique points
 */
function getUniquePathPoints(path) {
    const unique = [];
    const seen = new Set();
    
    for (const point of path) {
        const key = `${point.x},${point.y}`;
        if (!seen.has(key)) {
            seen.add(key);
            unique.push(point);
        }
    }
    
    return unique;
}