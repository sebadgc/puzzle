/**
 * MAIN.JS - Application Entry Point
 * 
 * This module:
 * - Initializes the game when the page loads
 * - Coordinates between all other modules
 * - Handles global application state
 * - Sets up the main game loop
 */

// ===========================
// GLOBAL VARIABLES
// ===========================

let gameInstance = null;
let isGameInitialized = false;

// ===========================
// INITIALIZATION
// ===========================

/**
 * Initializes the entire application
 */
function initializeApp() {
    debugLog('App Initialization Started', {});
    
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    // Check if game canvas exists
    const canvas = document.getElementById('puzzleCanvas');
    if (!canvas) {
        console.error('Canvas element not found! Make sure the HTML is loaded correctly.');
        return;
    }
    
    // Initialize the game only when explicitly started
    setupInitialUI();
    
    debugLog('App Initialization Complete', {
        canvasFound: !!canvas,
        gameInitialized: isGameInitialized
    });
}

/**
 * Sets up the initial UI state
 */
function setupInitialUI() {
    // Hide game section initially
    const gameSection = document.getElementById('gameSection');
    if (gameSection) {
        gameSection.style.display = 'none';
    }
    
    // Set up the start button functionality
    window.initializeGame = initializeGame;
    
    debugLog('Initial UI Setup Complete', {});
}

/**
 * Initializes the game (called when user clicks "Start Puzzle")
 */
function initializeGame() {
    if (isGameInitialized) {
        debugLog('Game Already Initialized', {});
        return gameInstance;
    }
    
    try {
        // Create the game instance
        gameInstance = createGame('puzzleCanvas');
        
        // Set up all the controls and features
        setupControlButtons(gameInstance);
        setupKeyboardControls(gameInstance);
        setupAutoSave(gameInstance);
        
        // Try to load saved game
        const loadSuccess = gameInstance.loadGame();
        if (!loadSuccess) {
            debugLog('No saved game found, starting fresh', {});
        }
        
        // Mark as initialized
        isGameInitialized = true;
        
        // Show welcome message
        updateStatus("🎮 Game ready! Draw a line from start to end!");
        
        debugLog('Game Initialization Complete', {
            loadedSave: loadSuccess,
            level: gameInstance.level,
            score: gameInstance.score
        });
        
        return gameInstance;
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        updateStatus("❌ Failed to initialize game. Please refresh the page.", "error");
        return null;
    }
}

/**
 * Gets the current game instance
 * @returns {Game|null} - Current game instance or null
 */
function getGameInstance() {
    return gameInstance;
}

/**
 * Restarts the game completely
 */
function restartGame() {
    if (gameInstance) {
        gameInstance.destroy();
    }
    
    isGameInitialized = false;
    gameInstance = null;
    
    // Re-initialize
    initializeGame();
    
    debugLog('Game Restarted', {});
}

// ===========================
// GLOBAL FUNCTIONS FOR UI
// ===========================

/**
 * Global function to clear the current path
 */
window.clearPath = function() {
    if (gameInstance) {
        gameInstance.clearPath();
    } else {
        debugLog('Cannot clear path - game not initialized', {});
    }
};

/**
 * Global function to generate a new puzzle
 */
window.generateNewPuzzle = function() {
    if (gameInstance) {
        gameInstance.generateNewPuzzle();
    } else {
        debugLog('Cannot generate puzzle - game not initialized', {});
    }
};

/**
 * Global function to show hint
 */
window.showHint = function() {
    if (gameInstance) {
        gameInstance.showHint();
    } else {
        debugLog('Cannot show hint - game not initialized', {});
    }
};

// ===========================
// ERROR HANDLING
// ===========================

/**
 * Global error handler
 */
window.addEventListener('error', function(event) {
    console.error('Global error caught:', event.error);
    
    // Try to gracefully handle the error
    if (gameInstance) {
        updateStatus("⚠️ An error occurred. The game is still playable.", "error");
    }
    
    debugLog('Global Error', {
        message: event.error.message,
        filename: event.filename,
        lineno: event.lineno
    });
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    
    debugLog('Unhandled Promise Rejection', {
        reason: event.reason
    });
});

// ===========================
// PERFORMANCE MONITORING
// ===========================

/**
 * Monitor game performance
 */
function setupPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        // Check every 60 frames (roughly 1 second at 60fps)
        if (frameCount >= 60) {
            const deltaTime = currentTime - lastTime;
            const fps = (frameCount / deltaTime) * 1000;
            
            if (fps < 30) {
                debugLog('Performance Warning', {
                    fps: fps.toFixed(2),
                    message: 'Low frame rate detected'
                });
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    // Only monitor performance in debug mode
    if (window.DEBUG_MODE) {
        requestAnimationFrame(checkPerformance);
    }
}

// ===========================
// BROWSER COMPATIBILITY
// ===========================

/**
 * Checks browser compatibility and shows warnings if needed
 */
function checkBrowserCompatibility() {
    const issues = [];
    
    // Check for Canvas support
    if (!document.createElement('canvas').getContext) {
        issues.push('Canvas not supported');
    }
    
    // Check for localStorage support
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
    } catch (e) {
        issues.push('localStorage not available');
    }
    
    // Check for modern JavaScript features
    if (!Array.prototype.find) {
        issues.push('Modern JavaScript not supported');
    }
    
    if (issues.length > 0) {
        console.warn('Browser compatibility issues:', issues);
        updateStatus('⚠️ Your browser may not support all features.', 'error');
    }
    
    debugLog('Browser Compatibility Check', {
        issues: issues,
        userAgent: navigator.userAgent
    });
}

// ===========================
// RESPONSIVE HANDLING
// ===========================

/**
 * Handles window resize events
 */
function setupResponsiveHandling() {
    let resizeTimeout;
    
    window.addEventListener('resize', function() {
        // Debounce resize events
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(function() {
            if (gameInstance && gameInstance.renderer) {
                // Re-setup high DPI canvas on resize
                gameInstance.renderer.setupHighDPICanvas();
                gameInstance.render();
            }
            
            debugLog('Window Resized', {
                width: window.innerWidth,
                height: window.innerHeight
            });
        }, 250);
    });
}

// ===========================
// DEVELOPMENT HELPERS
// ===========================

/**
 * Development helper functions (only available in debug mode)
 */
function setupDevelopmentHelpers() {
    if (!window.DEBUG_MODE) return;
    
    // Global debug functions
    window.debugGame = function() {
        if (gameInstance) {
            console.log('Game Stats:', gameInstance.getStats());
            console.log('Current Puzzle:', gameInstance.currentPuzzle);
            console.log('Current Path:', gameInstance.currentPath);
        }
    };
    
    window.skipLevel = function() {
        if (gameInstance) {
            gameInstance.nextLevel();
        }
    };
    
    window.addScore = function(points = 100) {
        if (gameInstance) {
            gameInstance.score += points;
            gameInstance.updateUI();
        }
    };
    
    debugLog('Development Helpers Setup', {});
}

// ===========================
// AUTO-START
// ===========================

// Initialize the application when this script loads
initializeApp();
checkBrowserCompatibility();
setupPerformanceMonitoring();
setupResponsiveHandling();
setupDevelopmentHelpers();

// Enable debug mode for development
// Remove this line for production
window.DEBUG_MODE = true;

debugLog('Main.js Loaded', {
    debugMode: window.DEBUG_MODE,
    timestamp: new Date().toISOString()
});