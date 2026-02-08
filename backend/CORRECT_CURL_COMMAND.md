# Correct curl command for KYC Upload

## Issue with your curl command

Your curl command uses `--data-raw` which doesn't work properly for file uploads. The file content is also empty.

## ✅ Correct curl command

```bash
curl -X POST 'http://localhost:4000/api/upload/kyc' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWp2bnphYmswMDAwYzFrejliZDEwNXNsIiwiaWF0IjoxNzcwNTAyOTI4LCJleHAiOjE3NzExMDc3Mjh9.5sJwBGa-yoqXV5nLdHLs_9bkqt3hofa8NYrkHizTcgM' \
  -F "file=@/path/to/your/image.jpg"
```

## Key differences:

1. **Use `-F` flag** instead of `--data-raw` - This tells curl to send multipart/form-data
2. **Use `@` before file path** - The `@` tells curl to read the file from disk
3. **Don't set Content-Type manually** - curl will set it automatically with the correct boundary

## Example with actual file:

```bash
# Create a test image first
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > test.jpg

# Then upload it
curl -X POST 'http://localhost:4000/api/upload/kyc' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -F "file=@test.jpg"
```

## Expected Response (Success):

```json
{
  "success": true,
  "file": {
    "filename": "New Project-1234567890-987654321.jpg",
    "originalName": "New Project.jpg",
    "url": "/uploads/kyc/New Project-1234567890-987654321.jpg",
    "size": 1234,
    "mimetype": "image/jpeg"
  }
}
```

## Common Errors:

1. **401 Unauthorized** - Token is invalid or expired
2. **400 Bad Request** - File type not allowed or file is empty
3. **400 File size exceeds 5MB limit** - File is too large
4. **500 Internal Server Error** - Check server logs

