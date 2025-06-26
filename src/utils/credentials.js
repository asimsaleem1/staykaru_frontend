// Admin Login Credentials for StayKaru
// These are the valid admin accounts for the application

export const ADMIN_CREDENTIALS = [
  {
    email: 'admin@staykaru.com',
    password: 'StayKaru2024!@#',
    name: 'System Administrator',
    role: 'admin'
  },
  {
    email: 'assaleemofficial@gmail.com', 
    password: 'admin123',
    name: 'Saleem Ahmad',
    role: 'admin'
  }
];

// Test user credentials for development
export const TEST_CREDENTIALS = {
  admin: {
    email: 'admin@staykaru.com',
    password: 'admin123'
  },
  student: {
    email: 'student@staykaru.com',
    password: 'student123'
  },
  landlord: {
    email: 'landlord@staykaru.com', 
    password: 'landlord123'
  },
  foodProvider: {
    email: 'provider@staykaru.com',
    password: 'provider123'
  }
};

export default {
  ADMIN_CREDENTIALS,
  TEST_CREDENTIALS
};
