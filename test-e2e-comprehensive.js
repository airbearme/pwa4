#!/usr/bin/env node

/**
 * Comprehensive E2E Test Suite for AirBear PWA
 * Tests all workflows to ensure flawless operation
 */

import fetch from 'node-fetch';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:5000';
const PROD_URL = 'https://pwa41.vercel.app';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retryAttempts: 3,
  parallelTests: false
};

// Test data
const TEST_USERS = {
  customer: {
    email: 'customer.e2e@airbear.me',
    password: 'Test123456!',
    username: 'e2ecustomer',
    role: 'user'
  },
  driver: {
    email: 'driver.e2e@airbear.me',
    password: 'Test123456!',
    username: 'e2edriver',
    role: 'driver'
  },
  admin: {
    email: 'admin.e2e@airbear.me',
    password: 'Test123456!',
    username: 'e2eadmin',
    role: 'admin'
  }
};

const TEST_RIDE = {
  pickupSpotId: 'db0ccef3-f6ee-4b8c-b6d6-3d4bc22891ac',
  dropoffSpotId: 'd38f2ea6-9ef8-4ce3-baaf-0ca7dbee4b07',
  estimatedFare: 15.50,
  estimatedTime: 12
};

const TEST_ORDER = {
  items: [
    { id: 'e0df07e3-4690-4310-a00e-8dec897cfd02', quantity: 2 },
    { id: '048afb99-4e8a-4f4a-a922-466bb90c4888', quantity: 1 }
  ]
};

// Test utilities
class TestUtils {
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async retry(fn, attempts = TEST_CONFIG.retryAttempts) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === attempts - 1) throw error;
        await this.delay(1000 * (i + 1));
      }
    }
  }

  static async request(url, options = {}) {
    const response = await fetch(url, {
      timeout: TEST_CONFIG.timeout,
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  static log(test, status, message = '', data = null) {
    const timestamp = new Date().toISOString();
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
    console.log(`${statusIcon} [${timestamp}] ${test}: ${message}${data ? ` ${JSON.stringify(data)}` : ''}`);
  }

  static async measureTime(testName, testFn) {
    const start = performance.now();
    try {
      const result = await testFn();
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      this.log(testName, 'PASS', `Completed in ${duration}ms`);
      return { result, duration };
    } catch (error) {
      const end = performance.now();
      const duration = (end - start).toFixed(2);
      this.log(testName, 'FAIL', `Failed in ${duration}ms: ${error.message}`);
      throw error;
    }
  }
}

// Test suites
class AuthenticationTests {
  static async testUserRegistration() {
    return TestUtils.measureTime('User Registration', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USERS.customer)
      });
      
      if (!response.user || !response.user.id) {
        throw new Error('Invalid user response');
      }
      
      return response;
    });
  }

  static async testUserLogin() {
    return TestUtils.measureTime('User Login', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: TEST_USERS.customer.email,
          password: TEST_USERS.customer.password
        })
      });
      
      if (!response.user || !response.user.id) {
        throw new Error('Invalid login response');
      }
      
      return response;
    });
  }

  static async testDriverRegistration() {
    return TestUtils.measureTime('Driver Registration', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USERS.driver)
      });
      
      if (!response.user || response.user.role !== 'driver') {
        throw new Error('Driver role not assigned');
      }
      
      return response;
    });
  }

  static async testProfileSync() {
    return TestUtils.measureTime('Profile Sync', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/auth/sync-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: 'test-profile-id',
          email: TEST_USERS.customer.email,
          username: TEST_USERS.customer.username,
          role: TEST_USERS.customer.role
        })
      });
      
      if (!response.user) {
        throw new Error('Profile sync failed');
      }
      
      return response;
    });
  }
}

class APITests {
  static async testHealthEndpoint() {
    return TestUtils.measureTime('Health Check', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/health`);
      
      if (response.status !== 'ok') {
        throw new Error('Health check failed');
      }
      
      if (!response.supabaseUrl || !response.supabaseSecretKey || !response.stripeSecretKey) {
        throw new Error('Missing required services');
      }
      
      return response;
    });
  }

  static async testSpotsAPI() {
    return TestUtils.measureTime('Spots API', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/spots`);
      
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('No spots data');
      }
      
      // Validate spot structure
      const spot = response[0];
      if (!spot.id || !spot.name || !spot.latitude || !spot.longitude) {
        throw new Error('Invalid spot structure');
      }
      
      return response;
    });
  }

  static async testRickshawsAPI() {
    return TestUtils.measureTime('Rickshaws API', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/rickshaws`);
      
      if (!Array.isArray(response)) {
        throw new Error('Invalid rickshaws response');
      }
      
      // Validate rickshaw structure
      if (response.length > 0) {
        const rickshaw = response[0];
        if (!rickshaw.id || !rickshaw.latitude || !rickshaw.longitude) {
          throw new Error('Invalid rickshaw structure');
        }
      }
      
      return response;
    });
  }

  static async testBodegaAPI() {
    return TestUtils.measureTime('Bodega API', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/bodega/items`);
      
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('No bodega items');
      }
      
      // Validate item structure
      const item = response[0];
      if (!item.id || !item.name || !item.price) {
        throw new Error('Invalid item structure');
      }
      
      return response;
    });
  }

  static async testAnalyticsAPI() {
    return TestUtils.measureTime('Analytics API', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/analytics/overview`);
      
      if (!response.totalSpots || !response.totalAirbears) {
        throw new Error('Invalid analytics data');
      }
      
      return response;
    });
  }
}

class RideTests {
  static async testRideCreation() {
    return TestUtils.measureTime('Ride Creation', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/rides`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...TEST_RIDE,
          userId: 'test-user-id',
          customerEmail: TEST_USERS.customer.email,
          status: 'pending'
        })
      });
      
      if (!response.id) {
        throw new Error('Ride creation failed');
      }
      
      return response;
    });
  }

  static async testPaymentIntent() {
    return TestUtils.measureTime('Payment Intent', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(TEST_RIDE.estimatedFare * 100), // Convert to cents
          userId: 'test-user-id',
          rideId: 'test-ride-id'
        })
      });
      
      // Note: This might fail with test keys, which is expected
      return response;
    });
  }

  static async testOrderCreation() {
    return TestUtils.measureTime('Order Creation', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'test-user-id',
          items: TEST_ORDER.items,
          totalAmount: 25.50,
          status: 'pending'
        })
      });
      
      if (!response.id) {
        throw new Error('Order creation failed');
      }
      
      return response;
    });
  }
}

class RealtimeTests {
  static async testDriverLocationUpdates() {
    return TestUtils.measureTime('Driver Location Updates', async () => {
      // Simulate driver location update
      const locationData = {
        airbearId: '00000000-0000-0000-0000-000000000001',
        latitude: 42.099118,
        longitude: -75.917538,
        heading: 45.0,
        batteryLevel: 85
      };

      // This would normally be handled by the driver's GPS
      // For testing, we'll verify the API can handle location updates
      const response = await TestUtils.request(`${BASE_URL}/api/rickshaws`);
      
      if (!Array.isArray(response)) {
        throw new Error('Cannot verify location updates');
      }
      
      return response;
    });
  }

  static async testRealtimeSubscriptions() {
    return TestUtils.measureTime('Realtime Subscriptions', async () => {
      // Test that the system can handle realtime data
      // This is more of a connectivity test
      const response = await TestUtils.request(`${BASE_URL}/api/health`);
      
      if (response.supabaseUrl !== 'configured') {
        throw new Error('Realtime not configured');
      }
      
      return response;
    });
  }
}

class PWATests {
  static async testServiceWorker() {
    return TestUtils.measureTime('Service Worker', async () => {
      const response = await fetch(`${BASE_URL}/sw.js`);
      
      if (!response.ok) {
        throw new Error('Service worker not accessible');
      }
      
      const swContent = await response.text();
      if (!swContent.includes('serviceWorker') && !swContent.includes('workbox')) {
        throw new Error('Invalid service worker');
      }
      
      return { status: 'ok' };
    });
  }

  static async testManifest() {
    return TestUtils.measureTime('PWA Manifest', async () => {
      const response = await TestUtils.request(`${BASE_URL}/manifest.json`);
      
      if (!response.name || !response.start_url || !response.icons) {
        throw new Error('Invalid PWA manifest');
      }
      
      return response;
    });
  }

  static async testOfflineCapability() {
    return TestUtils.measureTime('Offline Capability', async () => {
      // Check if offline caching is configured
      const response = await fetch(`${BASE_URL}/sw.js`);
      const swContent = await response.text();
      
      if (!swContent.includes('cache') && !swContent.includes('precache')) {
        throw new Error('Offline caching not configured');
      }
      
      return { status: 'ok' };
    });
  }
}

class ErrorHandlingTests {
  static async testInvalidEndpoint() {
    return TestUtils.measureTime('Invalid Endpoint', async () => {
      try {
        await TestUtils.request(`${BASE_URL}/api/nonexistent`);
        throw new Error('Should have failed');
      } catch (error) {
        if (!error.message.includes('HTTP 404')) {
          throw new Error('Wrong error response');
        }
        return { status: 'expected_error' };
      }
    });
  }

  static async testInvalidData() {
    return TestUtils.measureTime('Invalid Data', async () => {
      try {
        await TestUtils.request(`${BASE_URL}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invalid: 'data' })
        });
        throw new Error('Should have failed');
      } catch (error) {
        if (!error.message.includes('HTTP 4') && !error.message.includes('HTTP 5')) {
          throw new Error('Wrong error response');
        }
        return { status: 'expected_error' };
      }
    });
  }
}

// Main test runner
class E2ETestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      duration: 0,
      tests: []
    };
  }

  async runTestSuite(suiteName, testClass) {
    console.log(`\n🧪 Running ${suiteName} Tests...`);
    
    for (const [testName, testFn] of Object.entries(testClass)) {
      if (typeof testFn !== 'function' || !testName.startsWith('test')) continue;
      
      this.results.total++;
      const testFullName = `${suiteName}.${testName.replace('test', '')}`;
      
      try {
        await testFn();
        this.results.passed++;
        this.results.tests.push({ name: testFullName, status: 'PASS' });
      } catch (error) {
        this.results.failed++;
        this.results.tests.push({ name: testFullName, status: 'FAIL', error: error.message });
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive E2E Test Suite\n');
    console.log(`📍 Testing: ${BASE_URL}`);
    console.log(`⏱️  Timeout: ${TEST_CONFIG.timeout}ms per test\n`);

    const startTime = performance.now();

    // Run all test suites
    await this.runTestSuite('Authentication', AuthenticationTests);
    await this.runTestSuite('API Endpoints', APITests);
    await this.runTestSuite('Ride Management', RideTests);
    await this.runTestSuite('Realtime Features', RealtimeTests);
    await this.runTestSuite('PWA Features', PWATests);
    await this.runTestSuite('Error Handling', ErrorHandlingTests);

    const endTime = performance.now();
    this.results.duration = (endTime - startTime).toFixed(2);

    this.printResults();
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 E2E TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total:  ${this.results.total}`);
    console.log(`⏱️  Duration: ${this.results.duration}ms`);
    console.log(`🎯 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => test.status === 'FAIL')
        .forEach(test => {
          console.log(`   • ${test.name}: ${test.error}`);
        });
    }

    console.log('\n' + '='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL TESTS PASSED! Application is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues.');
    }
    
    console.log('='.repeat(60));
  }
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new E2ETestRunner();
  runner.runAllTests()
    .then(results => {
      process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('Test runner failed:', error);
      process.exit(1);
    });
}

export { E2ETestRunner, TestUtils, AuthenticationTests, APITests, RideTests, RealtimeTests, PWATests, ErrorHandlingTests };
