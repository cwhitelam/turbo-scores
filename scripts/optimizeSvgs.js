#!/usr/bin/env node

/**
 * SVG Optimization Script
 * 
 * This script finds and optimizes SVG files in the project to reduce their size.
 * It removes unnecessary attributes, minifies the content, and generates optimized versions.
 * 
 * Usage:
 *   node scripts/optimizeSvgs.js [--dir=src/assets]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Get directory name for the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const targetDir = args.find(arg => arg.startsWith('--dir='))?.split('=')[1] || 'src';

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

// Tracking stats
const stats = {
    filesProcessed: 0,
    totalOriginalSize: 0,
    totalOptimizedSize: 0,
    errors: 0,
};

/**
 * Format bytes to human-readable size
 */
function formatSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(1) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
}

/**
 * Calculate size reduction percentage
 */
function calculateReduction(original, optimized) {
    if (original === 0) return 0;
    return ((original - optimized) / original * 100).toFixed(1);
}

/**
 * Find all SVG files in the directory
 */
function findSvgFiles(directory) {
    const svgFiles = [];

    function scanDir(currentDir) {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        entries.forEach(entry => {
            const entryPath = path.join(currentDir, entry.name);

            if (entry.isDirectory() && !entry.name.startsWith('node_modules') && !entry.name.startsWith('.')) {
                scanDir(entryPath);
            } else if (entry.isFile() && entry.name.endsWith('.svg')) {
                svgFiles.push(entryPath);
            }
        });
    }

    scanDir(directory);
    return svgFiles;
}

/**
 * Optimize an SVG string
 */
function optimizeSvg(svgContent) {
    // Remove XML declaration
    svgContent = svgContent.replace(/<\?xml[^>]*>\s*/g, '');

    // Remove comments
    svgContent = svgContent.replace(/<!--[\s\S]*?-->/g, '');

    // Remove unnecessary attributes
    svgContent = svgContent.replace(/\s+version=["'][^"']*["']/g, '');
    svgContent = svgContent.replace(/\s+xmlns:xlink=["'][^"']*["']/g, '');
    svgContent = svgContent.replace(/\s+xlink:space=["'][^"']*["']/g, '');

    // Remove empty attributes
    svgContent = svgContent.replace(/\s+\w+=["'][''"]/g, '');

    // Remove newlines and reduce multiple spaces to one
    svgContent = svgContent.replace(/\n/g, ' ');
    svgContent = svgContent.replace(/\s{2,}/g, ' ');

    // Remove space before closing tags
    svgContent = svgContent.replace(/\s+>/g, '>');

    // Remove space after opening tags
    svgContent = svgContent.replace(/<\s+/g, '<');

    // Simplify path data (remove unnecessary decimals)
    svgContent = svgContent.replace(/(\d+\.\d{2})\d+/g, '$1');

    return svgContent;
}

/**
 * Process a single SVG file
 */
function processSvgFile(filePath) {
    try {
        // Read original file
        const originalContent = fs.readFileSync(filePath, 'utf8');
        const originalSize = Buffer.byteLength(originalContent, 'utf8');

        // Optimize SVG content
        const optimizedContent = optimizeSvg(originalContent);
        const optimizedSize = Buffer.byteLength(optimizedContent, 'utf8');

        // Create optimized filename
        const fileDir = path.dirname(filePath);
        const fileName = path.basename(filePath, '.svg');
        const optimizedFilePath = path.join(fileDir, `${fileName}.optimized.svg`);

        // Write optimized file
        fs.writeFileSync(optimizedFilePath, optimizedContent, 'utf8');

        // Update stats
        stats.filesProcessed++;
        stats.totalOriginalSize += originalSize;
        stats.totalOptimizedSize += optimizedSize;

        // Calculate reduction
        const reduction = calculateReduction(originalSize, optimizedSize);

        // Color-code the reduction
        let reductionColor = colors.green;
        if (reduction < 5) {
            reductionColor = colors.dim;
        } else if (reduction > 30) {
            reductionColor = colors.cyan;
        }

        console.log(`${filePath}`);
        console.log(`  Original: ${formatSize(originalSize)} → Optimized: ${formatSize(optimizedSize)} (${reductionColor}-${reduction}%${colors.reset})`);

        return {
            filePath,
            originalSize,
            optimizedSize,
            reduction: parseFloat(reduction)
        };
    } catch (error) {
        console.error(`${colors.red}Error processing ${filePath}:${colors.reset}`, error.message);
        stats.errors++;
        return null;
    }
}

/**
 * Generate React component from SVG
 */
function generateReactComponent(svgInfo) {
    if (!svgInfo) return;

    try {
        const fileDir = path.dirname(svgInfo.filePath);
        const fileName = path.basename(svgInfo.filePath, '.svg');
        const componentName = fileName
            .split('-')
            .map(part => part.charAt(0).toUpperCase() + part.slice(1))
            .join('') + 'Icon';

        // Read optimized SVG content
        const optimizedFilePath = path.join(fileDir, `${fileName}.optimized.svg`);
        let svgContent = fs.readFileSync(optimizedFilePath, 'utf8');

        // Extract SVG attributes and content
        const svgMatch = svgContent.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
        if (!svgMatch) throw new Error('Invalid SVG format');

        const svgAttrs = svgMatch[1];
        const svgInnerContent = svgMatch[2];

        // Parse width and height
        const widthMatch = svgAttrs.match(/\swidth=["']([^"']*)["']/);
        const heightMatch = svgAttrs.match(/\sheight=["']([^"']*)["']/);
        const viewBoxMatch = svgAttrs.match(/\sviewBox=["']([^"']*)["']/);

        const width = widthMatch ? widthMatch[1] : '24';
        const height = heightMatch ? heightMatch[1] : '24';
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';

        // Create React component content
        const componentContent = `import React from 'react';

interface ${componentName}Props {
  width?: string | number;
  height?: string | number;
  color?: string;
  className?: string;
}

export function ${componentName}({ 
  width = ${width.includes('%') ? `"${width}"` : width}, 
  height = ${height.includes('%') ? `"${height}"` : height}, 
  color = "currentColor",
  className = "",
}: ${componentName}Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      ${svgInnerContent}
    </svg>
  );
}`;

        // Write the component file
        const componentFilePath = path.join(fileDir, `${componentName}.tsx`);
        fs.writeFileSync(componentFilePath, componentContent, 'utf8');

        console.log(`  ${colors.green}Created React component:${colors.reset} ${componentFilePath}`);

    } catch (error) {
        console.error(`${colors.red}Error generating React component:${colors.reset}`, error.message);
        stats.errors++;
    }
}

/**
 * Main function to optimize SVGs
 */
async function optimizeSvgs() {
    const targetPath = path.join(rootDir, targetDir);

    console.log(`\n${colors.bright}=== SVG Optimization ===\n${colors.reset}`);
    console.log(`Scanning ${targetPath} for SVG files...\n`);

    const svgFiles = findSvgFiles(targetPath);

    if (svgFiles.length === 0) {
        console.log(`${colors.yellow}No SVG files found in ${targetPath}${colors.reset}`);
        return;
    }

    console.log(`Found ${svgFiles.length} SVG files.\n`);

    const results = [];

    // Process each SVG file
    for (const file of svgFiles) {
        const result = processSvgFile(file);
        if (result) results.push(result);

        // Generate React component for SVGs with significant optimization
        if (result && result.reduction > 10) {
            generateReactComponent(result);
        }
    }

    // Sort results by reduction percentage (highest first)
    results.sort((a, b) => b.reduction - a.reduction);

    // Print summary
    console.log(`\n${colors.bright}Summary:${colors.reset}`);
    console.log(`  Files processed: ${stats.filesProcessed}`);
    console.log(`  Total original size: ${formatSize(stats.totalOriginalSize)}`);
    console.log(`  Total optimized size: ${formatSize(stats.totalOptimizedSize)}`);

    const totalReduction = calculateReduction(stats.totalOriginalSize, stats.totalOptimizedSize);
    console.log(`  Overall reduction: ${colors.green}${totalReduction}%${colors.reset}`);

    if (stats.errors > 0) {
        console.log(`  ${colors.red}Errors: ${stats.errors}${colors.reset}`);
    }

    console.log(`\n${colors.bright}Top Optimizations:${colors.reset}`);
    results.slice(0, 5).forEach(result => {
        console.log(`  ${path.basename(result.filePath)}: ${colors.green}-${result.reduction}%${colors.reset}`);
    });

    console.log(`\n${colors.bright}Usage Instructions:${colors.reset}`);
    console.log(`  1. Review the optimized SVGs to ensure quality is maintained`);
    console.log(`  2. Replace original SVGs with optimized versions if satisfied`);
    console.log(`  3. Use generated React components for improved performance`);
}

// Main execution
optimizeSvgs().catch(error => {
    console.error('Error running SVG optimization:', error);
    process.exit(1);
}); 