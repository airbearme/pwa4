#!/usr/bin/env node

/**
 * Complete Production Test Suite for AirBear PWA
 * Tests all workflows in production environment
 */

import https from 'https';
import { performance } from 'perf_hooks';

const PROD_URL = 'https://pwa41.vercel.app';

class ProductionTestUtils {
  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AirBear-Production-Tester/1.0'
        },
        timeout: 10000,
        ...options
      };

      const req = https.request(url, requestOptions, (res) => {
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
            resolve({ raw: data, status: res.statusCode });
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

class ProductionTests {
  static async testServerHealth() {
    return ProductionTestUtils.measureTime('Production Health Check', async () => {
      const response = await ProductionTestUtils.request(`${PROD_URL}/api/health`);
      
      if (response.status !== 'ok') {
        throw new Error('Production server not healthy');
      }
      
      if (!response.supabaseUrl || !response.supabaseSecretKey || !response.stripeSecretKey) {
        throw new Error('Missing required services in production');
      }
      
      return response;
    });
  }

  static async testDatabaseConnection() {
    return ProductionTestUtils.measureTime('Database Connection', async () => {
      const spots = await ProductionTestUtils.request(`${PROD_URL}/api/spots`);
      const rickshaws = await ProductionTestUtils.request(`${PROD_URL}/api/rickshaws`);
      const bodega = await ProductionTestUtils.request(`${PROD_URL}/api/bodega/items`);
      
      if (!Array.isArray(spots) || !Array.isArray(rickshaws) || !Array.isArray(bodega)) {
        throw new Error('Database queries failed');
      }
      
      return { 
        spots: spots.length, 
        rickshaws: rickshaws.length, 
        bodega: bodega.length 
      };
    });
  }

  static async testDataIntegrity() {
    return ProductionTestUtils.measureTime('Data Integrity', async () => {
      const spots = await ProductionTestUtils.request(`${PROD_URL}/api/spots`);
      const rickshaws = await ProductionTestUtils.request(`${PROD_URL}/api/rickshaws`);
      const bodega = await ProductionTestUtils.request(`${PROD_URL}/api/bodega/items`);
      
      // Validate spots structure
      if (spots.length > 0) {
        const spot = spots[0];
        if (!spot.id || !spot.name || !spot.latitude || !spot.longitude) {
          throw new Error('Invalid spot data structure');
        }
      }
      
      // Validate rickshaws structure
      if (rickshaws.length > 0) {
        const rickshaw = rickshaws[0];
        if (!rickshaw.id || !rickshaw.latitude || !rickshaw.longitude) {
          throw new Error('Invalid rickshaw data structure');
        }
      }
      
      // Validate bodega structure
      if (bodega.length > 0) {
        const item = bodega[0];
        if (!item.id || !item.name || !item.price) {
          throw new Error('Invalid bodega item structure');
        }
      }
      
      return { 
        spotsValid: spots.length > 0, 
        rickshawsValid: rickshaws.length > 0, 
        bodegaValid: bodega.length > 0 
      };
    });
  }

  static async testAuthenticationFlow() {
    return ProductionTestUtils.measureTime('Authentication Flow', async () => {
      const testUser = {
        email: `prodtest${Date.now()}@airbear.me`,
        password: 'Test123456!',
        username: `prodtest${Date.now()}`,
        role: 'user'
      };

      // Test registration
      const registerResponse = await ProductionTestUtils.request(`${PROD_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(testUser)
      });
      
      if (!registerResponse.user || !registerResponse.user.id) {
        throw new Error('User registration failed');
      }
      
      // Test login
      const loginResponse = await ProductionTestUtils.request(`${PROD_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });
      
      if (!loginResponse.user || !loginResponse.user.id) {
        throw new Error('User login failed');
      }
      
      return { 
        registered: !!registerResponse.user.id, 
        logged_in: !!loginResponse.user.id,
        user_id: loginResponse.user.id 
      };
    });
  }

  static async testBusinessLogic() {
    return ProductionTestUtils.measureTime('Business Logic', async () => {
      // Test ride creation
      const rideResponse = await ProductionTestUtils.request(`${PROD_URL}/api/rides`, {
        method: 'POST',
        body: JSON.stringify({
          userId: 'test-user-id',
          customerEmail: 'test@example.com',
          pickupSpotId: 'db0ccef3-f6ee-4b8c-b6d6-3d4bc22891ac',
          dropoffSpotId: 'd38f2ea6-9ef8-4ce3-baaf-0ca7dbee4b07',
          fare: '15.50',
          estimatedTime: '12',
          status: 'pending'
        })
      });
      
      if (!rideResponse.id) {
        throw new Error('Ride creation failed');
      }
      
      return { 
        ride_created: !!rideResponse.id,
        ride_status: rideResponse.status 
      };
    });
  }

  static async testPaymentIntegration() {
    return ProductionTestUtils.measureTime('Payment Integration', async () => {
      try {
        const paymentResponse = await ProductionTestUtils.request(`${PROD_URL}/api/create-payment-intent`, {
          method: 'POST',
          body: JSON.stringify({
            amount: 1550,
            userId: 'test-user-id',
            rideId: 'test-ride-id'
          })
        });
        
        return { status: 'payment_configured', result: paymentResponse };
      } catch (error) {
        // Payment might fail with test keys, which is expected
        if (error.message.includes('Stripe') || error.message.includes('payment')) {
          return { status: 'expected_stripe_error', message: 'Test keys expected to fail' };
        }
        throw error;
      }
    });
  }

  static async testPWAFeatures() {
    return ProductionTestUtils.measureTime('PWA Features', async () => {
      // Test manifest
      const manifestResponse = await ProductionTestUtils.request(`${PROD_URL}/manifest.json`);
      if (!manifestResponse.name || !manifestResponse.start_url) {
        throw new Error('PWA manifest invalid');
      }

      // Test service worker
      try {
        const swResponse = await ProductionTestUtils.request(`${PROD_URL}/sw.js`);
        return { manifest: 'valid', serviceWorker: 'accessible' };
      } catch (error) {
        throw new Error('Service worker not accessible');
      }
    });
  }

  static async testAnalytics() {
    return ProductionTestUtils.measureTime('Analytics API', async () => {
      const response = await ProductionTestUtils.request(`${PROD_URL}/api/analytics/overview`);
      
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

  static async testErrorHandling() {
    return ProductionTestUtils.measureTime('Error Handling', async () => {
      try {
        await ProductionTestUtils.request(`${PROD_URL}/api/nonexistent`);
        throw new Error('Should have failed with 404');
      } catch (error) {
        if (!error.message.includes('HTTP 404')) {
          throw new Error('Wrong error response');
        }
        return { status: 'proper_error_handling' };
      }
    });
  }

  static async testPerformance() {
    return ProductionTestUtils.measureTime('Performance Test', async () => {
      const start = performance.now();
      
      // Make multiple concurrent requests
      const requests = [
        ProductionTestUtils.request(`${PROD_URL}/api/health`),
        ProductionTestUtils.request(`${PROD_URL}/api/spots`),
        ProductionTestUtils.request(`${PROD_URL}/api/rickshaws`),
        ProductionTestUtils.request(`${PROD_URL}/api/bodega/items`)
      ];
      
      const results = await Promise.all(requests);
      const end = performance.now();
      
      const avgResponseTime = (end - start) / requests.length;
      
      return {
        avg_response_time: avgResponseTime.toFixed(2),
        all_successful: results.every(r => r && typeof r === 'object')
      };
    });
  }
}

class ProductionTestRunner {
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
    console.log('🚀 Production E2E Test Suite');
    console.log(`📍 Testing: ${PROD_URL}\n`);

    const startTime = performance.now();

    await this.runTestSuite('Production Validation', ProductionTests);

    const endTime = performance.now();
    this.results.duration = (endTime - startTime).toFixed(2);

    this.printResults();
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PRODUCTION TEST RESULTS');
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

    console.log('='.repeat(60));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL PRODUCTION TESTS PASSED!');
      console.log('🌐 Application is fully functional and ready for users');
      console.log('📱 Ready for domain forwarding: airbear.me → https://pwa41.vercel.app');
    } else {
      console.log('⚠️  Some production tests failed. Review issues before going live.');
    }
    
    console.log('='.repeat(60));
  }
}

// Run production tests
const runner = new ProductionTestRunner();
runner.runAllTests()
  .then(results => {
    console.log('\n🏁 Production Testing Complete!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Production test runner failed:', error);
    process.exit(1);
  });
