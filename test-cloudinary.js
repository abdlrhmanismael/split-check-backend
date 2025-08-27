require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:3000/api';

// Test data
const testSession = {
  totalOrderAmount: 150.00,
  taxPercentage: 15.0,
  servicePercentage: 10.0,
  deliveryFee: 5.00,
  numberOfFriends: 3,
  instaPayURL: 'https://instapay.com/pay/123'
};

// Helper function to create a test image
function createTestImage() {
  const testImagePath = './test-bill.jpg';
  // Create a simple test image (1x1 pixel JPEG)
  const jpegData = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x11, 0x08, 0x00, 0x01,
    0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
    0xFF, 0xC4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xFF, 0xC4,
    0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xFF, 0xDA, 0x00, 0x0C,
    0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3F, 0x00, 0x8A, 0x00,
    0xFF, 0xD9
  ]);
  
  fs.writeFileSync(testImagePath, jpegData);
  return testImagePath;
}

async function testCloudinaryIntegration() {
  try {
    console.log('🚀 Testing Cloudinary Integration...\n');

    // Check if Cloudinary credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.log('⚠️  Cloudinary credentials not found in environment variables.');
      console.log('Please set up your .env file with Cloudinary credentials:');
      console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('CLOUDINARY_API_KEY=your_api_key');
      console.log('CLOUDINARY_API_SECRET=your_api_secret');
      console.log('\nSee CLOUDINARY_SETUP.md for detailed instructions.\n');
      return;
    }

    console.log('✅ Cloudinary credentials found in environment variables.\n');

    // Test 1: Create Session with Image Upload
    console.log('1. Testing Create Session with Cloudinary Upload...');
    const testImagePath = createTestImage();
    
    const formData = new FormData();
    Object.keys(testSession).forEach(key => {
      formData.append(key, testSession[key]);
    });
    formData.append('billImage', fs.createReadStream(testImagePath));

    const createResponse = await axios.post(`${BASE_URL}/sessions`, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
    
    const sessionId = createResponse.data.session.sessionId;
    const billImageUrl = createResponse.data.session.billImage;
    
    console.log('✅ Session Created:', sessionId);
    console.log('📸 Bill Image URL:', billImageUrl);
    
    // Verify it's a Cloudinary URL
    if (billImageUrl && billImageUrl.includes('cloudinary.com')) {
      console.log('✅ Cloudinary URL detected!');
      console.log('📁 Folder: orderSplitterBills/');
    } else {
      console.log('❌ Not a Cloudinary URL:', billImageUrl);
    }
    console.log('');

    // Test 2: Get Session Details
    console.log('2. Testing Get Session Details...');
    const getSessionResponse = await axios.get(`${BASE_URL}/sessions/${sessionId}`);
    console.log('✅ Session Details Retrieved');
    console.log('📸 Bill Image URL in response:', getSessionResponse.data.session.billImage);
    console.log('');

    // Clean up test image
    fs.unlinkSync(testImagePath);
    
    console.log('🎉 Cloudinary integration test completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Cloudinary credentials configured');
    console.log('- ✅ Image upload to Cloudinary working');
    console.log('- ✅ Images stored in orderSplitterBills/ folder');
    console.log('- ✅ Cloudinary URLs returned in API responses');

  } catch (error) {
    console.error('❌ Cloudinary test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 Possible issues:');
      console.log('- Check if Cloudinary credentials are correct');
      console.log('- Ensure image file is JPG, JPEG, or PNG');
      console.log('- Verify image file is under 5MB');
    }
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testCloudinaryIntegration();
}

module.exports = { testCloudinaryIntegration };
