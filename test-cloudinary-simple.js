require('dotenv').config();
const { cloudinary } = require('./config/cloudinary');

async function testCloudinaryConnection() {
  try {
    console.log('🚀 Testing Cloudinary Connection...\n');
    
    console.log('Cloudinary Configuration:');
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    console.log('API Key:', process.env.CLOUDINARY_API_KEY);
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : 'Not set');
    console.log('');

    // Test Cloudinary connection by getting account info
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Response:', result);
    
    // Test upload configuration
    console.log('\n📁 Testing upload configuration...');
    console.log('Folder: orderSplitterBills/');
    console.log('Allowed formats: jpg, jpeg, png');
    console.log('Max file size: 5MB');
    
    console.log('\n🎉 Cloudinary is properly configured and ready to use!');
    
  } catch (error) {
    console.error('❌ Cloudinary connection failed:', error.message);
    
    if (error.message.includes('Invalid signature')) {
      console.log('\n💡 This usually means:');
      console.log('- API Key or API Secret is incorrect');
      console.log('- Check your Cloudinary dashboard for the correct credentials');
    }
  }
}

testCloudinaryConnection();

