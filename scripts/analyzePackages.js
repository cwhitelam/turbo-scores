#!/usr/bin/env node

/**
 * Package Bundle Size Analyzer
 * 
 * This script analyzes node_modules dependencies to find large packages 
 * that might be increasing bundle size, and provides recommendations
 * for alternatives or optimization strategies.
 * 
 * Usage:
 *   node scripts/analyzePackages.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const nodeModulesDir = path.join(rootDir, 'node_modules');
const packageJsonPath = path.join(rootDir, 'package.json');

// ANSI colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
    blue: '\x1b[34m',
};

// Size thresholds in bytes
const SIZE_THRESHOLDS = {
    LARGE: 500 * 1024, // 500KB
    MEDIUM: 100 * 1024, // 100KB
    SMALL: 20 * 1024,   // 20KB
};

// Package alternatives and optimization suggestions
const PACKAGE_ALTERNATIVES = {
    'lodash': {
        alternatives: ['lodash-es', 'just use native JS methods', 'individual lodash functions'],
        optimization: 'Import specific functions: import { debounce } from "lodash/debounce"'
    },
    'moment': {
        alternatives: ['date-fns', 'dayjs', 'luxon'],
        optimization: 'Consider lighter alternatives that are more tree-shakable'
    },
    '@material-ui/core': {
        alternatives: ['@mui/material with tree-shaking', 'smaller UI libraries'],
        optimization: 'Use tree-shakable imports or consider a lighter library'
    },
    'jquery': {
        alternatives: ['native DOM methods', 'smaller DOM utilities'],
        optimization: 'Modern apps rarely need jQuery, consider native JS alternatives'
    },
    'axios': {
        alternatives: ['ky', 'redaxios', 'fetch API'],
        optimization: 'For simple requests, native fetch API may be sufficient'
    },
    'chart.js': {
        alternatives: ['lightweight-charts', 'uplot', 'specific chart libraries'],
        optimization: 'Only import specific chart types you need'
    },
    'react-icons': {
        alternatives: ['specific icon sets directly', 'inline SVGs'],
        optimization: 'Import only from specific icon sets, not the root package'
    }
};

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else if (bytes < 1024 * 1024 * 1024) {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    } else {
        return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    }
}

/**
 * Get the size of a directory recursively
 */
function getDirSize(dirPath) {
    let size = 0;

    try {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files) {
            const filePath = path.join(dirPath, file.name);

            if (file.isDirectory()) {
                size += getDirSize(filePath);
            } else {
                try {
                    const stats = fs.statSync(filePath);
                    size += stats.size;
                } catch (e) {
                    // Ignore errors for individual files
                }
            }
        }
    } catch (e) {
        console.error(`Could not analyze ${dirPath}: ${e.message}`);
    }

    return size;
}

/**
 * Get the color for a size based on thresholds
 */
function getSizeColor(size) {
    if (size >= SIZE_THRESHOLDS.LARGE) {
        return colors.red;
    } else if (size >= SIZE_THRESHOLDS.MEDIUM) {
        return colors.yellow;
    } else if (size >= SIZE_THRESHOLDS.SMALL) {
        return colors.green;
    }
    return colors.dim;
}

/**
 * Get recommendations for a package
 */
function getRecommendations(packageName) {
    // Check for exact matches
    if (PACKAGE_ALTERNATIVES[packageName]) {
        return PACKAGE_ALTERNATIVES[packageName];
    }

    // Check for partial matches
    for (const [key, value] of Object.entries(PACKAGE_ALTERNATIVES)) {
        if (packageName.includes(key)) {
            return value;
        }
    }

    // Default recommendations
    return {
        alternatives: ['Check for lighter alternatives'],
        optimization: 'Consider dynamic imports or code splitting for this dependency'
    };
}

/**
 * Analyze installed dependencies
 */
async function analyzePackages() {
    console.log(`\n${colors.bright}=== Package Size Analysis ===\n${colors.reset}`);

    try {
        // Read package.json to get direct dependencies
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = {
            ...packageJson.dependencies || {},
            ...packageJson.devDependencies || {}
        };

        // Check if node_modules exists
        if (!fs.existsSync(nodeModulesDir)) {
            console.log(`${colors.yellow}Node modules directory not found. Run npm install first.${colors.reset}`);
            return;
        }

        // Get top-level packages
        const packages = fs.readdirSync(nodeModulesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.') && !dirent.name.startsWith('@'))
            .map(dirent => ({
                name: dirent.name,
                path: path.join(nodeModulesDir, dirent.name),
                isDirectDependency: Object.keys(dependencies).includes(dirent.name)
            }));

        // Get scoped packages (@org/package)
        const scopedDirs = fs.readdirSync(nodeModulesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('@'));

        for (const scopedDir of scopedDirs) {
            const scopePath = path.join(nodeModulesDir, scopedDir.name);
            const scopedPackages = fs.readdirSync(scopePath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory())
                .map(dirent => ({
                    name: `${scopedDir.name}/${dirent.name}`,
                    path: path.join(scopePath, dirent.name),
                    isDirectDependency: Object.keys(dependencies).includes(`${scopedDir.name}/${dirent.name}`)
                }));

            packages.push(...scopedPackages);
        }

        // Calculate sizes and sort by size
        const packageSizes = await Promise.all(
            packages.map(async pkg => ({
                ...pkg,
                size: getDirSize(pkg.path)
            }))
        );

        packageSizes.sort((a, b) => b.size - a.size);

        // Group packages by size category
        const largePackages = packageSizes.filter(pkg => pkg.size >= SIZE_THRESHOLDS.LARGE);
        const mediumPackages = packageSizes.filter(pkg => pkg.size >= SIZE_THRESHOLDS.MEDIUM && pkg.size < SIZE_THRESHOLDS.LARGE);

        // Display large packages
        console.log(`${colors.bright}Large Packages (>500KB):${colors.reset}\n`);

        if (largePackages.length === 0) {
            console.log(`  ${colors.green}No large packages found!${colors.reset}`);
        } else {
            largePackages.forEach(pkg => {
                const sizeColor = getSizeColor(pkg.size);
                const sizeFormatted = formatSize(pkg.size);
                const dependencyType = pkg.isDirectDependency ? `${colors.cyan}(direct)${colors.reset}` : `${colors.dim}(transitive)${colors.reset}`;

                console.log(`  ${sizeColor}${sizeFormatted.padEnd(10)}${colors.reset} ${pkg.name} ${dependencyType}`);

                // Show recommendations
                const { alternatives, optimization } = getRecommendations(pkg.name);
                console.log(`    ${colors.dim}Alternatives: ${alternatives.join(', ')}${colors.reset}`);
                console.log(`    ${colors.dim}Optimization: ${optimization}${colors.reset}`);
                console.log();
            });
        }

        // Display medium packages
        console.log(`\n${colors.bright}Medium Packages (100KB-500KB):${colors.reset}\n`);

        if (mediumPackages.length === 0) {
            console.log(`  ${colors.green}No medium packages found!${colors.reset}`);
        } else {
            mediumPackages.slice(0, 10).forEach(pkg => {
                const sizeColor = getSizeColor(pkg.size);
                const sizeFormatted = formatSize(pkg.size);
                const dependencyType = pkg.isDirectDependency ? `${colors.cyan}(direct)${colors.reset}` : `${colors.dim}(transitive)${colors.reset}`;

                console.log(`  ${sizeColor}${sizeFormatted.padEnd(10)}${colors.reset} ${pkg.name} ${dependencyType}`);
            });

            if (mediumPackages.length > 10) {
                console.log(`  ${colors.dim}...and ${mediumPackages.length - 10} more${colors.reset}`);
            }
        }

        // Calculate total size
        const totalSize = packageSizes.reduce((total, pkg) => total + pkg.size, 0);
        console.log(`\n${colors.bright}Total size of node_modules:${colors.reset} ${formatSize(totalSize)}`);

        // General recommendations
        console.log(`\n${colors.bright}General Recommendations:${colors.reset}`);
        console.log(`  1. Use dynamic imports for large dependencies that aren't needed immediately`);
        console.log(`  2. Consider replacing large libraries with smaller alternatives`);
        console.log(`  3. Use tree-shaking compatible imports (e.g., lodash-es instead of lodash)`);
        console.log(`  4. Run 'npm dedupe' to remove duplicate packages`);
        console.log(`  5. Check which packages can be moved to devDependencies`);

        // Recommend running the bundle analyzer
        console.log(`\n${colors.bright}Next Steps:${colors.reset}`);
        console.log(`  Run 'npm run build:analyze' to see how these packages affect your actual bundle size`);

    } catch (error) {
        console.error('Error analyzing packages:', error);
        process.exit(1);
    }
}

// Main execution
analyzePackages(); 