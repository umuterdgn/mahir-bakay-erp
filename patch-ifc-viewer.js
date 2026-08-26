/**
 * © 2026 NXA Software. All rights reserved.
 * Developer: Umut Erdoğan
 * This code is the property of NXA Software.
 * 
 * web-ifc-viewer Three.js compatibility patch
 * Replaces deprecated mergeBufferGeometries with mergeGeometries
 */

const fs = require('fs');
const path = require('path');

const webIfcViewerPath = path.join(__dirname, 'node_modules', 'web-ifc-viewer', 'dist');

console.log('🔧 Patching web-ifc-viewer for Three.js compatibility...');
console.log(`📁 Target directory: ${webIfcViewerPath}`);

if (!fs.existsSync(webIfcViewerPath)) {
  console.error('❌ web-ifc-viewer/dist directory not found!');
  console.error('Please install dependencies first: npm install');
  process.exit(1);
}

let filesPatched = 0;

function patchDirectory(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    
    if (item.isDirectory()) {
      patchDirectory(fullPath);
    } else if (item.isFile() && (item.name.endsWith('.js') || item.name.endsWith('.mjs'))) {
      patchFile(fullPath);
    }
  }
}

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace mergeBufferGeometries with mergeGeometries
  content = content.replace(/mergeBufferGeometries/g, 'mergeGeometries');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesPatched++;
    console.log(`✅ Patched: ${path.relative(webIfcViewerPath, filePath)}`);
  }
}

try {
  patchDirectory(webIfcViewerPath);
  
  if (filesPatched > 0) {
    console.log(`\n✨ Successfully patched ${filesPatched} file(s)`);
    console.log('🎉 Three.js compatibility patch applied!');
  } else {
    console.log('\nℹ️  No files needed patching (already patched or different version)');
  }
} catch (error) {
  console.error('❌ Error during patching:', error.message);
  process.exit(1);
}
