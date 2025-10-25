// Simple test script to verify API endpoints work
// Run with: node test-api.js

const BASE_URL = 'http://localhost:3000'; // Change to your Vercel URL for production

async function testAPI() {
  console.log('Testing Blanc API endpoints...\n');

  // Test 1: Create session
  console.log('1. Creating session...');
  const sessionId = `test_session_${Date.now()}`;
  const createResponse = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId, creator: '0x1234567890123456789012345678901234567890' })
  });
  
  if (createResponse.ok) {
    console.log('✅ Session created successfully');
  } else {
    console.log('❌ Failed to create session');
    return;
  }

  // Test 2: Add participant
  console.log('2. Adding participant...');
  const addResponse = await fetch(`${BASE_URL}/api/sessions/${sessionId}/participants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ participant: '0x0987654321098765432109876543210987654321' })
  });
  
  if (addResponse.ok) {
    const data = await addResponse.json();
    console.log('✅ Participant added:', data.participants);
  } else {
    console.log('❌ Failed to add participant');
    return;
  }

  // Test 3: Get session
  console.log('3. Getting session data...');
  const getResponse = await fetch(`${BASE_URL}/api/sessions?sessionId=${sessionId}`);
  
  if (getResponse.ok) {
    const session = await getResponse.json();
    console.log('✅ Session data:', session);
  } else {
    console.log('❌ Failed to get session');
  }

  console.log('\n🎉 All tests passed! API is working correctly.');
}

testAPI().catch(console.error);
