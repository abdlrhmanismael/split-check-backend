# Cloudinary Setup Guide

## 🔧 Setting up Cloudinary for Order Splitter

### 1. Create a Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

After signing in to Cloudinary:

1. Go to your **Dashboard**
2. Copy the following credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Update Environment Variables

Edit your `.env` file and replace the placeholder values:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 4. Features of Cloudinary Integration

✅ **Automatic Image Optimization** - Images are automatically optimized for web  
✅ **Secure Storage** - Images stored in Cloudinary's secure cloud  
✅ **CDN Delivery** - Fast global content delivery  
✅ **Image Transformations** - Automatic resizing and quality optimization  
✅ **Folder Organization** - Images stored in "orderSplitterBills" folder  
✅ **Format Validation** - Only JPG, JPEG, PNG files accepted  
✅ **Size Limits** - Maximum 5MB file size  

### 5. Image Storage Details

- **Folder**: `orderSplitterBills/`
- **Allowed Formats**: JPG, JPEG, PNG
- **Max File Size**: 5MB
- **Transformations**: 
  - Auto-resize if larger than 1000x1000px
  - Auto-optimize quality
- **URL Format**: `https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/orderSplitterBills/filename.jpg`

### 6. Testing the Integration

1. Start your server: `npm run dev`
2. Open Swagger UI: `http://localhost:3000/api-docs`
3. Test the "Create Session" endpoint with an image file
4. Check that the response contains a Cloudinary URL

### 7. Troubleshooting

**Common Issues:**

1. **"Invalid credentials" error**
   - Double-check your Cloudinary credentials in `.env`
   - Ensure no extra spaces or quotes

2. **"File too large" error**
   - Ensure image is under 5MB
   - Compress image if needed

3. **"Invalid file format" error**
   - Ensure image is JPG, JPEG, or PNG
   - Convert image format if needed

### 8. Security Notes

- Never commit your `.env` file to version control
- Keep your API credentials secure
- The free tier includes 25GB storage and 25GB bandwidth per month

### 9. API Response Changes

With Cloudinary integration, the API now returns:

```json
{
  "message": "Session created successfully",
  "session": {
    "sessionId": "uuid-string",
    "billImage": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/orderSplitterBills/filename.jpg",
    // ... other fields
  }
}
```

The `billImage` field now contains the full Cloudinary URL instead of a local file path.

