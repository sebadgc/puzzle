# 🧩 Nexus Puzzles - Line Drawing Game

A modern, browser-based puzzle game inspired by Jonathan Blow's "The Witness". Draw lines from start to end while following increasingly complex rules and constraints.

![Game Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Nexus+Puzzles+Game+Preview)

## ✨ Features

- **🎨 Beautiful Modern UI** - Glassmorphism design with smooth animations
- **📱 Cross-Platform** - Works on desktop, tablet, and mobile
- **🧩 Progressive Difficulty** - Start simple, advance through complex mechanics
- **🎮 Intuitive Controls** - Mouse and touch support with responsive feedback
- **💾 Auto-Save** - Your progress is automatically saved
- **⌨️ Keyboard Shortcuts** - Quick controls for efficient gameplay
- **🎯 Achievement System** - Track your progress and mastery

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software required!

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/line-drawing-puzzle-game.git
   cd line-drawing-puzzle-game
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Start playing!**
   - Click "Start Puzzle" to begin
   - Draw lines from the green circle to the red square
   - Complete puzzles to advance levels

## 🎮 How to Play

### Basic Controls

- **Mouse**: Click and drag to draw lines
- **Touch**: Tap and drag on mobile devices
- **Keyboard Shortcuts**:
  - `C` - Clear current path
  - `N` - Generate new puzzle
  - `H` - Show hint
  - `P` - Pause/Resume
  - `Ctrl+R` - Reset game

### Game Rules

1. **Start at the Circle** - All paths must begin at the green starting point
2. **End at the Square** - Successfully reach the red endpoint to solve
3. **Stay Connected** - Only move to adjacent grid points
4. **Follow the Rules** - Each puzzle type has specific constraints to follow

### Puzzle Types

- **Basic** - Simple start-to-end connection
- **Colored Squares** *(Coming Soon)* - Separate different colored regions
- **Stars** *(Coming Soon)* - Collect all stars in your path
- **Tetris Blocks** *(Coming Soon)* - Outline specific shapes
- **Symmetry** *(Coming Soon)* - Create symmetric patterns

## 🏗️ Project Structure

```
line-drawing-puzzle-game/
├── index.html              # Main HTML page
├── README.md               # This file
├── .gitignore             # Git ignore rules
├── css/
│   └── styles.css         # All game styling
├── js/
│   ├── main.js           # Application entry point
│   ├── game.js           # Core game logic
│   ├── renderer.js       # Canvas drawing functions
│   ├── input.js          # Mouse/touch input handling
│   ├── puzzle.js         # Puzzle generation and validation
│   └── utils.js          # Helper functions and constants
├── assets/
│   ├── images/           # Game images (future)
│   └── sounds/           # Sound effects (future)
└── docs/
    └── development.md    # Development documentation
```

## 🛠️ Development

### Code Architecture

The game is built with vanilla JavaScript using a modular architecture:

- **utils.js** - Constants, helper functions, and utilities
- **puzzle.js** - Puzzle generation, validation, and rule management
- **renderer.js** - Canvas drawing and visual effects
- **input.js** - Input handling for mouse and touch events
- **game.js** - Main game logic, state management, and coordination
- **main.js** - Application initialization and global coordination

### Key Classes

- `Game` - Main game controller and state manager
- `Puzzle` - Individual puzzle configuration and validation
- `GameRenderer` - Handles all canvas drawing operations
- `InputHandler` - Manages user input and coordinate conversion

### Adding New Features

1. **New Puzzle Types**: Extend the `Puzzle` class in `puzzle.js`
2. **Visual Effects**: Add rendering methods to `GameRenderer` in `renderer.js`
3. **UI Elements**: Modify `index.html` and `styles.css`
4. **Game Mechanics**: Extend the `Game` class in `game.js`

### Development Mode

Enable debug mode by setting `window.DEBUG_MODE = true` in the browser console:

```javascript
// Enable debug logging and helper functions
window.DEBUG_MODE = true;

// Available debug functions:
debugGame();     // Show current game state
skipLevel();     // Skip to next level
addScore(100);   // Add points to score
```

## 🎨 Customization

### Themes

The game uses CSS custom properties for easy theming:

```css
:root {
    --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --accent-gradient: linear-gradient(45deg, #00f5ff, #8a2be2);
    --text-primary: #ffffff;
}
```

### Game Configuration

Modify game settings in `utils.js`:

```javascript
const GAME_CONFIG = {
    GRID_SIZE: 5,           // Grid dimensions
    CELL_SIZE: 60,          // Pixel size of grid cells
    LINE_WIDTH: 4,          // Path line thickness
    // ... more settings
};
```

## 🚀 Deployment

### GitHub Pages

1. Push your code to GitHub
2. Go to Settings > Pages
3. Select source branch (usually `main`)
4. Your game will be available at `https://yourusername.github.io/line-drawing-puzzle-game`

### Other Platforms

- **Netlify**: Drag and drop the entire folder
- **Vercel**: Connect your GitHub repository
- **Local Server**: Use any HTTP server to serve the files

## 🤝 Contributing

Contributions are welcome! Here's how to help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/new-puzzle-type`)
3. **Commit your changes** (`git commit -am 'Add new puzzle type'`)
4. **Push to the branch** (`git push origin feature/new-puzzle-type`)
5. **Create a Pull Request**

### Development Guidelines

- Follow existing code style and patterns
- Add comments for complex logic
- Test on multiple browsers and devices
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Jonathan Blow** - Creator of "The Witness" for the original inspiration
- **Modern Web APIs** - Canvas, localStorage, and responsive design features
- **Open Source Community** - For tools and inspiration

## 📞 Support

- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/line-drawing-puzzle-game/issues)
- **Discussions**: Join conversations in [GitHub Discussions](https://github.com/yourusername/line-drawing-puzzle-game/discussions)
- **Email**: your.email@example.com

---

**Made with ❤️ and modern web technologies**

*Start your puzzle journey today!* 🧩✨