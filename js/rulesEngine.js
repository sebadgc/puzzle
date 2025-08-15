/**
 * RULESENGINE.JS - Rules and Validation System
 * 
 * This module handles:
 * - Rule definitions
 * - Path validation
 * - Win condition checking
 * - Future puzzle elements validation
 */

// ===========================
// RULE DEFINITIONS
// ===========================

/**
 * Base Rule class
 */
class Rule {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.enabled = true;
    }
    
    /**
     * Check if rule is satisfied
     * @param {Object} context - Validation context
     * @returns {Object} Result {passed: boolean, message: string}
     */
    validate(context) {
        throw new Error('validate() must be implemented by subclass');
    }
}

/**
 * Start-End Connection Rule
 */
class StartEndRule extends Rule {
    constructor() {
        super('StartEnd', 'Path must connect start to end');
    }
    
    validate(context) {
        const { path, startPos, endPos } = context;
        
        if (!path || path.length === 0) {
            return {
                passed: false,
                message: 'No path drawn'
            };
        }
        
        // Check if path starts at start position
        const firstCell = path[0];
        if (!this.isAtPosition(firstCell, startPos, context.resolution)) {
            return {
                passed: false,
                message: 'Path must start at the green circle'
            };
        }
        
        // Check if path ends at end position
        const lastCell = path[path.length - 1];
        if (!this.isAtPosition(lastCell, endPos, context.resolution)) {
            return {
                passed: false,
                message: 'Path must end at the red square'
            };
        }
        
        return {
            passed: true,
            message: 'Connected start to end'
        };
    }
    
    isAtPosition(highResPos, gridPos, resolution) {
        const gridX = Math.floor(highResPos.x / resolution);
        const gridY = Math.floor(highResPos.y / resolution);
        return gridX === gridPos.x && gridY === gridPos.y;
    }
}

/**
 * Path Continuity Rule
 */
class PathContinuityRule extends Rule {
    constructor() {
        super('Continuity', 'Path must be continuous');
    }
    
    validate(context) {
        const { path } = context;
        
        if (!path || path.length < 2) {
            return {
                passed: true,
                message: 'Path is continuous'
            };
        }
        
        // Check if each point is adjacent to the previous one
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const distance = Math.abs(curr.x - prev.x) + Math.abs(curr.y - prev.y);
            
            // Allow diagonal movement (distance 2) or orthogonal (distance 1)
            if (distance > 2) {
                return {
                    passed: false,
                    message: 'Path has gaps'
                };
            }
        }
        
        return {
            passed: true,
            message: 'Path is continuous'
        };
    }
}

/**
 * No Wall Collision Rule
 */
class NoWallCollisionRule extends Rule {
    constructor() {
        super('NoWalls', 'Path must not cross walls');
    }
    
    validate(context) {
        const { path, maze, resolution } = context;
        
        for (const point of path) {
            const gridX = Math.floor(point.x / resolution);
            const gridY = Math.floor(point.y / resolution);
            
            // Check bounds
            if (gridX < 0 || gridX >= maze[0].length || 
                gridY < 0 || gridY >= maze.length) {
                return {
                    passed: false,
                    message: 'Path goes out of bounds'
                };
            }
            
            // Check if position is a wall
            if (maze[gridY][gridX] === CELL_TYPES.WALL) {
                return {
                    passed: false,
                    message: 'Path crosses a wall'
                };
            }
        }
        
        return {
            passed: true,
            message: 'Path avoids walls'
        };
    }
}

// ===========================
// RULES ENGINE
// ===========================

class RulesEngine {
    constructor() {
        this.rules = [];
        this.initializeDefaultRules();
    }
    
    /**
     * Initialize default rules
     */
    initializeDefaultRules() {
        this.rules = [
            new StartEndRule(),
            new PathContinuityRule(),
            new NoWallCollisionRule(),
            new RequiredPointsRule()
        ];
    }
    
    /**
     * Add a custom rule
     * @param {Rule} rule - Rule to add
     */
    addRule(rule) {
        if (rule instanceof Rule) {
            this.rules.push(rule);
        } else {
            console.error('Invalid rule: must be instance of Rule class');
        }
    }
    
    /**
     * Remove a rule by name
     * @param {string} ruleName - Name of rule to remove
     */
    removeRule(ruleName) {
        this.rules = this.rules.filter(rule => rule.name !== ruleName);
    }
    
    /**
     * Enable/disable a rule
     * @param {string} ruleName - Name of rule
     * @param {boolean} enabled - Enable state
     */
    setRuleEnabled(ruleName, enabled) {
        const rule = this.rules.find(r => r.name === ruleName);
        if (rule) {
            rule.enabled = enabled;
        }
    }
    
    /**
     * Validate path against all rules
     * @param {Object} context - Validation context
     * @returns {Object} Validation result
     */
    validate(context) {
        const results = [];
        let allPassed = true;
        
        for (const rule of this.rules) {
            if (!rule.enabled) continue;
            
            const result = rule.validate(context);
            results.push({
                rule: rule.name,
                ...result
            });
            
            if (!result.passed) {
                allPassed = false;
            }
        }
        
        return {
            passed: allPassed,
            results: results,
            message: allPassed ? 
                '✅ All rules passed!' : 
                '❌ ' + results.find(r => !r.passed)?.message
        };
    }
    
    /**
     * Get summary of active rules
     * @returns {Array} Array of rule descriptions
     */
    getActiveRules() {
        return this.rules
            .filter(rule => rule.enabled)
            .map(rule => ({
                name: rule.name,
                description: rule.description
            }));
    }
}

// ===========================
// FUTURE RULE TEMPLATES
// ===========================

/**
 * Template for future colored square rule
 */
class ColoredSquareRule extends Rule {
    constructor() {
        super('ColoredSquares', 'Path must separate colored squares');
        this.enabled = false; // Disabled by default
    }
    
    validate(context) {
        // TODO: Implement when colored squares are added
        return {
            passed: true,
            message: 'Colored squares rule not yet implemented'
        };
    }
}

/**
 * Template for future star collection rule
 */
class StarCollectionRule extends Rule {
    constructor() {
        super('Stars', 'Path must collect all stars');
        this.enabled = false; // Disabled by default
    }
    
    validate(context) {
        // TODO: Implement when stars are added
        return {
            passed: true,
            message: 'Star collection rule not yet implemented'
        };
    }
}

/**
 * Template for future symmetry rule
 */
class SymmetryRule extends Rule {
    constructor() {
        super('Symmetry', 'Path must be symmetric');
        this.enabled = false; // Disabled by default
    }
    
    validate(context) {
        // TODO: Implement when symmetry puzzles are added
        return {
            passed: true,
            message: 'Symmetry rule not yet implemented'
        };
    }
}

/**
 * Required Points Rule - Path must pass through all required points
 */
class RequiredPointsRule extends Rule {
    constructor() {
        super('RequiredPoints', 'Path must pass through all marked points');
    }
    
    validate(context) {
        const { path, requiredPoints, resolution } = context;
        
        if (!requiredPoints || requiredPoints.length === 0) {
            return {
                passed: true,
                message: 'No required points to check'
            };
        }
        
        // Check if path passes through all required points
        const unvisitedPoints = [...requiredPoints];
        
        for (const pathPoint of path) {
            const gridX = Math.floor(pathPoint.x / resolution);
            const gridY = Math.floor(pathPoint.y / resolution);
            
            // Check if this path point covers any required point
            unvisitedPoints.forEach((reqPoint, index) => {
                if (reqPoint.x === gridX && reqPoint.y === gridY) {
                    unvisitedPoints.splice(index, 1);
                }
            });
        }
        
        if (unvisitedPoints.length > 0) {
            return {
                passed: false,
                message: `Must pass through ${unvisitedPoints.length} more required point(s)`
            };
        }
        
        return {
            passed: true,
            message: 'All required points visited'
        };
    }
}

// Export for use in other modules
window.Rule = Rule;
window.RulesEngine = RulesEngine;
window.StartEndRule = StartEndRule;
window.PathContinuityRule = PathContinuityRule;
window.NoWallCollisionRule = NoWallCollisionRule;