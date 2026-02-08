#!/bin/bash

# Test script for KYC upload with proper curl command
# Usage: ./test-curl-upload.sh [path-to-image-file]

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWp2bnphYmswMDAwYzFrejliZDEwNXNsIiwiaWF0IjoxNzcwNTAyOTI4LCJleHAiOjE3NzExMDc3Mjh9.5sJwBGa-yoqXV5nLdHLs_9bkqt3hofa8NYrkHizTcgM"
API_URL="http://localhost:4000/api/upload/kyc"

# Create a test image if no file provided
if [ -z "$1" ]; then
  echo "Creating test image..."
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > /tmp/test-upload.png
  FILE_PATH="/tmp/test-upload.png"
else
  FILE_PATH="$1"
fi

echo "Testing KYC Upload API..."
echo "========================="
echo "URL: $API_URL"
echo "File: $FILE_PATH"
echo ""

# Test with proper curl -F flag (form data)
echo "Sending request..."
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@$FILE_PATH")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo ""
echo "Response:"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""
echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
  echo "✅ Upload successful!"
else
  echo "❌ Upload failed"
fi

# Cleanup
if [ -z "$1" ]; then
  rm -f /tmp/test-upload.png
fi

