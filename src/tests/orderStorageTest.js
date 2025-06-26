// Order Storage Test - Validate order creation and storage
// Test that orders are properly stored locally and retrieved

import { studentApiService } from '../services/studentApiService_new';

class OrderStorageTest {
  constructor() {
    this.testResults = [];
  }

  async runTests() {
    console.log('🧪 Starting Order Storage Tests...\n');
    
    try {
      await this.testOrderCreation();
      await this.testOrderRetrieval();
      await this.testOrderPersistence();
      
      this.printResults();
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  async testOrderCreation() {
    console.log('📝 Test 1: Order Creation and Local Storage');
    
    try {
      const testOrderData = {
        providerId: 'test_provider_001',
        providerName: 'Test Restaurant',
        items: [
          {
            itemId: 'item_001',
            name: 'Test Burger',
            price: 250,
            quantity: 2
          },
          {
            itemId: 'item_002', 
            name: 'Test Fries',
            price: 150,
            quantity: 1
          }
        ],
        deliveryAddress: 'Test Address, University Town',
        phone: '+92 300 1234567',
        notes: 'Test order for validation',
        paymentMethod: 'cash',
        subtotal: 650,
        deliveryFee: 50,
        totalAmount: 700
      };

      const createdOrder = await studentApiService.createFoodOrder(testOrderData);
      
      if (createdOrder && createdOrder._id) {
        this.testResults.push({
          test: 'Order Creation',
          status: '✅ PASS',
          details: `Order created with ID: ${createdOrder._id}`
        });
      } else {
        this.testResults.push({
          test: 'Order Creation',
          status: '❌ FAIL',
          details: 'Order creation returned invalid response'
        });
      }
    } catch (error) {
      this.testResults.push({
        test: 'Order Creation',
        status: '❌ FAIL',
        details: `Error: ${error.message}`
      });
    }
  }

  async testOrderRetrieval() {
    console.log('📋 Test 2: Order Retrieval');
    
    try {
      const orders = await studentApiService.getOrderHistory();
      
      if (Array.isArray(orders) && orders.length > 0) {
        this.testResults.push({
          test: 'Order Retrieval',
          status: '✅ PASS',
          details: `Retrieved ${orders.length} orders`
        });
        
        // Check if the most recent order has required fields
        const latestOrder = orders[0];
        const requiredFields = ['_id', 'status', 'createdAt', 'totalAmount'];
        const missingFields = requiredFields.filter(field => !latestOrder[field]);
        
        if (missingFields.length === 0) {
          this.testResults.push({
            test: 'Order Data Structure',
            status: '✅ PASS',
            details: 'Latest order has all required fields'
          });
        } else {
          this.testResults.push({
            test: 'Order Data Structure',
            status: '⚠️ WARNING',
            details: `Missing fields: ${missingFields.join(', ')}`
          });
        }
      } else {
        this.testResults.push({
          test: 'Order Retrieval',
          status: '❌ FAIL',
          details: 'No orders retrieved or invalid response format'
        });
      }
    } catch (error) {
      this.testResults.push({
        test: 'Order Retrieval',
        status: '❌ FAIL',
        details: `Error: ${error.message}`
      });
    }
  }

  async testOrderPersistence() {
    console.log('💾 Test 3: Order Persistence');
    
    try {
      // Get initial orders count
      const initialOrders = await studentApiService.getOrderHistory();
      const initialCount = initialOrders.length;
      
      // Create a new order
      const newOrderData = {
        providerId: 'test_provider_002',
        providerName: 'Persistence Test Restaurant',
        items: [
          {
            itemId: 'persist_item_001',
            name: 'Persistence Test Pizza',
            price: 500,
            quantity: 1
          }
        ],
        deliveryAddress: 'Persistence Test Address',
        phone: '+92 300 7777777',
        paymentMethod: 'cash',
        subtotal: 500,
        deliveryFee: 50,
        totalAmount: 550
      };

      await studentApiService.createFoodOrder(newOrderData);
      
      // Get orders again to verify persistence
      const updatedOrders = await studentApiService.getOrderHistory();
      const newCount = updatedOrders.length;
      
      if (newCount > initialCount) {
        this.testResults.push({
          test: 'Order Persistence',
          status: '✅ PASS',
          details: `Order count increased from ${initialCount} to ${newCount}`
        });
      } else {
        this.testResults.push({
          test: 'Order Persistence',
          status: '❌ FAIL',
          details: `Order count did not increase (${initialCount} -> ${newCount})`
        });
      }
    } catch (error) {
      this.testResults.push({
        test: 'Order Persistence',
        status: '❌ FAIL',
        details: `Error: ${error.message}`
      });
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('================================');
    
    this.testResults.forEach(result => {
      console.log(`${result.status} ${result.test}`);
      console.log(`   ${result.details}\n`);
    });
    
    const passCount = this.testResults.filter(r => r.status.includes('✅')).length;
    const totalCount = this.testResults.length;
    
    console.log(`\n🎯 Overall Results: ${passCount}/${totalCount} tests passed`);
    
    if (passCount === totalCount) {
      console.log('🎉 All tests passed! Order storage is working correctly.');
    } else {
      console.log('⚠️ Some tests failed. Please check the implementation.');
    }
  }
}

// Export test class for manual execution
export const orderStorageTest = new OrderStorageTest();

// Auto-run test if this file is executed directly
if (require.main === module) {
  orderStorageTest.runTests();
}
