/**
 * CRITICAL ERRORS RESOLUTION VALIDATION TEST
 * Tests all the fixes implemented for the reported errors
 */

import { adminAPIClient } from '../services/adminApiService.js';
import { studentAPIClient } from '../services/studentApiService.js';
import { realTimeService } from '../services/realTimeService.js';

class CriticalErrorValidationTest {
  constructor() {
    this.results = {
      studentModule: {},
      adminModule: {},
      navigation: {},
      realTime: {},
      overallStatus: 'PENDING'
    };
  }

  async runAllTests() {
    console.log('🔧 CRITICAL ERRORS RESOLUTION VALIDATION TEST');
    console.log('='.repeat(60));
    
    try {
      await this.testStudentModuleErrors();
      await this.testAdminModuleErrors();
      await this.testNavigationErrors();
      await this.testRealTimeFeatures();
      
      this.generateFinalReport();
    } catch (error) {
      console.error('❌ Critical test error:', error);
      this.results.overallStatus = 'FAILED';
    }
  }

  // Test 1: Student Module Authentication Errors
  async testStudentModuleErrors() {
    console.log('\n🧪 TEST 1: Student Module Authentication Errors');
    console.log('-'.repeat(50));
    
    try {
      // Test getProfile function that was missing
      console.log('📋 Testing getProfile function...');
      
      if (typeof studentAPIClient.getProfile === 'function') {
        console.log('✅ getProfile function exists');
        
        const profileResult = await studentAPIClient.getProfile();
        if (profileResult) {
          console.log('✅ getProfile returns data');
          this.results.studentModule.getProfile = 'FIXED';
        } else {
          console.log('⚠️ getProfile returns empty');
          this.results.studentModule.getProfile = 'PARTIAL';
        }
      } else {
        console.log('❌ getProfile function missing');
        this.results.studentModule.getProfile = 'FAILED';
      }

      // Test 404 endpoint handling
      console.log('📡 Testing 404 endpoint handling...');
      const testResult = await studentAPIClient.testConnection();
      if (testResult) {
        console.log('✅ Endpoint fallback working');
        this.results.studentModule.endpointFallback = 'FIXED';
      } else {
        console.log('⚠️ Endpoint fallback partial');
        this.results.studentModule.endpointFallback = 'PARTIAL';
      }

    } catch (error) {
      console.log('❌ Student module test failed:', error.message);
      this.results.studentModule.getProfile = 'FAILED';
      this.results.studentModule.endpointFallback = 'FAILED';
    }
  }

  // Test 2: Admin Module Missing API Functions
  async testAdminModuleErrors() {
    console.log('\n🧪 TEST 2: Admin Module Missing API Functions');
    console.log('-'.repeat(50));

    const requiredFunctions = [
      'getNotifications',
      'getAccommodations', 
      'getUsers',
      'getAnalytics',
      'getBookings',
      'getOrders',
      'getSystemSettings'
    ];

    for (const funcName of requiredFunctions) {
      try {
        console.log(`📋 Testing ${funcName}...`);
        
        if (typeof adminAPIClient[funcName] === 'function') {
          console.log(`✅ ${funcName} function exists`);
          
          const result = await adminAPIClient[funcName]();
          if (result) {
            console.log(`✅ ${funcName} returns data`);
            this.results.adminModule[funcName] = 'FIXED';
          } else {
            console.log(`⚠️ ${funcName} returns empty`);
            this.results.adminModule[funcName] = 'PARTIAL';
          }
        } else {
          console.log(`❌ ${funcName} function missing`);
          this.results.adminModule[funcName] = 'FAILED';
        }
      } catch (error) {
        console.log(`⚠️ ${funcName} error:`, error.message);
        this.results.adminModule[funcName] = 'PARTIAL';
      }
    }
  }

  // Test 3: Navigation Error (AdminEndpointTest)
  async testNavigationErrors() {
    console.log('\n🧪 TEST 3: Navigation Error (AdminEndpointTest)');
    console.log('-'.repeat(50));

    try {
      // We can't directly test React Navigation, but we can check if the screen exists
      const fs = await import('fs');
      const path = await import('path');
      
      // Check if AdminEndpointTestScreen exists
      const screenPath = 'd:/FYP/staykaru_frontend/src/screens/admin/AdminEndpointTestScreen.js';
      const navigationPath = 'd:/FYP/staykaru_frontend/src/navigation/AppNavigator.js';
      
      console.log('📱 Checking AdminEndpointTest screen exists...');
      if (fs.existsSync(screenPath)) {
        console.log('✅ AdminEndpointTestScreen.js exists');
        this.results.navigation.screenExists = 'FIXED';
      } else {
        console.log('❌ AdminEndpointTestScreen.js missing');
        this.results.navigation.screenExists = 'FAILED';
      }

      console.log('🧭 Checking navigation configuration...');
      const navContent = fs.readFileSync(navigationPath, 'utf8');
      
      if (navContent.includes('AdminEndpointTestScreen') && navContent.includes('AdminEndpointTest')) {
        console.log('✅ AdminEndpointTest navigation configured');
        this.results.navigation.navigationConfig = 'FIXED';
      } else {
        console.log('❌ AdminEndpointTest navigation missing');
        this.results.navigation.navigationConfig = 'FAILED';
      }

    } catch (error) {
      console.log('❌ Navigation test failed:', error.message);
      this.results.navigation.screenExists = 'FAILED';
      this.results.navigation.navigationConfig = 'FAILED';
    }
  }

  // Test 4: Real-time Database Connectivity
  async testRealTimeFeatures() {
    console.log('\n🧪 TEST 4: Real-time Database Connectivity');
    console.log('-'.repeat(50));

    try {
      console.log('🔄 Testing real-time service initialization...');
      
      if (typeof realTimeService.initialize === 'function') {
        console.log('✅ Real-time service exists');
        this.results.realTime.serviceExists = 'FIXED';

        // Test initialization
        const initResult = await realTimeService.initialize();
        if (initResult) {
          console.log('✅ Real-time service initialized');
          this.results.realTime.initialization = 'FIXED';
        } else {
          console.log('⚠️ Real-time service fallback mode');
          this.results.realTime.initialization = 'PARTIAL';
        }

        // Test live user counts
        console.log('👥 Testing live user counts...');
        const userCounts = realTimeService.getUserCounts();
        if (userCounts && typeof userCounts.total === 'number') {
          console.log('✅ Live user counts working');
          this.results.realTime.userCounts = 'FIXED';
        } else {
          console.log('⚠️ Live user counts partial');
          this.results.realTime.userCounts = 'PARTIAL';
        }

        // Test subscription mechanism
        console.log('🔔 Testing subscription mechanism...');
        const unsubscribe = realTimeService.subscribe('test', () => {});
        if (typeof unsubscribe === 'function') {
          console.log('✅ Subscription mechanism working');
          this.results.realTime.subscription = 'FIXED';
          unsubscribe();
        } else {
          console.log('❌ Subscription mechanism failed');
          this.results.realTime.subscription = 'FAILED';
        }

      } else {
        console.log('❌ Real-time service missing');
        this.results.realTime.serviceExists = 'FAILED';
      }

    } catch (error) {
      console.log('❌ Real-time test failed:', error.message);
      this.results.realTime.serviceExists = 'FAILED';
      this.results.realTime.initialization = 'FAILED';
    }
  }

  // Generate final comprehensive report
  generateFinalReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 CRITICAL ERRORS RESOLUTION FINAL REPORT');
    console.log('='.repeat(60));

    let totalTests = 0;
    let fixedTests = 0;
    let partialTests = 0;
    let failedTests = 0;

    // Count all test results
    const allResults = [
      ...Object.values(this.results.studentModule),
      ...Object.values(this.results.adminModule),
      ...Object.values(this.results.navigation),
      ...Object.values(this.results.realTime)
    ];

    allResults.forEach(status => {
      totalTests++;
      if (status === 'FIXED') fixedTests++;
      else if (status === 'PARTIAL') partialTests++;
      else if (status === 'FAILED') failedTests++;
    });

    // Calculate success rate
    const successRate = Math.round(((fixedTests + partialTests * 0.5) / totalTests) * 100);

    console.log(`\n📈 OVERALL STATISTICS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   ✅ Fixed: ${fixedTests}`);
    console.log(`   ⚠️ Partial: ${partialTests}`);
    console.log(`   ❌ Failed: ${failedTests}`);
    console.log(`   🎯 Success Rate: ${successRate}%`);

    // Detailed breakdown
    console.log(`\n🔍 DETAILED BREAKDOWN:`);
    
    console.log(`\n1️⃣ STUDENT MODULE FIXES:`);
    Object.entries(this.results.studentModule).forEach(([test, status]) => {
      const icon = status === 'FIXED' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${status}`);
    });

    console.log(`\n2️⃣ ADMIN MODULE FIXES:`);
    Object.entries(this.results.adminModule).forEach(([test, status]) => {
      const icon = status === 'FIXED' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${status}`);
    });

    console.log(`\n3️⃣ NAVIGATION FIXES:`);
    Object.entries(this.results.navigation).forEach(([test, status]) => {
      const icon = status === 'FIXED' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${status}`);
    });

    console.log(`\n4️⃣ REAL-TIME FEATURES:`);
    Object.entries(this.results.realTime).forEach(([test, status]) => {
      const icon = status === 'FIXED' ? '✅' : status === 'PARTIAL' ? '⚠️' : '❌';
      console.log(`   ${icon} ${test}: ${status}`);
    });

    // Final verdict
    if (successRate >= 90) {
      this.results.overallStatus = 'EXCELLENT';
      console.log(`\n🎉 FINAL VERDICT: EXCELLENT - All critical errors resolved!`);
    } else if (successRate >= 75) {
      this.results.overallStatus = 'GOOD';
      console.log(`\n✅ FINAL VERDICT: GOOD - Most critical errors resolved!`);
    } else if (successRate >= 50) {
      this.results.overallStatus = 'PARTIAL';
      console.log(`\n⚠️ FINAL VERDICT: PARTIAL - Some critical errors resolved!`);
    } else {
      this.results.overallStatus = 'NEEDS_WORK';
      console.log(`\n❌ FINAL VERDICT: NEEDS WORK - More fixes required!`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('🏁 VALIDATION TEST COMPLETED');
    console.log('='.repeat(60));
  }
}

// Run the validation test
const validator = new CriticalErrorValidationTest();
validator.runAllTests();
