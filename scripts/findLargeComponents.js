#!/usr/bin/env node

/**
 * Script to find large React components that could benefit from optimizations
 * such as code splitting, memoization, or refactoring into smaller pieces.
 * 
 * Usage:
 *   node scripts/findLargeComponents.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    // Directory to scan for components
    srcDir: path.join(__dirname, '..', 'src'),

    // Size thresholds (in bytes)
    sizeThresholds: {
        large: 8 * 1024,     // 8KB
        veryLarge: 16 * 1024, // 16KB
        huge: 32 * 1024      // 32KB
    },

    // File patterns to include
    includePatterns: [
        /\.(tsx|jsx)$/
    ],

    // Directories to exclude
    excludeDirs: [
        'node_modules',
        'dist',
        'build',
        'tests',
        '__tests__'
    ]
};

// ANSI colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m'
};

// Results storage
const results = {
    components: [],
    totalSize: 0,
    largeCount: 0,
    veryLargeCount: 0,
    hugeCount: 0
};

/**
 * Scans a directory recursively for React components
 */
function scanDirectory(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });

    entries.forEach(entry => {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            if (!CONFIG.excludeDirs.includes(entry.name)) {
                scanDirectory(fullPath);
            }
            return;
        }

        if (!CONFIG.includePatterns.some(pattern => pattern.test(entry.name))) {
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf8');
        const size = fs.statSync(fullPath).size;

        // Count React components in the file
        const componentMatches = content.match(/function\s+([A-Z][A-Za-z0-9_]*)\s*\(/g) || [];
        const exportedComponentMatches = content.match(/export\s+(const|function)\s+([A-Z][A-Za-z0-9_]*)/g) || [];

        const componentCount = componentMatches.length + exportedComponentMatches.length;

        results.components.push({
            path: fullPath.replace(CONFIG.srcDir + '/', ''),
            size,
            sizeFormatted: formatSize(size),
            componentCount
        });

        results.totalSize += size;

        if (size >= CONFIG.sizeThresholds.huge) {
            results.hugeCount++;
        } else if (size >= CONFIG.sizeThresholds.veryLarge) {
            results.veryLargeCount++;
        } else if (size >= CONFIG.sizeThresholds.large) {
            results.largeCount++;
        }
    });
}

/**
 * Formats a file size in bytes to a human-readable string
 */
function formatSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' bytes';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

/**
 * Gets the appropriate color for a component size
 */
function getSizeColor(size) {
    if (size >= CONFIG.sizeThresholds.huge) {
        return colors.red;
    } else if (size >= CONFIG.sizeThresholds.veryLarge) {
        return colors.yellow;
    } else if (size >= CONFIG.sizeThresholds.large) {
        return colors.cyan;
    }
    return colors.green;
}

/**
 * Prints analysis results to the console
 */
function printResults() {
    console.log(`\n${colors.bright}=== React Component Size Analysis ===\n${colors.reset}`);

    // Sort by size, largest first
    results.components
        .sort((a, b) => b.size - a.size)
        .slice(0, 20) // Show top 20 largest
        .forEach(component => {
            const sizeColor = getSizeColor(component.size);
            console.log(`${sizeColor}${component.sizeFormatted.padEnd(10)}${colors.reset} ${component.path} ${colors.dim}(~${component.componentCount} component${component.componentCount !== 1 ? 's' : ''})${colors.reset}`);
        });

    console.log('\n' + colors.bright + 'Summary:' + colors.reset);
    console.log(`  ${colors.green}Total components analyzed:${colors.reset} ${results.components.length}`);
    console.log(`  ${colors.cyan}Large (>8KB):${colors.reset} ${results.largeCount}`);
    console.log(`  ${colors.yellow}Very large (>16KB):${colors.reset} ${results.veryLargeCount}`);
    console.log(`  ${colors.red}Huge (>32KB):${colors.reset} ${results.hugeCount}`);
    console.log(`  ${colors.bright}Total size:${colors.reset} ${formatSize(results.totalSize)}`);

    console.log('\n' + colors.bright + 'Recommendations:' + colors.reset);
    console.log('  1. Break down large components into smaller pieces');
    console.log('  2. Use React.lazy() for components not needed on initial render');
    console.log('  3. Move static data out of component definitions');
    console.log('  4. Consider using useMemo/useCallback for expensive calculations');
}

// Main execution
try {
    console.log(`Scanning ${CONFIG.srcDir} for React components...`);
    scanDirectory(CONFIG.srcDir);
    printResults();
} catch (error) {
    console.error('Error analyzing components:', error);
    process.exit(1);
} 