/**
 * UTILS.JS - Constants and Helper Functions
 * 
 * This module contains:
 * - Game configuration constants
 * - Coordinate conversion utilities
 * - Common helper functions
 */

// ===========================
// GAME CONFIGURATION
// ===========================

const GAME_CONFIG = {
    // Grid settings
    DEFAULT_GRID_SIZE: 5,  // 5x5 grid of cells
    DEFAULT_LINE_WIDTH: 60, // Width of the drawable lines/paths
    DEFAULT_NODE_SIZE: 20,  // Size of intersection nodes
    
    // Visual settings
    COLORS: {
        BACKGROUND: '#2a4a2a',  // Dark green background
        GRID_LINE: '#4a6a4a',   // Grid lines (decorative)
        PATH_LINE: '#8bc34a',   // Available path color
        DRAWN_LINE: '#ffeb3b',  // User's drawn line (yellow)
        DRAWN_GLOW: 'rgba(255, 235, 59, 0.5)',
        NODE: '#5a7a5a',        // Intersection nodes
        START: '#4caf50',       // Start point (green)
        END: '#ff5722',         // End point (orange/red)
        CELL_FILL: '#3a5a3a',   // Cell interior
        ELEMENT_BG: '#2a4a2a'   // Background for elements in cells
    },
    
    // Line drawing settings
    LINE_THICKNESS: 8,      // Thickness of drawn line
    NODE_RADIUS: 10,        // Radius of intersection points
    CELL_PADDING: 10,        // Padding inside cells for elements
    
    // Animation settings
    CELEBRATION_DURATION: 2000,
    TRANSITION_SPEED: 200
};

// ===========================
// CELL TYPES
// ===========================

const CELL_TYPES = {
    WALL: 1,
    PATH: 0,
    START: 2,
    END: 3
};

// ===========================
// COORDINATE CONVERSION
// ===========================

/**
 * Convert visual grid coordinates to pixel coordinates
 * @param {number} gridX - Visual grid X coordinate
 * @param {number} gridY - Visual grid Y coordinate
 * @param {number} cellSize - Size of each cell in pixels
 * @returns {Object} Pixel coordinates {x, y}
 */
function gridToPixel(gridX, gridY, cellSize) {
    return {
        x: gridX * cellSize + cellSize / 2,
        y: gridY * cellSize + cellSize / 2
    };
}

/**
 * Convert pixel coordinates to visual grid coordinates
 * @param {number} pixelX - Pixel X coordinate
 * @param {number} pixelY - Pixel Y coordinate
 * @param {number} cellSize - Size of each cell in pixels
 * @returns {Object} Grid coordinates {x, y}
 */
function pixelToGrid(pixelX, pixelY, cellSize) {
    return {
        x: Math.floor(pixelX / cellSize),
        y: Math.floor(pixelY / cellSize)
    };
}

/**
 * Convert visual grid to high-resolution movement grid
 * @param {number} gridX - Visual grid X
 * @param {number} gridY - Visual grid Y
 * @param {number} resolution - Resolution multiplier
 * @returns {Object} High-res coordinates {x, y}
 */
function gridToHighRes(gridX, gridY, resolution) {
    return {
        x: gridX * resolution + Math.floor(resolution / 2),
        y: gridY * resolution + Math.floor(resolution / 2)
    };
}

/**
 * Convert high-resolution coordinates to visual grid
 * @param {number} highResX - High-res X
 * @param {number} highResY - High-res Y
 * @param {number} resolution - Resolution multiplier
 * @returns {Object} Visual grid coordinates {x, y}
 */
function highResToGrid(highResX, highResY, resolution) {
    return {
        x: Math.floor(highResX / resolution),
        y: Math.floor(highResY / resolution)
    };
}

/**
 * Convert pixel to high-resolution coordinates
 * @param {number} pixelX - Pixel X
 * @param {number} pixelY - Pixel Y
 * @param {number} cellSize - Cell size in pixels
 * @param {number} resolution - Resolution multiplier
 * @returns {Object} High-res coordinates {x, y}
 */
function pixelToHighRes(pixelX, pixelY, cellSize, resolution) {
    const pixelPerMovement = cellSize / resolution;
    return {
        x: Math.floor(pixelX / pixelPerMovement),
        y: Math.floor(pixelY / pixelPerMovement)
    };
}

// ===========================
// GENERAL UTILITIES
// ===========================

/**
 * Calculate Manhattan distance between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Manhattan distance
 */
function manhattanDistance(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

/**
 * Calculate Euclidean distance between two points
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {number} Euclidean distance
 */
function euclideanDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if two points are equal
 * @param {Object} point1 - First point {x, y}
 * @param {Object} point2 - Second point {x, y}
 * @returns {boolean} True if points are equal
 */
function pointsEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}

/**
 * Get adjacent cells (4-directional)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} Array of adjacent positions
 */
function getAdjacent4(x, y) {
    return [
        { x: x, y: y - 1 }, // Up
        { x: x + 1, y: y },  // Right
        { x: x, y: y + 1 },  // Down
        { x: x - 1, y: y }   // Left
    ];
}

/**
 * Get adjacent cells (8-directional)
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} Array of adjacent positions
 */
function getAdjacent8(x, y) {
    return [
        { x: x - 1, y: y - 1 }, { x: x, y: y - 1 }, { x: x + 1, y: y - 1 },
        { x: x - 1, y: y },                          { x: x + 1, y: y },
        { x: x - 1, y: y + 1 }, { x: x, y: y + 1 }, { x: x + 1, y: y + 1 }
    ];
}

/**
 * Clamp a value between min and max
 * @param {number} value - Value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Update status message in UI
 * @param {string} message - Status message
 * @param {string} type - Message type ('', 'success', 'error')
 */
function updateStatus(message, type = '') {
    const statusElement = document.getElementById('status');
    if (statusElement) {
        const textElement = statusElement.querySelector('.status-text') || statusElement;
        textElement.textContent = message;
        
        // Update class for styling
        statusElement.className = statusElement.className.replace(/\b(success|error)\b/g, '');
        if (type) {
            statusElement.classList.add(type);
        }
    }
}

/**
 * Debug logging utility
 * @param {string} context - Context/module name
 * @param {any} data - Data to log
 */
function debugLog(context, data) {
    if (window.DEBUG_MODE) {
        console.log(`[${context}]`, data);
    }
}

// Enable debug mode (set to false in production)
window.DEBUG_MODE = true;