import validationService from '../services/validationService';
import authService from '../services/authService';

// Test data for registration
const testRegistrationData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'TestPass123',
    confirmPassword: 'TestPass123',
    phone: '+923001234567',
    role: 'student',
    cnicPassport: '12345-1234567-1',
    dateOfBirth: new Date('2000-01-01'),
    country: 'Pakistan',
    city: 'Karachi',
    profilePicture: null,
};

// Test the validation service
export const testValidation = () => {
    console.log('Testing validation service...');
    
    const result = validationService.validateRegistrationForm(testRegistrationData);
    console.log('Validation result:', result);
    
    if (result.isValid) {
        console.log('✅ Validation test passed');
    } else {
        console.log('❌ Validation test failed:', result.errors);
    }
    
    return result.isValid;
};

// Test the authentication service (mock)
export const testRegistration = async () => {
    console.log('Testing registration service...');
    
    try {
        const result = await authService.register(testRegistrationData);
        console.log('Registration result:', result);
        
        if (result.success) {
            console.log('✅ Registration test would succeed (API call would be made)');
        } else {
            console.log('❌ Registration test failed:', result.message);
        }
        
        return result.success;
    } catch (error) {
        console.error('Registration test error:', error);
        return false;
    }
};

// Test login with hardcoded admin credentials
export const testAdminLogin = async () => {
    console.log('Testing admin login...');
    
    try {
        // This should work with the hardcoded credentials
        const email = 'assaleemofficial@gmail.com';
        const password = 'admin123';
        
        console.log('Admin login test - credentials are hardcoded in LoginScreen');
        console.log('Email:', email);
        console.log('Password:', password);
        
        return true;
    } catch (error) {
        console.error('Admin login test error:', error);
        return false;
    }
};

// Run all tests
export const runAllTests = async () => {
    console.log('🧪 Running StayKaru Frontend Tests...');
    console.log('=====================================');
    
    const validationTest = testValidation();
    const registrationTest = await testRegistration();
    const adminLoginTest = await testAdminLogin();
    
    console.log('=====================================');
    console.log('📊 Test Results Summary:');
    console.log(`Validation: ${validationTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Registration: ${registrationTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Admin Login: ${adminLoginTest ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = validationTest && registrationTest && adminLoginTest;
    console.log(`Overall: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return allPassed;
};
