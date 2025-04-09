#!/usr/bin/env node

/**
 * Script to analyze and optimize imports across the project
 * Identifies issues like unused imports, oversized imports, and inefficient imports
 * 
 * Usage:
 *   node scripts/optimizeImports.js           # analyze only
 *   node scripts/optimizeImports.js --fix     # analyze and fix issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if running in fix mode
const FIX_MODE = process.argv.includes('--fix');

// Configuration
const CONFIG = {
    // Directory to scan
    srcDir: path.join(__dirname, '..', 'src'),

    // File patterns to include
    includePatterns: [/\.(ts|tsx|js|jsx)$/],

    // Packages that should be imported with specific syntax
    packageRules: {
        // Package that should use named imports to enable tree-shaking
        preferNamed: [
            'lucide-react',
            '@heroicons/react',
            'date-fns',
            'lodash',
        ],

        // Packages that should use default imports due to their structure
        preferDefault: [
            'react',
            'react-dom',
        ],
    },

    // Directories to exclude
    excludeDirs: [
        'node_modules',
        'dist',
        'build',
        'public',
    ],

    // Maximum lines to analyze
    maxLines: 10000,
};

// ANSI colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    cyan: '\x1b[36m',
};

// Results storage
const results = {
    issues: [],
    totalFiles: 0,
    totalIssues: 0,
    issuesByType: {},
    fixedIssues: 0,
};

/**
 * Scans a directory recursively for files to analyze
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

        results.totalFiles++;
        analyzeFile(fullPath);
    });
}

/**
 * Analyzes a file for import issues
 */
function analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n').slice(0, CONFIG.maxLines);
    const relativePath = filePath.replace(CONFIG.srcDir + '/', '');

    const importLines = lines.filter(line => line.trim().startsWith('import '));
    const fileIssues = [];

    // Check for problematic imports
    importLines.forEach(line => {
        // Look for default imports from packages that should use named imports
        CONFIG.packageRules.preferNamed.forEach(pkg => {
            if (line.includes(`from '${pkg}'`) && line.match(/import\s+[A-Z]\w+\s+from/)) {
                addIssue('preferNamed', relativePath, line.trim(), pkg, fileIssues);
            }
        });

        // Look for wildcard imports
        if (line.includes('* as') && !line.includes('@types/')) {
            addIssue('wildcardImport', relativePath, line.trim(), null, fileIssues);
        }

        // Look for named imports from packages that should use default imports
        CONFIG.packageRules.preferDefault.forEach(pkg => {
            if (line.includes(`from '${pkg}'`) && line.match(/import\s+{\s*.+\s*}\s+from/)) {
                addIssue('preferDefault', relativePath, line.trim(), pkg, fileIssues);
            }
        });

        // Check for large UI library imports like @heroicons/react/24/solid
        if (line.includes('@heroicons/react/24/solid') || line.includes('@heroicons/react/24/outline')) {
            addIssue('heroiconBundle', relativePath, line.trim(), null, fileIssues);
        }

        // Check for lodash imports without specific functions
        if (line.includes('from \'lodash\'') && !line.match(/import\s+{\s*.+\s*}\s+from/)) {
            addIssue('lodashBundle', relativePath, line.trim(), null, fileIssues);
        }
    });

    // If in fix mode and we have issues, try to fix them
    if (FIX_MODE && fileIssues.length > 0) {
        fixImportIssues(filePath, content, fileIssues);
    }
}

/**
 * Adds an issue to the results
 */
function addIssue(type, file, line, pkg = null, fileIssues = null) {
    const issue = { type, file, line, pkg };

    results.issues.push(issue);
    if (fileIssues) fileIssues.push(issue);

    results.totalIssues++;
    results.issuesByType[type] = (results.issuesByType[type] || 0) + 1;
}

/**
 * Attempts to fix import issues in a file
 */
function fixImportIssues(filePath, content, issues) {
    let fixedContent = content;
    let fixCount = 0;

    issues.forEach(issue => {
        const originalLine = issue.line;
        let fixedLine = null;

        switch (issue.type) {
            case 'preferNamed':
                // Convert default import to named import
                // e.g., "import Icon from 'lucide-react'" to "import { Icon } from 'lucide-react'"
                const match = originalLine.match(/import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
                if (match) {
                    const [, componentName, packageName] = match;
                    fixedLine = `import { ${componentName} } from '${packageName}'`;
                }
                break;

            case 'preferDefault':
                // Convert named import to default import
                // e.g., "import { React } from 'react'" to "import React from 'react'"
                const namedMatch = originalLine.match(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/);
                if (namedMatch) {
                    const [, imports, packageName] = namedMatch;
                    // Only convert if it's a single import
                    if (!imports.includes(',')) {
                        fixedLine = `import ${imports.trim()} from '${packageName}'`;
                    }
                }
                break;

            case 'lodashBundle':
                // Can't auto-fix this without knowing which functions are used
                break;

            case 'heroiconBundle':
                // Can't auto-fix this without analyzing usage
                break;

            case 'wildcardImport':
                // Can't safely auto-fix wildcard imports without analyzing usage
                break;
        }

        if (fixedLine && fixedLine !== originalLine) {
            fixedContent = fixedContent.replace(originalLine, fixedLine);
            fixCount++;
            results.fixedIssues++;
        }
    });

    if (fixCount > 0) {
        fs.writeFileSync(filePath, fixedContent, 'utf8');
        console.log(`${colors.green}Fixed ${fixCount} issue(s) in ${filePath}${colors.reset}`);
    }
}

/**
 * Gets recommendation for an issue
 */
function getRecommendation(issue) {
    switch (issue.type) {
        case 'preferNamed':
            return `Use named imports: import { ComponentName } from '${issue.pkg}'`;
        case 'wildcardImport':
            return `Import specific items instead of using wildcard imports`;
        case 'preferDefault':
            return `Use default import: import React from '${issue.pkg}'`;
        case 'heroiconBundle':
            return `Import from individual files: import { XIcon } from '@heroicons/react/24/solid/XIcon'`;
        case 'lodashBundle':
            return `Import specific functions: import { debounce, throttle } from 'lodash'`;
        default:
            return 'Optimize import to reduce bundle size';
    }
}

/**
 * Gets color for an issue type
 */
function getIssueColor(type) {
    switch (type) {
        case 'heroiconBundle':
        case 'lodashBundle':
            return colors.red;
        case 'wildcardImport':
            return colors.yellow;
        case 'preferNamed':
        case 'preferDefault':
            return colors.cyan;
        default:
            return colors.reset;
    }
}

/**
 * Gets human-readable description for an issue type
 */
function getIssueTypeName(type) {
    switch (type) {
        case 'preferNamed':
            return 'Should use named imports';
        case 'wildcardImport':
            return 'Wildcard import';
        case 'preferDefault':
            return 'Should use default import';
        case 'heroiconBundle':
            return 'Inefficient Heroicon import';
        case 'lodashBundle':
            return 'Inefficient Lodash import';
        default:
            return type;
    }
}

/**
 * Prints analysis results to the console
 */
function printResults() {
    console.log(`\n${colors.bright}=== Import Optimization Analysis ===\n${colors.reset}`);

    if (results.issues.length === 0) {
        console.log(`${colors.green}No import issues found in ${results.totalFiles} files!${colors.reset}`);
        return;
    }

    // Group issues by file for better organization
    const issuesByFile = {};
    results.issues.forEach(issue => {
        issuesByFile[issue.file] = issuesByFile[issue.file] || [];
        issuesByFile[issue.file].push(issue);
    });

    // List issues by file
    Object.entries(issuesByFile).forEach(([file, issues]) => {
        console.log(`\n${colors.bright}${file}${colors.reset} (${issues.length} issues):`);

        issues.forEach(issue => {
            const issueColor = getIssueColor(issue.type);
            console.log(`  ${issueColor}${getIssueTypeName(issue.type)}${colors.reset}: ${issue.line}`);
            console.log(`    ${colors.dim}${getRecommendation(issue)}${colors.reset}`);
        });
    });

    // Print summary
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Total files analyzed: ${results.totalFiles}`);
    console.log(`  Files with issues: ${Object.keys(issuesByFile).length}`);
    console.log(`  Total issues: ${results.totalIssues}`);

    if (FIX_MODE) {
        console.log(`  Issues automatically fixed: ${results.fixedIssues}`);
    }

    // Print issue counts by type
    Object.entries(results.issuesByType).forEach(([type, count]) => {
        const issueColor = getIssueColor(type);
        console.log(`  ${issueColor}${getIssueTypeName(type)}: ${count}${colors.reset}`);
    });

    console.log(`\n${colors.bright}Recommendations:${colors.reset}`);
    console.log(`  1. Use named imports from UI libraries for better tree-shaking`);
    console.log(`  2. Import individual components rather than entire modules`);
    console.log(`  3. Avoid wildcard imports to reduce bundle size`);
    console.log(`  4. Consistently use default or named imports as appropriate`);

    if (!FIX_MODE) {
        console.log(`\n${colors.bright}To automatically fix some issues, run:${colors.reset}`);
        console.log(`  node scripts/optimizeImports.js --fix`);
    }
}

// Main execution
try {
    console.log(`Scanning ${CONFIG.srcDir} for import optimization opportunities...`);
    console.log(FIX_MODE ? `Running in FIX mode - will attempt to fix issues automatically` : `Running in ANALYZE mode - use --fix to automatically fix issues`);
    scanDirectory(CONFIG.srcDir);
    printResults();
} catch (error) {
    console.error('Error analyzing imports:', error);
    process.exit(1);
} 