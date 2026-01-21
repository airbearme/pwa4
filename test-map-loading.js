#!/usr/bin/env node

/**
 * Test Map Loading After CSP Fix
 */

import http from 'http';
import { performance } from 'perf_hooks';

const LOCAL_URL = 'http://localhost:5000';

class MapTestUtils {
  static async request(url, options = {}) {
    return new Promise((resolve, reject) => {
      const requestOptions = {
        method: 'GET',
        headers: {
          'User-Agent': 'Map-Tester/1.0'
        },
        timeout: 5000,
        ...options
      };

      const req = http.request(url, requestOptions, (res) => {
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
              reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
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

  static log(test, status, message = '') {
    const timestamp = new Date().toISOString().substring(11, 19);
    const statusIcon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏳';
    console.log(`${statusIcon} [${timestamp}] ${test}: ${message}`);
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

class MapTests {
  static async testMapDebugPage() {
    return MapTestUtils.measureTime('Map Debug Page', async () => {
      const response = await MapTestUtils.request(`${LOCAL_URL}/debug-map.html`);
      
      if (response.status && response.status !== 200) {
        throw new Error(`Debug page returned ${response.status}`);
      }
      
      return { status: 'accessible', contentLength: response.raw ? response.raw.length : 0 };
    });
  }

  static async testSpotsAPI() {
    return MapTestUtils.measureTime('Spots API', async () => {
      const spots = await MapTestUtils.request(`${LOCAL_URL}/api/spots`);
      
      if (!Array.isArray(spots)) {
        throw new Error('Spots API not returning array');
      }
      
      // Validate spot structure
      const spot = spots[0];
      if (!spot.id || !spot.name || !spot.latitude || !spot.longitude) {
        throw new Error('Invalid spot structure');
      }
      
      return { 
        count: spots.length, 
        hasDescriptions: spots.every(s => s.description),
        hasAmenities: spots.every(s => s.amenities),
        sampleSpot: spots[0].name 
      };
    });
  }

  static async testLeafletResources() {
    return MapTestUtils.measureTime('Leaflet Resources', async () => {
      // Test CSS
      const cssResponse = await MapTestUtils.request('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
      if (!cssResponse.raw || !cssResponse.raw.includes('leaflet')) {
        throw new Error('Leaflet CSS not loading');
      }
      
      // Test JS
      const jsResponse = await MapTestUtils.request('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
      if (!jsResponse.raw || !jsResponse.raw.includes('L')) {
        throw new Error('Leaflet JS not loading');
      }
      
      return { css: 'loaded', js: 'loaded' };
    });

  static async testMapTiles() {
    return MapTestUtils.measureTime('Map Tiles', async () => {
      const tileResponse = await MapTestUtils.request('https://tile.openstreetmap.org/13/2445/3013.png');
      
      if (!tileResponse.raw || !tileResponse.raw.includes('PNG')) {
        throw new Error('Map tiles not loading');
      }
      
      return { status: 'tiles_loading', contentType: tileResponse.raw.includes('PNG') ? 'png' : 'unknown' };
    });
  }

  static async testCSPHeaders() {
    return MapTestUtils.measureTime('CSP Headers', async () => {
      const response = await MapTestUtils.request(`${LOCAL_URL}/debug-map.html`);
      
      // Check if CSP header is present
      const cspHeader = response.raw ? response.raw.includes('Content-Security-Policy') : false;
      
      if (!cspHeader) {
        return { csp: 'not_present' };
      }
      
      // Extract CSP content (simplified)
      const cspMatch = response.raw.match(/Content-Security-Policy[^;]*/);
      const cspContent = cspMatch ? cspMatch[0] : '';
      
      const hasOpenStreetMap = cspContent.includes('openstreetmap.org');
      const hasUnpkg = cspContent.includes('unpkg.com');
      
      return { 
        csp: 'present', 
        hasOpenStreetMap,
        hasUnpkg,
        cspLength: cspContent.length
      };
    });
  }
}

class MapTestRunner {
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
    console.log('🗺️ Map Loading Test Suite');
    console.log(`📍 Testing: ${LOCAL_URL}\n`);

    const startTime = performance.now();

    await this.runTestSuite('Map Validation', MapTests);

    const endTime = performance.now();
    this.results.duration = (endTime - startTime).toFixed(2);

    this.printResults();
    return this.results;
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 MAP TEST RESULTS');
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
      console.log('🎉 ALL MAP TESTS PASSED!');
      console.log('🗺️ Beautiful map is ready with all locations');
      console.log('🌐 Test at: http://localhost:5000/debug-map.html');
    } else {
      console.log('⚠️  Map issues found. Review and fix problems.');
    }
    
    console.log('='.repeat(50));
  }
}

// Run map tests
const runner = new MapTestRunner();
runner.runAllTests()
  .then(results => {
    console.log('\n🏁 Map Testing Complete!');
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Map test runner failed:', error);
    process.exit(1);
  });
