#!/usr/bin/env node

/**
 * Final E2E Test Suite for AirBear PWA Production
 * Tests all workflows with 17 locations
 */

import https from 'https';
import { performance } from 'perf_hooks';

const PROD_URL = 'https://pwa41.vercel.app';

class FinalE2ETestUtils {
  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AirBear-Final-E2E-Tester/1.0'
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

class FinalE2ETests {
  static async testProductionHealth() {
    return FinalE2ETestUtils.measureTime('Production Health Check', async () => {
      const response = await FinalE2ETestUtils.request(`${PROD_URL}/api/health`);
      
      if (response.status !== 'ok') {
        throw new Error('Production server not healthy');
      }
      
      return response;
    });
  }

  static async testAllLocations() {
    return FinalE2ETestUtils.measureTime('All 17 Locations', async () => {
      const spots = await FinalE2ETestUtils.request(`${PROD_URL}/api/spots`);
      
      if (!Array.isArray(spots) || spots.length !== 17) {
        throw new Error(`Expected 17 spots, got ${spots.length}`);
      }
      
      // Validate structure
      const spot = spots[0];
      if (!spot.id || !spot.name || !spot.latitude || !spot.longitude || !spot.description || !spot.amenities) {
        throw new Error('Invalid spot structure');
      }
      
      return { 
        count: spots.length, 
        hasDescriptions: spots.every(s => s.description),
        hasAmenities: spots.every(s => s.amenities && Array.isArray(s.amenities)),
        sampleSpot: spots[0].name 
      };
    });
  }

  static async testLocationCategories() {
    return FinalE2ETestUtils.measureTime('Location Categories', async () => {
      const spots = await FinalE2ETestUtils.request(`${PROD_URL}/api/spots`);
      
      const categories = {
        downtown: spots.filter(s => s.name.toLowerCase().includes('downtown') || s.name.toLowerCase().includes('court')),
        university: spots.filter(s => s.name.toLowerCase().includes('bu') || s.name.toLowerCase().includes('binghamton')),
        parks: spots.filter(s => s.name.toLowerCase().includes('park') || s.name.toLowerCase().includes('greenway')),
        medical: spots.filter(s => s.name.toLowerCase().includes('hospital')),
        commercial: spots.filter(s => s.name.toLowerCase().includes('center') || s.name.toLowerCase().includes('vestal'))
      };
      
      return categories;
    });
  }

  static async testAirbears() {
    return FinalE2ETestUtils.measureTime('AirBears Data', async () => {
      const airbears = await FinalE2ETestUtils.request(`${PROD_URL}/api/rickshaws`);
      
      if (!Array.isArray(airbears)) {
        throw new Error('Invalid airbears response');
      }
      
      if (airbears.length > 0) {
        const airbear = airbears[0];
        if (!airbear.id || !airbear.latitude || !airbear.longitude || !airbear.battery_level) {
          throw new Error('Invalid airbear structure');
        }
      }
      
      return { 
        count: airbears.length, 
        available: airbears.filter(a => a.is_available).length,
        avgBattery: airbears.length > 0 ? airbears.reduce((sum, a) => sum + a.battery_level, 0) / airbears.length : 0
      };
    });
  }

  static async testBodegaInventory() {
    return FinalE2ETestUtils.measureTime('Bodega Inventory', async () => {
      const items = await FinalE2ETestUtils.request(`${PROD_URL}/api/bodega/items`);
      
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('No bodega items available');
      }
      
      const categories = [...new Set(items.map(i => i.category))];
      const ecoFriendly = items.filter(i => i.is_eco_friendly).length;
      
      return { 
        count: items.length, 
        categories,
        ecoFriendly,
        inStock: items.filter(i => i.is_available && i.stock > 0).length
      };
    });
  }

  static async testMapFunctionality() {
    return FinalE2ETestUtils.measureTime('Map Functionality', async () => {
      const spots = await FinalE2ETestUtils.request(`${PROD_URL}/api/spots`);
      const airbears = await FinalE2ETestUtils.request(`${PROD_URL}/api/rickshaws`);
      
      // Test coordinate validity
      const validCoordinates = spots.every(spot => 
        spot.latitude >= -90 && spot.latitude <= 90 &&
        spot.longitude >= -180 && spot.longitude <= 180
      );
      
      if (!validCoordinates) {
        throw new Error('Invalid coordinates found');
      }
      
      return {
        spotsWithValidCoords: spots.length,
        airbearsWithValidCoords: airbears.every(a => 
          a.latitude >= -90 && a.latitude <= 90 &&
          a.longitude >= -180 && a.longitude <= 180
        )
      };
    });
  }

  static async testAnalytics() {
    return FinalE2ETestUtils.measureTime('Analytics Overview', async () => {
      const response = await FinalE2ETestUtils.request(`${PROD_URL}/api/analytics/overview`);
      
      if (!response.totalSpots || !response.totalAirbears) {
        throw new Error('Analytics data incomplete');
      }
      
      return response;
    });
  }

  static async testPWAFeatures() {
    return FinalE2ETestUtils.measureTime('PWA Features', async () => {
      // Test manifest
      const manifestResponse = await FinalE2ETestUtils.request(`${PROD_URL}/manifest.json`);
      if (!manifestResponse.name || !manifestResponse.start_url) {
        throw new Error('PWA manifest invalid');
      }

      // Test service worker
      try {
        const swResponse = await FinalE2ETestUtils.request(`${PROD_URL}/sw.js`);
        return { 
          manifest: 'valid', 
          serviceWorker: 'accessible',
          appName: manifestResponse.name
        };
      } catch (error) {
        throw new Error('Service worker not accessible');
      }
    });
  }

  static async testPerformance() {
    return FinalE2ETestUtils.measureTime('Performance Test', async () => {
      const start = performance.now();
      
      // Make multiple concurrent requests
      const requests = [
        FinalE2ETestUtils.request(`${PROD_URL}/api/health`),
        FinalE2ETestUtils.request(`${PROD_URL}/api/spots`),
        FinalE2ETestUtils.request(`${PROD_URL}/api/rickshaws`),
        FinalE2ETestUtils.request(`${PROD_URL}/api/bodega/items`)
      ];
      
      const results = await Promise.all(requests);
      const end = performance.now();
      
      const avgResponseTime = (end - start) / requests.length;
      
      return {
        avg_response_time: avgResponseTime.toFixed(2),
        all_successful: results.every(r => r && typeof r === 'object'),
        total_requests: requests.length
      };
    });
  }
}

class FinalE2ERunner {
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
    console.log('🚀 Final E2E Test Suite - Production Ready');
    console.log(`📍 Testing: ${PROD_URL}\n`);

    const startTime = performance.now();

    await this.runTestSuite('Production Validation', FinalE2ETests);

    const endTime = performance.now();
    this.results.duration = (endTime - startTime).toFixed(2);

    this.printResults();
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL E2E TEST RESULTS');
    console.log('='.repeat(70));
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

    console.log('='.repeat(70));
    
    if (this.results.failed === 0) {
      console.log('🎉 ALL PRODUCTION TESTS PASSED!');
      console.log('🌐 Application is FULLY FUNCTIONAL with 17 locations');
      console.log('📱 Ready for domain forwarding: airbear.me → https://pwa41.vercel.app');
      console.log('🚀 All workflows validated and ready for users');
    } else {
      console.log('⚠️  Some tests failed. Review issues before going live.');
    }
    
    console.log('='.repeat(70));
  }
}

// Run final E2E tests
const runner = new FinalE2ERunner();
runner.runAllTests()
  .then(results => {
    console.log('\n🏁 Final E2E Testing Complete!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Final E2E test runner failed:', error);
    process.exit(1);
  });
