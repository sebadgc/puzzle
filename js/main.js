/**
 * MAIN.JS - Application Entry Point
 * 
 * This module:
 * - Initializes the application
 * - Manages page transitions
 * - Handles global event listeners
 */

// Global game instance
let gameInstance = null;

/**
 * Initialize the application when DOM is ready
 */
function initializeApp() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
        return;
    }
    
    setupPageTransitions();
    setupGlobalListeners();
    
    console.log('🎮 Linel - Application initialized');
}

/**
 * Setup page transitions and navigation
 */
function setupPageTransitions() {
    // Make sure hero section is visible initially
    const heroSection = document.querySelector('.hero');
    const gameSection = document.getElementById('gameSection');
    const featuresSection = document.getElementById('featuresSection');
    const instructionsSection = document.querySelector('.instructions');
    
    if (heroSection) heroSection.style.display = 'flex';
    if (gameSection) gameSection.style.display = 'none';
    if (featuresSection) featuresSection.style.display = 'block';
    if (instructionsSection) instructionsSection.style.display = 'block';
}

/**
 * Setup global event listeners
 */
function setupGlobalListeners() {
    // Make functions globally accessible
    window.startGame = startGame;
    window.showMenu = showMenu;
    window.showAbout = showAbout;
    window.showContact = showContact;
    
    // Setup smooth scrolling
    document.documentElement.style.scrollBehavior = 'smooth';
}

/**
 * Start the game
 */
function startGame() {
    console.log('🚀 Starting game...');
    
    // Hide hero and show game section
    const heroSection = document.querySelector('.hero');
    const gameSection = document.getElementById('gameSection');
    const featuresSection = document.getElementById('featuresSection');
    const instructionsSection = document.querySelector('.instructions');
    
    if (heroSection) heroSection.style.display = 'none';
    if (gameSection) gameSection.style.display = 'block';
    if (featuresSection) featuresSection.style.display = 'none';
    if (instructionsSection) instructionsSection.style.display = 'none';
    
    // Initialize game if not already done
    if (!gameInstance) {
        initializeGame();
    }
    
    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * Initialize the game
 */
function initializeGame() {
    try {
        // Create game instance
        gameInstance = new Game('puzzleCanvas');
        
        // Setup control buttons
        setupControlButtons();
        
        // Setup settings controls
        setupSettingsControls();
        
        // Setup keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Make game instance globally accessible for debugging
        window.game = gameInstance;
        
        console.log('✅ Game initialized successfully');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        updateStatus('Failed to initialize game. Please refresh the page.', 'error');
    }
}

/**
 * Setup game control buttons
 */
function setupControlButtons() {
    const clearBtn = document.getElementById('clearBtn');
    const newPuzzleBtn = document.getElementById('newPuzzleBtn');
    const hintBtn = document.getElementById('hintBtn');
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (gameInstance) gameInstance.clearPath();
        });
    }
    
    if (newPuzzleBtn) {
        newPuzzleBtn.addEventListener('click', () => {
            if (gameInstance) gameInstance.generateNewMaze();
        });
    }
    
    if (hintBtn) {
        hintBtn.addEventListener('click', () => {
            if (gameInstance) gameInstance.showSolution();
        });
    }
}

/**
 * Setup settings controls
 */
function setupSettingsControls() {
    const mazeSizeSelect = document.getElementById('mazeSizeSelect');
    
    if (mazeSizeSelect) {
        // Also check for cell size and resolution selects if they exist
        const cellSizeSelect = document.getElementById('cellSizeSelect');
        const resolutionSelect = document.getElementById('resolutionSelect');
        
        const updateSettings = () => {
            if (!gameInstance) return;
            
            const mazeSize = parseInt(mazeSizeSelect.value) || GAME_CONFIG.DEFAULT_MAZE_SIZE;
            const cellSize = cellSizeSelect ? 
                parseInt(cellSizeSelect.value) : GAME_CONFIG.DEFAULT_CELL_SIZE;
            const resolution = resolutionSelect ? 
                parseInt(resolutionSelect.value) : GAME_CONFIG.DEFAULT_RESOLUTION;
            
            gameInstance.updateSettings(mazeSize, cellSize, resolution);
        };
        
        mazeSizeSelect.addEventListener('change', updateSettings);
        if (cellSizeSelect) cellSizeSelect.addEventListener('change', updateSettings);
        if (resolutionSelect) resolutionSelect.addEventListener('change', updateSettings);
    }
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
        if (!gameInstance) return;
        
        // Ignore if typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch(event.key.toLowerCase()) {
            case 'c':
                gameInstance.clearPath();
                break;
            case 'n':
                gameInstance.generateNewMaze();
                break;
            case 'h':
                gameInstance.showSolution();
                break;
            case 'escape':
                showMenu();
                break;
        }
    });
}

/**
 * Show main menu
 */
function showMenu() {
    console.log('📋 Showing menu...');
    
    const heroSection = document.querySelector('.hero');
    const gameSection = document.getElementById('gameSection');
    const featuresSection = document.getElementById('featuresSection');
    const instructionsSection = document.querySelector('.instructions');
    
    if (heroSection) heroSection.style.display = 'flex';
    if (gameSection) gameSection.style.display = 'none';
    if (featuresSection) featuresSection.style.display = 'block';
    if (instructionsSection) instructionsSection.style.display = 'block';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

/**
 * Show about dialog
 */
function showAbout() {
    alert('Linel - A modern puzzle game inspired by The Witness.\n\nDraw lines from start to end while following puzzle rules.\n\nCreated with pure JavaScript and Canvas API.');
}

/**
 * Show contact dialog
 */
function showContact() {
    alert('Contact: your.email@example.com\n\nFor bug reports and suggestions, please visit our GitHub repository.');
}

/**
 * Initialize floating animations for background
 */
function initFloatingAnimations() {
    const floatingElements = document.querySelectorAll('.floating-circle, .floating-square, .floating-triangle');
    
    floatingElements.forEach((element, index) => {
        // Add random delay to each element
        element.style.animationDelay = `${index * 2}s`;
        
        // Add random duration for variety
        const duration = 6 + Math.random() * 4;
        element.style.animationDuration = `${duration}s`;
    });
}

/**
 * Performance monitoring (development only)
 */
function setupPerformanceMonitoring() {
    if (!window.DEBUG_MODE) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkPerformance() {
        frameCount++;
        const currentTime = performance.now();
        
        if (frameCount >= 60) {
            const deltaTime = currentTime - lastTime;
            const fps = (frameCount / deltaTime) * 1000;
            
            if (fps < 30) {
                console.warn(`⚠️ Low FPS: ${fps.toFixed(2)}`);
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkPerformance);
    }
    
    requestAnimationFrame(checkPerformance);
}

/**
 * Auto-save functionality
 */
function setupAutoSave() {
    if (!gameInstance) return;
    
    // Save game state every 30 seconds
    setInterval(() => {
        if (gameInstance) {
            try {
                const gameState = {
                    level: gameInstance.level,
                    score: gameInstance.score,
                    timestamp: Date.now()
                };
                localStorage.setItem('linelGameState', JSON.stringify(gameState));
                debugLog('Main', 'Game auto-saved');
            } catch (error) {
                console.error('Failed to save game:', error);
            }
        }
    }, 30000);
}

/**
 * Load saved game state
 */
function loadGameState() {
    try {
        const savedState = localStorage.getItem('linelGameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            debugLog('Main', `Loaded saved game state: Level ${state.level}, Score ${state.score}`);
            return state;
        }
    } catch (error) {
        console.error('Failed to load saved game:', error);
    }
    return null;
}

// ===========================
// INITIALIZE ON LOAD
// ===========================

// Start the application
initializeApp();

// Initialize floating animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initFloatingAnimations();
    setupPerformanceMonitoring();
});

// Log that main.js has loaded
console.log('📦 Main.js loaded - Linel Puzzle Game');
console.log('🎮 Use window.game to access game instance in console');
console.log('🐛 Set window.DEBUG_MODE = true for debug logs');