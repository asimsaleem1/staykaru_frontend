import foodProviderApiService from '../services/foodProviderApiService.js';

async function runFoodProviderTests() {
  const results = [];
  function log(label, status, details = '') {
    const prefix = status === 'PASS' ? '✅' : '❌';
    console.log(`${prefix} ${label}${details ? ': ' + details : ''}`);
    results.push({ label, status, details });
  }

  // 1. Health Check
  try {
    const health = await foodProviderApiService.checkHealth();
    if (health && health.status !== 'unhealthy') log('Health Check', 'PASS');
    else log('Health Check', 'FAIL', JSON.stringify(health));
  } catch (e) { log('Health Check', 'FAIL', e.message); }

  // 2. Get Food Providers List
  let providers = [];
  try {
    providers = await foodProviderApiService.getFoodProviders();
    if (Array.isArray(providers) && providers.length > 0) log('Get Food Providers', 'PASS', `Count: ${providers.length}`);
    else log('Get Food Providers', 'FAIL', 'No providers found');
  } catch (e) { log('Get Food Providers', 'FAIL', e.message); }

  // 3. Get Food Provider Details
  let providerId = providers[0]?._id || providers[0]?.id;
  try {
    if (!providerId) throw new Error('No providerId');
    const details = await foodProviderApiService.getFoodProviderDetails(providerId);
    if (details) log('Get Food Provider Details', 'PASS');
    else log('Get Food Provider Details', 'FAIL', 'No details');
  } catch (e) { log('Get Food Provider Details', 'FAIL', e.message); }

  // 4. Get Food Provider Menu
  try {
    if (!providerId) throw new Error('No providerId');
    const menu = await foodProviderApiService.getFoodProviderMenu(providerId);
    if (menu) log('Get Food Provider Menu', 'PASS');
    else log('Get Food Provider Menu', 'FAIL', 'No menu');
  } catch (e) { log('Get Food Provider Menu', 'FAIL', e.message); }

  // 5. Get Orders
  try {
    const orders = await foodProviderApiService.getOrders();
    if (orders) log('Get Orders', 'PASS');
    else log('Get Orders', 'FAIL', 'No orders');
  } catch (e) { log('Get Orders', 'FAIL', e.message); }

  // 6. Get Analytics
  try {
    const analytics = await foodProviderApiService.getAnalytics('7d');
    if (analytics) log('Get Analytics', 'PASS');
    else log('Get Analytics', 'FAIL', 'No analytics');
  } catch (e) { log('Get Analytics', 'FAIL', e.message); }

  // 7. Get Notifications
  try {
    const notifications = await foodProviderApiService.getNotifications();
    if (notifications) log('Get Notifications', 'PASS');
    else log('Get Notifications', 'FAIL', 'No notifications');
  } catch (e) { log('Get Notifications', 'FAIL', e.message); }

  // 8. Get Settings
  try {
    const settings = await foodProviderApiService.getSettings();
    if (settings) log('Get Settings', 'PASS');
    else log('Get Settings', 'FAIL', 'No settings');
  } catch (e) { log('Get Settings', 'FAIL', e.message); }

  // 9. Place Order (if menu exists)
  try {
    const menu = await foodProviderApiService.getFoodProviderMenu(providerId);
    const menuItem = Array.isArray(menu?.items) ? menu.items[0] : null;
    if (!providerId || !menuItem) throw new Error('No provider/menu item');
    const orderData = {
      providerId,
      items: [{ itemId: menuItem._id || menuItem.id, quantity: 1, price: menuItem.price }],
      deliveryAddress: 'Test Address',
      phone: '+92-300-1234567',
      paymentMethod: 'cash',
      totalAmount: menuItem.price + 50
    };
    const order = await foodProviderApiService.placeOrder(orderData);
    if (order) log('Place Order', 'PASS');
    else log('Place Order', 'FAIL', 'No order response');
  } catch (e) { log('Place Order', 'FAIL', e.message); }

  // 10. Update Profile
  try {
    const updateData = { businessName: 'Test Update', description: 'Updated by test' };
    const result = await foodProviderApiService.updateFoodProviderProfile(updateData);
    if (result) log('Update Profile', 'PASS');
    else log('Update Profile', 'FAIL', 'No update result');
  } catch (e) { log('Update Profile', 'FAIL', e.message); }

  // 11. Add Menu Item
  let newMenuItemId = null;
  try {
    const menuItem = { name: 'Test Item', description: 'Test', price: 100, category: 'Test', isAvailable: true };
    const result = await foodProviderApiService.addMenuItem(menuItem);
    newMenuItemId = result?._id || result?.id;
    if (newMenuItemId) log('Add Menu Item', 'PASS');
    else log('Add Menu Item', 'FAIL', 'No item id');
  } catch (e) { log('Add Menu Item', 'FAIL', e.message); }

  // 12. Update Menu Item
  try {
    if (!newMenuItemId) throw new Error('No newMenuItemId');
    const updateData = { name: 'Updated Test Item', price: 120 };
    const result = await foodProviderApiService.updateMenuItem(newMenuItemId, updateData);
    if (result) log('Update Menu Item', 'PASS');
    else log('Update Menu Item', 'FAIL', 'No update result');
  } catch (e) { log('Update Menu Item', 'FAIL', e.message); }

  // 13. Delete Menu Item
  try {
    if (!newMenuItemId) throw new Error('No newMenuItemId');
    const result = await foodProviderApiService.deleteMenuItem(newMenuItemId);
    if (result) log('Delete Menu Item', 'PASS');
    else log('Delete Menu Item', 'FAIL', 'No delete result');
  } catch (e) { log('Delete Menu Item', 'FAIL', e.message); }

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  console.log(`\n=== FOOD PROVIDER API TEST SUMMARY ===`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  results.filter(r => r.status === 'FAIL').forEach(r => console.log(`❌ ${r.label}: ${r.details}`));
}

runFoodProviderTests().catch(console.error); 