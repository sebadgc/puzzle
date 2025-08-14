/**
 * UTILS.JS - Helper Functions and Constants
 * 
 * This file contains utility functions and constants used throughout the game.
 * Think of it as a toolbox with handy functions that multiple modules can use.
 */

// ===========================
// GAME CONSTANTS
// ===========================

const GAME_CONFIG = {
    GRID_SIZE: 5,           // 5x5 grid of intersections
    CELL_SIZE: 60,          // Pixels between grid points
    LINE_WIDTH: 4,          // Thickness of drawn lines
    
    // Visual settings
    COLORS: {
        GRID_LINE: '#e0e0e0',
        GRID_DOT: '#bbb',
        START_POINT: '#4ecdc4',
        END_POINT: '#ff6b6b',
        PATH: '#333',
        GLOW: '#4ecdc4'
    },
    
    // Animation settings
    GLOW_SPEED: 50,         // Milliseconds between glow animation frames
    MAX_GLOW: 20            // Maximum glow intensity
};

// ===========================
// COORDINATE UTILITIES
// ===========================

/**
 * Converts grid coordinates to pixel coordinates
 * @param {number} gridX - Grid X coordinate (0 to GRID_SIZE)
 * @param {number} gridY - Grid Y coordinate (0 to GRID_SIZE) 
 * @returns {Object} - {x, y} pixel coordinates
 */
function gridToPixel(gridX, gridY) {
    return {
        x: gridX * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2,
        y: gridY * GAME_CONFIG.CELL_SIZE + GAME_CONFIG.CELL_SIZE / 2
    };
}

/**
 * Converts pixel coordinates to grid coordinates
 * @param {number} pixelX - Pixel X coordinate
 * @param {number} pixelY - Pixel Y coordinate
 * @returns {Object|null} - {x, y} grid coordinates or null if out of bounds
 */
function pixelToGrid(pixelX, pixelY) {
    const gridX = Math.round((pixelX - GAME_CONFIG.CELL_SIZE / 2) / GAME_CONFIG.CELL_SIZE);
    const gridY = Math.round((pixelY - GAME_CONFIG.CELL_SIZE / 2) / GAME_CONFIG.CELL_SIZE);
    
    // Check if coordinates are within valid grid bounds
    if (gridX >= 0 && gridX <= GAME_CONFIG.GRID_SIZE && 
        gridY >= 0 && gridY <= GAME_CONFIG.GRID_SIZE) {
        return {x: gridX, y: gridY};
    }
    return null;
}

// ===========================
// GEOMETRY UTILITIES
// ===========================

/**
 * Checks if two grid points are adjacent (neighbors)
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {boolean} - True if points are adjacent
 */
function areAdjacent(point1, point2) {
    const dx = Math.abs(point1.x - point2.x);
    const dy = Math.abs(point1.y - point2.y);
    
    // Adjacent means exactly one coordinate differs by 1
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
}

/**
 * Checks if two points are the same
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {boolean} - True if points are identical
 */
function pointsEqual(point1, point2) {
    return point1.x === point2.x && point1.y === point2.y;
}

/**
 * Calculates distance between two points
 * @param {Object} point1 - {x, y} coordinates
 * @param {Object} point2 - {x, y} coordinates
 * @returns {number} - Distance between points
 */
function getDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// ===========================
// DOM UTILITIES
// ===========================

/**
 * Updates the status message display
 * @param {string} message - Message to display
 * @param {string} className - CSS class for styling ('success', 'error', or '')
 */
function updateStatus(message, className = '') {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = className;
}

/**
 * Gets mouse/touch position relative to canvas
 * @param {Event} event - Mouse or touch event
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {Object} - {x, y} coordinates relative to canvas
 */
function getEventPosition(event, canvas) {
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    const clientX = event.clientX || (event.touches && event.touches[0].clientX);
    const clientY = event.clientY || (event.touches && event.touches[0].clientY);
    
    return {
        x: clientX - rect.left,
        y: clientY - rect.top
    };
}

// ===========================
// ARRAY UTILITIES
// ===========================

/**
 * Creates a deep copy of an array of objects
 * @param {Array} array - Array to copy
 * @returns {Array} - Deep copy of the array
 */
function deepCopyArray(array) {
    return array.map(item => ({...item}));
}

/**
 * Removes the last element from an array and returns the new array
 * @param {Array} array - Array to modify
 * @returns {Array} - New array without last element
 */
function removeLast(array) {
    return array.slice(0, -1);
}

// ===========================
// DEBUGGING UTILITIES
// ===========================

/**
 * Logs game state information for debugging
 * @param {string} context - Context of the log (e.g., "Path Drawing")
 * @param {Object} data - Data to log
 */
function debugLog(context, data) {
    if (window.DEBUG_MODE) {
        console.log(`[${context}]`, data);
    }
}

// Enable debug mode by setting this in browser console: window.DEBUG_MODE = true;
window.DEBUG_MODE = false;