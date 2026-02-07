// Simple test script for KYC upload API
// Run: node test-upload-api.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:4000';
const TOKEN = process.argv[2] || ''; // Pass token as argument: node test-upload-api.js YOUR_TOKEN

// Create a small test image (1x1 PNG)
const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const testImageBuffer = Buffer.from(testImageBase64, 'base64');

// Create multipart form data
const boundary = '----WebKitFormBoundary' + Date.now();
const formData = [
  `--${boundary}`,
  'Content-Disposition: form-data; name="file"; filename="test.png"',
  'Content-Type: image/png',
  '',
  testImageBuffer.toString('binary'),
  `--${boundary}--`
].join('\r\n');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/upload/kyc',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': Buffer.byteLength(formData),
    ...(TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {})
  }
};

console.log('Testing KYC Upload API...');
console.log('========================');
console.log(`URL: ${API_URL}/api/upload/kyc`);
console.log(`Token: ${TOKEN ? 'Provided' : 'Not provided (will fail auth)'}`);
console.log('');

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response:');
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log(data);
    }
    
    if (res.statusCode === 200 || res.statusCode === 201) {
      console.log('\n✅ Upload successful!');
    } else {
      console.log('\n❌ Upload failed');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  if (error.code === 'ECONNREFUSED') {
    console.error('\n❌ Server is not running on port 4000');
    console.error('   Please start the backend server first');
  }
});

req.write(formData);
req.end();

