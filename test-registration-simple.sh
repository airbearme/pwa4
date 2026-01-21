#!/bin/bash

echo "🧪 Testing AirBear Registration System..."

# Test 1: Valid registration
echo -e "\n1️⃣ Testing valid registration..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456!",
    "role": "user",
    "fullName": "Test User"
  }')

echo "Response: $RESPONSE"

# Test 2: Password validation (too short)
echo -e "\n2️⃣ Testing password validation..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test2@example.com",
    "username": "testuser2",
    "password": "short",
    "role": "user",
    "fullName": "Test User 2"
  }')

echo "Response: $RESPONSE"

# Test 3: Duplicate email
echo -e "\n3️⃣ Testing duplicate email handling..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser3",
    "password": "Test123456!",
    "role": "user",
    "fullName": "Test User 3"
  }')

echo "Response: $RESPONSE"

echo -e "\n🎉 Registration system test completed!"