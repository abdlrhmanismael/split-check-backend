require('dotenv').config();
const { createSession } = require('./controllers/sessionController');

// Mock request and response objects
const mockReq = {
  body: {
    totalOrderAmount: '150.00',
    taxPercentage: '15.0',
    servicePercentage: '10.0',
    deliveryFee: '5.00',
    numberOfFriends: '3',
    instaPayURL: 'https://instapay.com/pay/123'
  },
  file: {
    path: 'https://res.cloudinary.com/dqohk9jjp/image/upload/v1234567890/orderSplitterBills/test.jpg'
  }
};

const mockRes = {
  status: function(code) {
    console.log('Response status:', code);
    return this;
  },
  json: function(data) {
    console.log('Response data:', JSON.stringify(data, null, 2));
    return this;
  }
};

async function testController() {
  try {
    console.log('🚀 Testing Controller Logic...\n');
    
    console.log('Request body:', mockReq.body);
    console.log('File path:', mockReq.file.path);
    console.log('');
    
    await createSession(mockReq, mockRes);
    
    console.log('\n🎉 Controller test completed!');
    
  } catch (error) {
    console.error('❌ Controller test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testController();

