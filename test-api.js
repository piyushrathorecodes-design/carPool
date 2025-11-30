// Simple API test script
const axios = require('axios');

async function testAPI() {
  console.log('Testing Campus Cab Pool API...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', healthResponse.data.message);
    
    // Test root endpoint
    console.log('\n2. Testing root endpoint...');
    const rootResponse = await axios.get('http://localhost:5000/');
    console.log('✅ Root endpoint accessible:', rootResponse.data.message);
    
    // Test auth endpoints (should return 404 for GET, but connection should work)
    console.log('\n3. Testing auth endpoints...');
    try {
      await axios.get('http://localhost:5000/api/auth/register');
      console.log('⚠️  Auth register endpoint accessible (expected 404 for GET)');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Auth register endpoint accessible (returned expected 404 for GET)');
      } else {
        throw error;
      }
    }
    
    console.log('\n🎉 All API connectivity tests passed!');
    console.log('\nNext steps:');
    console.log('1. Make sure both frontend and backend servers are running');
    console.log('2. Visit http://localhost:5173 in your browser');
    console.log('3. Try creating an account');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure the backend server is running on port 5000');
    console.log('2. Check that MongoDB is accessible');
    console.log('3. Verify your network connection');
  }
}

testAPI();