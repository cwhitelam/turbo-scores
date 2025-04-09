#!/usr/bin/env node

/**
 * Bundle Size Optimization Master Script
 * 
 * This script runs all optimization tools in sequence to help maintain optimal bundle size.
 * 
 * Usage:
 *   node scripts/optimizeBundleSize.js [--fix]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if running in fix mode
const FIX_MODE = process.argv.includes('--fix');

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

/**
 * Runs a command and returns the result
 */
function runCommand(command, ignoreErrors = false) {
    console.log(`\n${colors.cyan}> ${command}${colors.reset}\n`);

    try {
        const output = execSync(command, {
            stdio: 'inherit',
            encoding: 'utf-8'
        });
        return { success: true, output };
    } catch (error) {
        if (!ignoreErrors) {
            console.error(`${colors.red}Error executing command:${colors.reset} ${command}`);
            console.error(error.message);
        }
        return { success: false, error };
    }
}

/**
 * Displays formatted section header
 */
function displaySection(title) {
    const line = '─'.repeat(title.length + 8);
    console.log(`\n${colors.bright}╭${line}╮${colors.reset}`);
    console.log(`${colors.bright}│   ${title}   │${colors.reset}`);
    console.log(`${colors.bright}╰${line}╯${colors.reset}\n`);
}

/**
 * Main function to run all optimizations
 */
async function optimizeBundleSize() {
    console.log(`\n${colors.bright}=== Turbo Scores Bundle Size Optimization ===\n${colors.reset}`);
    console.log(`Running in ${FIX_MODE ? colors.green + 'FIX' : colors.yellow + 'ANALYZE'} mode${colors.reset}\n`);

    const startTime = Date.now();

    try {
        // 1. Analyze codebase for large components
        displaySection('Finding Large Components');
        runCommand('node scripts/findLargeComponents.js');

        // 2. Analyze and optimize imports
        displaySection('Analyzing Imports');
        if (FIX_MODE) {
            runCommand('node scripts/optimizeImports.js --fix');
        } else {
            runCommand('node scripts/optimizeImports.js');
        }

        // 3. Analyze package sizes
        displaySection('Analyzing Package Sizes');
        runCommand('node scripts/analyzePackages.js');

        // 4. Optimize SVGs if in fix mode
        if (FIX_MODE) {
            displaySection('Optimizing SVGs');
            runCommand('node scripts/optimizeSvgs.js');
        }

        // 5. Run bundle analyzer if in fix mode
        if (FIX_MODE) {
            displaySection('Analyzing Bundle');
            runCommand('npm run build:analyze', true);
        }

        // Calculate duration
        const duration = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log(`\n${colors.bright}✅ All optimization tools completed in ${duration}s!${colors.reset}\n`);

        // Recommendations
        console.log(`${colors.bright}Next Steps:${colors.reset}`);

        if (!FIX_MODE) {
            console.log(`  • Run with ${colors.green}--fix${colors.reset} flag to automatically fix issues: ${colors.cyan}node scripts/optimizeBundleSize.js --fix${colors.reset}`);
        } else {
            console.log(`  • Review the changes made to your codebase`);
            console.log(`  • Test the application thoroughly to ensure optimizations don't break functionality`);
        }

        console.log(`  • Refer to ${colors.bright}BUNDLE_OPTIMIZATION.md${colors.reset} for more optimization strategies`);
        console.log(`  • Consider implementing the future optimizations listed in the documentation\n`);

    } catch (error) {
        console.error(`\n${colors.red}Error running optimization tools:${colors.reset}`, error);
        process.exit(1);
    }
}

// Main execution
optimizeBundleSize().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 