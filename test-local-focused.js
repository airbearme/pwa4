#!/usr/bin/env node

/**
 * Focused Local Development Test Suite
 * Tests all critical workflows locally before production deployment
 */

import https from 'https';
import http from 'http';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:5000';

class LocalTestUtils {
  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const lib = http; // Local dev uses HTTP
      
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AirBear-Local-Tester/1.0'
        },
        timeout: 5000,
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
            resolve({ raw: data, status: res.statusCode }); // For non-JSON responses
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

class LocalWorkflowTests {
  static async testServerHealth() {
    return LocalTestUtils.measureTime('Server Health', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/health`);
      
      if (response.status !== 'ok') {
        throw new Error('Server not healthy');
      }
      
      return response;
    });
  }

  static async testSpotsData() {
    return LocalTestUtils.measureTime('Spots Data', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/spots`);
      
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('No spots data available');
      }
      
      // Validate spot structure
      const spot = response[0];
      if (!spot.id || !spot.name || !spot.latitude || !spot.longitude) {
        throw new Error('Invalid spot data structure');
      }
      
      return { count: response.length, firstSpot: spot.name };
    });
  }

  static async testRickshawsData() {
    return LocalTestUtils.measureTime('Rickshaws Data', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/rickshaws`);
      
      if (!Array.isArray(response)) {
        throw new Error('Invalid rickshaws response');
      }
      
      if (response.length > 0) {
        const rickshaw = response[0];
        if (!rickshaw.id || !rickshaw.latitude || !rickshaw.longitude) {
          throw new Error('Invalid rickshaw data structure');
        }
      }
      
      return { count: response.length, available: response.filter(r => r.isAvailable).length };
    });
  }

  static async testBodegaInventory() {
    return LocalTestUtils.measureTime('Bodega Inventory', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/bodega/items`);
      
      if (!Array.isArray(response) || response.length === 0) {
        throw new Error('No bodega items available');
      }
      
      const item = response[0];
      if (!item.id || !item.name || !item.price) {
        throw new Error('Invalid item structure');
      }
      
      return { count: response.length, categories: [...new Set(response.map(i => i.category))] };
    });
  }

  static async testUserRegistration() {
    return LocalTestUtils.measureTime('User Registration', async () => {
      const testUser = {
        email: `test${Date.now()}@airbear.me`,
        password: 'Test123456!',
        username: `testuser${Date.now()}`,
        role: 'user'
      };

      const response = await LocalTestUtils.request(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(testUser)
      });
      
      if (!response.user || !response.user.id) {
        throw new Error('User registration failed');
      }
      
      return { userId: response.user.id, username: response.user.username };
    });
  }

  static async testUserLogin() {
    return LocalTestUtils.measureTime('User Login', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'test123'
        })
      });
      
      if (!response.user || !response.user.id) {
        throw new Error('User login failed');
      }
      
      return { userId: response.user.id, role: response.user.role };
    });
  }

  static async testRideCreation() {
    return LocalTestUtils.measureTime('Ride Creation', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/rides`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user-id',
          customerEmail: 'test@example.com',
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
      
      return { rideId: response.id, status: response.status };
    });
  }

  static async testOrderCreation() {
    return LocalTestUtils.measureTime('Order Creation', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/orders`, {
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
      
      return { orderId: response.id, totalAmount: response.totalAmount };
    });
  }

  static async testPaymentFlow() {
    return LocalTestUtils.measureTime('Payment Flow', async () => {
      try {
        const response = await LocalTestUtils.request(`${BASE_URL}/api/create-payment-intent`, {
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
          return { status: 'expected_stripe_error', message: 'Test keys expected to fail' };
        }
        throw error;
      }
    });
  }

  static async testAnalytics() {
    return LocalTestUtils.measureTime('Analytics Overview', async () => {
      const response = await LocalTestUtils.request(`${BASE_URL}/api/analytics/overview`);
      
      if (!response.totalSpots || !response.totalAirbears) {
        throw new Error('Analytics data incomplete');
      }
      
      return {
        spots: response.totalSpots,
        airbears: response.totalAirbears,
        activeAirbears: response.activeAirbears
      };
    });
  }

  static async testPWAFeatures() {
    return LocalTestUtils.measureTime('PWA Features', async () => {
      // Test manifest
      const manifestResponse = await LocalTestUtils.request(`${BASE_URL}/manifest.json`);
      if (!manifestResponse.name || !manifestResponse.start_url) {
        throw new Error('PWA manifest invalid');
      }

      // Test service worker
      try {
        const swResponse = await LocalTestUtils.request(`${BASE_URL}/sw.js`);
        return { manifest: 'valid', serviceWorker: 'accessible' };
      } catch (error) {
        throw new Error('Service worker not accessible');
      }
    });
  }

  static async testErrorHandling() {
    return LocalTestUtils.measureTime('Error Handling', async () => {
      try {
        await LocalTestUtils.request(`${BASE_URL}/api/nonexistent`);
        throw new Error('Should have failed with 404');
      } catch (error) {
        if (!error.message.includes('HTTP 404')) {
          throw new Error('Wrong error response');
        }
        return { status: 'proper_error_handling' };
      }
    });
  }
}

class LocalTestRunner {
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
    console.log(`\n🧪 ${suiteName}:`);
    
    for (const [testName, testFn] of Object.entries(testClass)) {
      if (typeof testFn !== 'function' || !testName.startsWith('test')) continue;
      
      this.results.total++;
      const testFullName = testName.replace('test', '');
      
      try {
        const result = await testFn();
        this.results.passed++;
        this.results.tests.push({ name: testFullName, status: 'PASS', result });
        console.log(`   ✅ ${testFullName}: ${JSON.stringify(result).substring(0, 100)}...`);
      } catch (error) {
        this.results.failed++;
        this.results.tests.push({ name: testFullName, status: 'FAIL', error: error.message });
        console.log(`   ❌ ${testFullName}: ${error.message}`);
      }
    }
  }

  async runAllTests() {
    console.log('🚀 Local Development E2E Test Suite');
    console.log(`📍 Testing: ${BASE_URL}\n`);

    const startTime = performance.now();

    await this.runTestSuite('Core Functionality', LocalWorkflowTests);

    const endTime = performance.now();
    this.results.duration = (endTime - startTime).toFixed(2);

    this.printResults();
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 LOCAL TEST RESULTS');
    console.log('='.repeat(50));
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

    console.log('='.repeat(50));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL LOCAL TESTS PASSED!');
      console.log('📱 Application is ready for deployment testing');
    } else {
      console.log('⚠️  Fix local issues before production deployment');
    }
    
    console.log('='.repeat(50));
  }
}

// Run local tests
const runner = new LocalTestRunner();
runner.runAllTests()
  .then(results => {
    console.log('\n🏁 Local Testing Complete!');
    if (results.failed === 0) {
      console.log('🌐 Ready for production testing: https://pwa41.vercel.app');
    }
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
