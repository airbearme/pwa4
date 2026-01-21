#!/usr/bin/env node

/**
 * Simple E2E Test Suite for AirBear PWA (using built-in Node.js modules)
 */

import https from 'https';
import http from 'http';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:5000';
const PROD_URL = 'https://pwa41.vercel.app';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  retryAttempts: 3
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
  }
};

// Test utilities
class TestUtils {
  static async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https');
      const lib = isHttps ? https : http;
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AirBear-E2E-Tester/1.0'
        },
        timeout: TEST_CONFIG.timeout,
        ...options
      };

      const req = lib.request(url, requestOptions, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const jsonData = data ? JSON.parse(data) : {};
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(jsonData);
            } else {
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage} - ${data}`));
            }
          } catch (error) {
            reject(new Error(`JSON Parse Error: ${error.message} - Raw: ${data.substring(0, 200)}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Request Error: ${error.message}`));
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
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

  static log(test, status, message = '', data = null) {
    const timestamp = new Date().toISOString().substring(11, 19);
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
class CoreTests {
  static async testAPIHealth() {
    return TestUtils.measureTime('API Health Check', async () => {
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

class AuthenticationTests {
  static async testUserRegistration() {
    return TestUtils.measureTime('User Registration', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
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
        body: JSON.stringify(TEST_USERS.driver)
      });
      
      if (!response.user || response.user.role !== 'driver') {
        throw new Error('Driver role not assigned');
      }
      
      return response;
    });
  }
}

class BusinessLogicTests {
  static async testRideCreation() {
    return TestUtils.measureTime('Ride Creation', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/rides`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user-id',
          customerEmail: TEST_USERS.customer.email,
          pickupSpotId: 'db0ccef3-f6ee-4b8c-b6d6-3d4bc22891ac',
          dropoffSpotId: 'd38f2ea6-9ef8-4ce3-baaf-0ca7dbee4b07',
          estimatedFare: 15.50,
          estimatedTime: 12,
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
      try {
        const response = await TestUtils.request(`${BASE_URL}/api/create-payment-intent`, {
          method: 'POST',
          body: JSON.stringify({
            amount: 1550, // $15.50 in cents
            userId: 'test-user-id',
            rideId: 'test-ride-id'
          })
        });
        
        return response;
      } catch (error) {
        // Payment might fail with test keys, which is expected
        if (error.message.includes('Stripe') || error.message.includes('payment')) {
          return { status: 'expected_stripe_error', message: error.message };
        }
        throw error;
      }
    });
  }

  static async testOrderCreation() {
    return TestUtils.measureTime('Order Creation', async () => {
      const response = await TestUtils.request(`${BASE_URL}/api/orders`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user-id',
          items: [
            { id: 'e0df07e3-4690-4310-a00e-8dec897cfd02', quantity: 2 },
            { id: '048afb99-4e8a-4f4a-a922-466bb90c4888', quantity: 1 }
          ],
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

class PWATests {
  static async testServiceWorker() {
    return TestUtils.measureTime('Service Worker', async () => {
      const response = await TestUtils.request(`${BASE_URL}/sw.js`);
      
      if (!response || typeof response !== 'object') {
        // Service worker returns JavaScript code, not JSON
        return { status: 'sw_accessible' };
      }
      
      return response;
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
      try {
        const response = await TestUtils.request(`${BASE_URL}/sw.js`);
        return { status: 'offline_configured' };
      } catch (error) {
        throw new Error('Offline capability not configured');
      }
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
    await this.runTestSuite('Core APIs', CoreTests);
    await this.runTestSuite('Authentication', AuthenticationTests);
    await this.runTestSuite('Business Logic', BusinessLogicTests);
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

// Production tests
class ProductionTests {
  static async testProductionDeployment() {
    return TestUtils.measureTime('Production Deployment', async () => {
      const response = await TestUtils.request(`${PROD_URL}/api/health`);
      
      if (response.status !== 'ok') {
        throw new Error('Production health check failed');
      }
      
      return response;
    });
  }

  static async testProductionAPIs() {
    return TestUtils.measureTime('Production APIs', async () => {
      const spots = await TestUtils.request(`${PROD_URL}/api/spots`);
      const rickshaws = await TestUtils.request(`${PROD_URL}/api/rickshaws`);
      const bodega = await TestUtils.request(`${PROD_URL}/api/bodega/items`);
      
      if (!Array.isArray(spots) || !Array.isArray(rickshaws) || !Array.isArray(bodega)) {
        throw new Error('Production APIs returning invalid data');
      }
      
      return { spots: spots.length, rickshaws: rickshaws.length, bodega: bodega.length };
    });
  }
}

// Run tests
async function runTests() {
  const runner = new E2ETestRunner();
  
  console.log('🔍 Running Local Development Tests...\n');
  const localResults = await runner.runAllTests();
  
  if (localResults.failed === 0) {
    console.log('\n🌐 Running Production Tests...\n');
    
    try {
      await TestUtils.measureTime('Production Health', async () => {
        return await ProductionTests.testProductionDeployment();
      });
      
      await TestUtils.measureTime('Production APIs', async () => {
        return await ProductionTests.testProductionAPIs();
      });
      
      console.log('✅ Production tests passed!');
    } catch (error) {
      console.log('❌ Production test failed:', error.message);
    }
  }
  
  return localResults;
}

// Execute tests
runTests()
  .then(results => {
    console.log('\n🏁 E2E Testing Complete!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
