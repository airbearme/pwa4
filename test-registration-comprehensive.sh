#!/bin/bash

echo "🧪 Comprehensive AirBear Registration System Test..."

# Test 1: Valid registration
echo -e "\n1️⃣ Testing valid registration..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "Test123456!",
    "role": "user",
    "fullName": "New User"
  }')

echo "Response: $RESPONSE"

# Test 2: Duplicate email
echo -e "\n2️⃣ Testing duplicate email handling..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "username": "newuser2",
    "password": "Test123456!",
    "role": "user",
    "fullName": "New User 2"
  }')

echo "Response: $RESPONSE"

# Test 3: Duplicate username
echo -e "\n3️⃣ Testing duplicate username handling..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser2@example.com",
    "username": "newuser",
    "password": "Test123456!",
    "role": "user",
    "fullName": "New User 3"
  }')

echo "Response: $RESPONSE"

# Test 4: Password too short
echo -e "\n4️⃣ Testing password validation (too short)..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser3@example.com",
    "username": "newuser3",
    "password": "short",
    "role": "user",
    "fullName": "New User 4"
  }')

echo "Response: $RESPONSE"

# Test 5: Invalid email
echo -e "\n5️⃣ Testing email validation..."
RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "username": "newuser4",
    "password": "Test123456!",
    "role": "user",
    "fullName": "New User 5"
  }')

echo "Response: $RESPONSE"

echo -e "\n🎉 Comprehensive registration system test completed!"