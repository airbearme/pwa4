import fetch from 'node-fetch';

async function testRegistration() {
  console.log('🧪 Testing AirBear Registration System...');

  // Test 1: Valid registration
  console.log('\n1️⃣ Testing valid registration...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123456!',
        role: 'user',
        fullName: 'Test User'
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('📋 User created:', {
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        role: data.user.role
      });
    } else {
      console.log('❌ Registration failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
  }

  // Test 2: Password validation
  console.log('\n2️⃣ Testing password validation...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test2@example.com',
        username: 'testuser2',
        password: 'short', // Too short
        role: 'user',
        fullName: 'Test User 2'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('✅ Password validation working:', data.message);
    } else {
      console.log('❌ Password validation failed - should have rejected short password');
    }
  } catch (error) {
    console.log('❌ Password validation error:', error.message);
  }

  // Test 3: Duplicate email
  console.log('\n3️⃣ Testing duplicate email handling...');
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com', // Same as first test
        username: 'testuser3',
        password: 'Test123456!',
        role: 'user',
        fullName: 'Test User 3'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('✅ Duplicate email handling working:', data.message);
    } else {
      console.log('❌ Duplicate email handling failed - should have rejected duplicate');
    }
  } catch (error) {
    console.log('❌ Duplicate email test error:', error.message);
  }

  console.log('\n🎉 Registration system test completed!');
}

testRegistration().catch(console.error);