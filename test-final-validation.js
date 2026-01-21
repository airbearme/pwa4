#!/usr/bin/env node

/**
 * Final E2E Validation Test Suite
 * Tests registration, sign-in, map display, and all core functionality
 */

import https from 'https';
import { performance } from 'perf_hooks';

const PROD_URL = 'https://pwa41.vercel.app';

class FinalTestUtils {
  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AirBear-Final-Validator/1.0'
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

class FinalValidationTests {
  static async testServerHealth() {
    return FinalTestUtils.measureTime('Server Health Check', async () => {
      const response = await FinalTestUtils.request(`${PROD_URL}/api/health`);
      
      if (response.status !== 'ok') {
        throw new Error('Server not healthy');
      }
      
      return { 
        status: response.status,
        supabaseConfigured: response.supabaseUrl === 'configured',
        stripeConfigured: response.stripeSecretKey === 'configured'
      };
    });
  }

  static async testUserRegistration() {
    return FinalTestUtils.measureTime('User Registration', async () => {
      const testUser = {
        email: `test-${Date.now()}@airbear.me`,
        password: 'Test123456!',
        username: `testuser${Date.now()}`,
        role: 'user'
      };

      const response = await FinalTestUtils.request(`${PROD_URL}/api/auth/register`, {
        method: 'POST',
        body: JSON.stringify(testUser)
      });
      
      if (response.message && response.message.includes('Could not find')) {
        throw new Error('Database schema not applied - column names mismatch');
      }
      
      if (response.error) {
        throw new Error(`Registration failed: ${response.error}`);
      }
      
      return { 
        success: !response.error,
        userCreated: response.user ? true : false,
        message: response.message || 'Registration successful'
      };
    });
  }

  static async testUserLogin() {
    return FinalTestUtils.measureTime('User Login', async () => {
      const loginData = {
        email: 'test@airbear.me',
        password: 'Test123456!'
      };

      const response = await FinalTestUtils.request(`${PROD_URL}/api/auth/login`, {
        method: 'POST',
        body: JSON.stringify(loginData)
      });
      
      if (response.error) {
        throw new Error(`Login failed: ${response.error}`);
      }
      
      return { 
        success: !response.error,
        hasToken: response.token ? true : false,
        hasUser: response.user ? true : false
      };
    });
  }

  static async testMapLocations() {
    return FinalTestUtils.measureTime('Map Locations', async () => {
      const spots = await FinalTestUtils.request(`${PROD_URL}/api/spots`);
      
      if (!Array.isArray(spots)) {
        throw new Error('Spots API not returning array');
      }
      
      if (spots.length < 16) {
        throw new Error(`Expected at least 16 spots, got ${spots.length}`);
      }
      
      // Validate spot structure
      const spot = spots[0];
      if (!spot.id || !spot.name || !spot.latitude || !spot.longitude || !spot.description || !spot.amenities) {
        throw new Error('Invalid spot structure - missing fields');
      }
      
      // Check for specific locations
      const hasDowntown = spots.some(s => s.name.toLowerCase().includes('downtown'));
      const hasUniversity = spots.some(s => s.name.toLowerCase().includes('bu') || s.name.toLowerCase().includes('binghamton'));
      const hasParks = spots.some(s => s.name.toLowerCase().includes('park'));
      
      return { 
        count: spots.length,
        hasDowntown,
        hasUniversity,
        hasParks,
        hasDescriptions: spots.every(s => s.description),
        hasAmenities: spots.every(s => s.amenities && Array.isArray(s.amenities)),
        sampleSpot: spots[0].name
      };
    });
  }

  static async testAirbears() {
    return FinalTestUtils.measureTime('AirBears Data', async () => {
      const airbears = await FinalTestUtils.request(`${PROD_URL}/api/rickshaws`);
      
      if (!Array.isArray(airbears)) {
        throw new Error('Airbears API not returning array');
      }
      
      if (airbears.length > 0) {
        const airbear = airbears[0];
        if (!airbear.id || !airbear.latitude || !airbear.longitude || !airbear.batteryLevel) {
          throw new Error('Invalid airbear structure');
        }
      }
      
      return { 
        count: airbears.length,
        available: airbears.filter(a => a.isAvailable).length,
        avgBattery: airbears.length > 0 ? airbears.reduce((sum, a) => sum + a.batteryLevel, 0) / airbears.length : 0,
        hasRealTimeData: airbears.some(a => a.latitude && a.longitude)
      };
    });
  }

  static async testBodegaItems() {
    return FinalTestUtils.measureTime('Bodega Items', async () => {
      const items = await FinalTestUtils.request(`${PROD_URL}/api/bodega/items`);
      
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error('No bodega items available');
      }
      
      const categories = [...new Set(items.map(i => i.category))];
      const ecoFriendly = items.filter(i => i.isEcoFriendly).length;
      
      return { 
        count: items.length,
        categories,
        ecoFriendly,
        inStock: items.filter(i => i.isAvailable && i.stock > 0).length,
        hasImages: items.every(i => i.imageUrl)
      };
    });
  }

  static async testMapFunctionality() {
    return FinalTestUtils.measureTime('Map Functionality', async () => {
      // Test that map tiles are accessible
      const tileResponse = await FinalTestUtils.request('https://tile.openstreetmap.org/13/2445/3013.png');
      
      if (!tileResponse.raw || !tileResponse.raw.includes('PNG')) {
        throw new Error('Map tiles not accessible');
      }
      
      // Test that Leaflet resources are available
      const cssResponse = await FinalTestUtils.request('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      const jsResponse = await FinalTestUtils.request('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      
      if (!cssResponse.raw || !cssResponse.raw.includes('leaflet')) {
        throw new Error('Leaflet CSS not loading');
      }
      
      if (!jsResponse.raw || !jsResponse.raw.includes('L')) {
        throw new Error('Leaflet JS not loading');
      }
      
      return { 
        mapTiles: 'accessible',
        leafletCSS: 'loading',
        leafletJS: 'loading'
      };
    });
  }

  static async testPWAFeatures() {
    return FinalTestUtils.measureTime('PWA Features', async () => {
      // Test manifest
      const manifestResponse = await FinalTestUtils.request(`${PROD_URL}/manifest.json`);
      if (!manifestResponse.name || !manifestResponse.start_url) {
        throw new Error('PWA manifest invalid');
      }

      // Test service worker
      try {
        const swResponse = await FinalTestUtils.request(`${PROD_URL}/sw.js`);
        return { 
          manifest: 'valid', 
          serviceWorker: 'accessible',
          appName: manifestResponse.name,
          hasIcons: manifestResponse.icons && manifestResponse.icons.length > 0
        };
      } catch (error) {
        throw new Error('Service worker not accessible');
      }
    });
  }

  static async testOAuthAvailability() {
    return FinalTestUtils.measureTime('OAuth Availability', async () => {
      // Test that auth page loads (which should have OAuth buttons)
      try {
        const authPageResponse = await FinalTestUtils.request(`${PROD_URL}/auth`);
        if (!authPageResponse.raw || !authPageResponse.raw.includes('Google')) {
          throw new Error('OAuth buttons not found on auth page');
        }
        
        return { 
          authPage: 'accessible',
          hasGoogleOAuth: authPageResponse.raw.includes('Google'),
          hasAppleOAuth: authPageResponse.raw.includes('Apple')
        };
      } catch (error) {
        throw new Error('Auth page not accessible');
      }
    });
  }
}

class FinalValidationRunner {
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

    const testMethods = Object.getOwnPropertyNames(testClass)
      .filter((name) => name.startsWith('test') && typeof testClass[name] === 'function');

    for (const testName of testMethods) {
      const testFn = testClass[testName];
      
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
    console.log('🚀 Final E2E Validation Test Suite');
    console.log(`📍 Testing: ${PROD_URL}\n`);

    const startTime = performance.now();

    await this.runTestSuite('Production Validation', FinalValidationTests);

    const endTime = performance.now();
    this.results.duration = (endTime - startTime).toFixed(2);

    this.printResults();
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 FINAL VALIDATION TEST RESULTS');
    console.log('='.repeat(70));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Total:  ${this.results.total}`);
    console.log(`⏱️  Duration: ${this.results.duration}ms`);
    const successRate = this.results.total === 0
      ? 0
      : (this.results.passed / this.results.total) * 100;
    console.log(`🎯 Success Rate: ${successRate.toFixed(1)}%`);
    
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
      console.log('🎉 ALL VALIDATION TESTS PASSED!');
      console.log('🔐 Registration and sign-in working');
      console.log('🗺️ Map displaying properly with all locations');
      console.log('🚀 Full application functionality verified');
      console.log('📱 PWA features working correctly');
      console.log('🌐 Ready for domain forwarding: airbear.me → https://pwa41.vercel.app');
    } else {
      console.log('⚠️  Some tests failed. Review and fix issues.');
      if (this.results.tests.some(t => t.error && t.error.includes('Database schema'))) {
        console.log('\n🔧 DATABASE SCHEMA FIX NEEDED:');
        console.log('1. Open: https://supabase.com/dashboard/project/your-project-ref');
        console.log('2. Go to: SQL Editor');
        console.log('3. Run: supabase-schema-correct.sql');
        console.log('4. Re-run tests to verify fix');
      }
    }
    
    console.log('='.repeat(70));
  }
}

// Run final validation tests
const runner = new FinalValidationRunner();
runner.runAllTests()
  .then(results => {
    console.log('\n🏁 Final Validation Complete!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Validation runner failed:', error);
    process.exit(1);
  });
