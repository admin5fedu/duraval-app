#!/usr/bin/env node

/**
 * Generate Module Routes Script
 * 
 * Helper script to generate route components for a new module
 * 
 * Usage: node scripts/generate-module-routes.js <module-name> [module-path]
 * 
 * Example:
 *   node scripts/generate-module-routes.js danh-sach-nhan-su he-thong/nhan-su
 */

const fs = require('fs')
const path = require('path')

const MODULE_NAME = process.argv[2]
const MODULE_PATH = process.argv[3] || MODULE_NAME

if (!MODULE_NAME) {
  console.error('Error: Module name is required')
  console.log('Usage: node scripts/generate-module-routes.js <module-name> [module-path]')
  process.exit(1)
}

// Convert module name to different cases
const toPascalCase = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

const toCamelCase = (str) => {
  const pascal = toPascalCase(str)
  return pascal.charAt(0).toLowerCase() + pascal.slice(1)
}

const MODULE_PASCAL = toPascalCase(MODULE_NAME)
const MODULE_CAMEL = toCamelCase(MODULE_NAME)
const MODULE_KEBAB = MODULE_NAME

// Template paths
const TEMPLATE_DIR = path.join(__dirname, '../.templates/module-routes-template')
const TARGET_DIR = path.join(__dirname, `../src/features/${MODULE_PATH}/${MODULE_KEBAB}/routes`)

// Create target directory
if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true })
  console.log(`✓ Created directory: ${TARGET_DIR}`)
}

// Template files to generate
const TEMPLATE_FILES = [
  'list-route.tsx',
  'detail-route.tsx',
  'form-route.tsx',
  'index.ts'
]

// Replace placeholders in template
function replacePlaceholders(content) {
  return content
    .replace(/\{ModuleName\}/g, MODULE_PASCAL)
    .replace(/\{module-name\}/g, MODULE_KEBAB)
    .replace(/\{moduleName\}/g, MODULE_CAMEL)
}

// Generate files
TEMPLATE_FILES.forEach(filename => {
  const templatePath = path.join(TEMPLATE_DIR, filename)
  const targetPath = path.join(TARGET_DIR, filename.replace('{module-name}', MODULE_KEBAB))
  
  if (!fs.existsSync(templatePath)) {
    console.warn(`⚠ Template not found: ${templatePath}`)
    return
  }
  
  const template = fs.readFileSync(templatePath, 'utf8')
  const content = replacePlaceholders(template)
  
  fs.writeFileSync(targetPath, content, 'utf8')
  console.log(`✓ Generated: ${path.relative(process.cwd(), targetPath)}`)
})

console.log('\n✅ Route components generated successfully!')
console.log('\nNext steps:')
console.log(`1. Update routes.tsx to import and use the new route components`)
console.log(`2. Ensure your module config has routePath set`)
console.log(`3. Test the routes`)

