#!/usr/bin/env node

/**
 * Script to check for missing imports of utility functions
 * 
 * Usage: node scripts/check-missing-imports.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utility functions to check
const UTILITY_FUNCTIONS = {
  'text-styles': [
    'pageTitleClass',
    'emptyStateTitleClass',
    'dialogTitleClass',
    'bodyTextClass',
    'smallTextClass',
    'mediumTextClass',
    'smallMediumTextClass',
    'responsiveTextClass',
  ],
  'toolbar-styles': [
    'toolbarButtonClass',
    'toolbarButtonOutlineClass',
    'toolbarGapClass',
    'toolbarContainerClass',
  ],
  'spacing-styles': [
    'dialogContentSpacingClass',
    'dialogPaddingClass',
    'emptyStateSpacingClass',
    'filterGapClass',
    'filterContainerClass',
    'compactPaddingClass',
    'standardPaddingClass',
  ],
  'section-styles': [
    'sectionTitleClass',
    'formSectionGapClass',
    'formSectionContainerClass',
    'sectionSpacingClass',
  ],
  'card-styles': [
    'cardPaddingClass',
    'cardClass',
  ],
  'border-radius-styles': [
    'buttonRadiusClass',
    'cardRadiusClass',
    'inputRadiusClass',
    'badgeRadiusClass',
    'avatarRadiusClass',
    'dialogRadiusClass',
    'popoverRadiusClass',
  ],
  'shadow-styles': [
    'cardShadowClass',
    'buttonShadowClass',
    'dropdownShadowClass',
    'dialogShadowClass',
    'tooltipShadowClass',
    'popoverShadowClass',
    'toolbarShadowClass',
  ],
};

// Get all utility function names
const ALL_FUNCTIONS = Object.values(UTILITY_FUNCTIONS).flat();

// Find all TypeScript/TSX files in src/shared/components
function findFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Check if a function is used but not imported
function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];
  
  // Check each utility function
  ALL_FUNCTIONS.forEach(funcName => {
    // Check if function is used (with parentheses)
    const functionUsed = new RegExp(`\\b${funcName}\\s*\\(`, 'g').test(content);
    
    if (functionUsed) {
      // Find which module this function belongs to
      let moduleName = null;
      for (const [module, functions] of Object.entries(UTILITY_FUNCTIONS)) {
        if (functions.includes(funcName)) {
          moduleName = module;
          break;
        }
      }
      
      if (moduleName) {
        // Check if it's imported from the correct module
        const importPattern = new RegExp(
          `import\\s+.*\\b${funcName}\\b.*from\\s+['"]@/shared/utils/${moduleName}['"]`,
          'g'
        );
        
        if (!importPattern.test(content)) {
          // Check if there's any import from the module at all
          const moduleImportPattern = new RegExp(
            `import\\s+.*from\\s+['"]@/shared/utils/${moduleName}['"]`,
            'g'
          );
          
          if (moduleImportPattern.test(content)) {
            issues.push({
              file: filePath,
              function: funcName,
              module: moduleName,
              issue: 'Function used but not imported (module imported but function missing)',
            });
          } else {
            issues.push({
              file: filePath,
              function: funcName,
              module: moduleName,
              issue: 'Function used but module not imported',
            });
          }
        }
      }
    }
  });
  
  return issues;
}

// Main execution
const componentsDir = path.join(__dirname, '../src/shared/components');
const files = findFiles(componentsDir);
const allIssues = [];

console.log(`Checking ${files.length} files for missing imports...\n`);

files.forEach(file => {
  const issues = checkFile(file);
  if (issues.length > 0) {
    allIssues.push(...issues);
  }
});

if (allIssues.length === 0) {
  console.log('✅ No missing imports found!');
  process.exit(0);
} else {
  console.log(`❌ Found ${allIssues.length} missing import(s):\n`);
  
  // Group by file
  const issuesByFile = {};
  allIssues.forEach(issue => {
    if (!issuesByFile[issue.file]) {
      issuesByFile[issue.file] = [];
    }
    issuesByFile[issue.file].push(issue);
  });
  
  Object.entries(issuesByFile).forEach(([file, issues]) => {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`📄 ${relativePath}`);
    issues.forEach(issue => {
      console.log(`   - Missing: ${issue.function} from @/shared/utils/${issue.module}`);
      console.log(`     Issue: ${issue.issue}`);
    });
    console.log();
  });
  
  process.exit(1);
}

