// Quick verification script for upload endpoint
// This checks if the route is properly registered

const fs = require('fs');
const path = require('path');

console.log('Verifying Upload Endpoint Setup...');
console.log('==================================\n');

// Check if files exist
const files = {
  'Route file': 'src/routes/uploadRoutes.ts',
  'Controller file': 'src/controllers/uploadController.ts',
  'Middleware file': 'src/middleware/upload.ts',
  'Index file': 'src/index.ts'
};

let allExist = true;
for (const [name, filePath] of Object.entries(files)) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${name}: EXISTS`);
  } else {
    console.log(`❌ ${name}: MISSING`);
    allExist = false;
  }
}

console.log('\nChecking route registration...');
const indexContent = fs.readFileSync(path.join(__dirname, 'src/index.ts'), 'utf8');
if (indexContent.includes('uploadRoutes')) {
  console.log('✅ Upload routes imported');
} else {
  console.log('❌ Upload routes NOT imported');
  allExist = false;
}

if (indexContent.includes('/api/upload')) {
  console.log('✅ Upload routes registered at /api/upload');
} else {
  console.log('❌ Upload routes NOT registered');
  allExist = false;
}

console.log('\nChecking package.json...');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
if (packageJson.dependencies && packageJson.dependencies.multer) {
  console.log('✅ Multer is installed');
} else {
  console.log('❌ Multer is NOT installed');
  allExist = false;
}

console.log('\n' + '='.repeat(50));
if (allExist) {
  console.log('✅ All checks passed! Endpoint should be working.');
  console.log('\nTo test the endpoint:');
  console.log('1. Make sure the server is running: npm run dev');
  console.log('2. Use the test script: node test-upload-api.js YOUR_TOKEN');
  console.log('3. Or use curl with a valid JWT token');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
}

