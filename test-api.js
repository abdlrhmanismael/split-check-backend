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

const testFriend = {
  name: 'John Doe',
  products: [
    {
      productName: 'Pizza Margherita',
      unitPrice: 25.00,
      quantity: 2
    },
    {
      productName: 'Coca Cola',
      unitPrice: 3.00,
      quantity: 1
    }
  ],
  paymentMethod: false // false = cash, true = InstaPay
};

// Helper function to create a test image
function createTestImage() {
  const testImagePath = './test-image.jpg';
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

async function testAPI() {
  try {
    console.log('🚀 Starting API Tests...\n');

    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Create Session
    console.log('2. Testing Create Session...');
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
    console.log('✅ Session Created:', sessionId);
    console.log('Session Link:', createResponse.data.session.sessionLink);
    console.log('Bill Image URL:', createResponse.data.session.billImage);
    console.log('');

    // Test 3: Get Session Details
    console.log('3. Testing Get Session Details...');
    const getSessionResponse = await axios.get(`${BASE_URL}/sessions/${sessionId}`);
    console.log('✅ Session Details Retrieved');
    console.log('Friends Count:', getSessionResponse.data.session.friends.length);
    console.log('');

    // Test 4: Add Friend
    console.log('4. Testing Add Friend...');
    const addFriendResponse = await axios.post(`${BASE_URL}/sessions/${sessionId}/friends`, testFriend);
    console.log('✅ Friend Added:', addFriendResponse.data.friend.name);
    console.log('Total Amount:', addFriendResponse.data.friend.totalAmount);
    console.log('');

    // Test 5: Get Session Summary
    console.log('5. Testing Get Session Summary...');
    const summaryResponse = await axios.get(`${BASE_URL}/sessions/${sessionId}/summary`);
    console.log('✅ Session Summary Retrieved');
    console.log('Total Paid InstaPay:', summaryResponse.data.summary.totalPaidInstaPay);
    console.log('Total Paid Cash:', summaryResponse.data.summary.totalPaidCash);
    console.log('Total Unpaid:', summaryResponse.data.summary.totalUnpaid);
    console.log('');

    // Test 6: Update Payment Status
    console.log('6. Testing Update Payment Status...');
    const friendId = addFriendResponse.data.friend.id;
    const updatePaymentResponse = await axios.patch(
      `${BASE_URL}/sessions/${sessionId}/friends/${friendId}/payment`,
      { hasPaid: true }
    );
    console.log('✅ Payment Status Updated');
    console.log('Payment Status:', updatePaymentResponse.data.friend.hasPaid);
    console.log('');

    // Clean up test image
    fs.unlinkSync(testImagePath);
    
    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = { testAPI };
