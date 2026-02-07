#!/bin/bash

# Test script for KYC upload endpoint
# Usage: ./test-upload.sh

API_URL="http://localhost:4000"
TOKEN="your-token-here"  # Replace with actual token

echo "Testing KYC Upload Endpoint..."
echo "================================"

# Create a test image file
echo "Creating test image..."
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-image.png

# Test 1: Without authentication
echo ""
echo "Test 1: Without authentication token"
curl -X POST "$API_URL/api/upload/kyc" \
  -F "file=@/tmp/test-image.png" \
  -w "\nHTTP Status: %{http_code}\n" \
  2>&1 | tail -3

# Test 2: With authentication (if token provided)
if [ "$TOKEN" != "your-token-here" ]; then
  echo ""
  echo "Test 2: With authentication token"
  curl -X POST "$API_URL/api/upload/kyc" \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@/tmp/test-image.png" \
    -w "\nHTTP Status: %{http_code}\n" \
    2>&1 | tail -5
fi

# Cleanup
rm -f /tmp/test-image.png

echo ""
echo "Test completed!"

