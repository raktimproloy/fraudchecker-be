#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test configuration
const testConfig = {
  adminCredentials: {
    username: 'superadmin',
    password: 'admin123'
  },
  testUser: {
    googleId: 'test_google_123',
    name: 'Test User',
    email: 'test@example.com',
    profilePicture: 'https://via.placeholder.com/150'
  }
};

let adminToken = '';
let userToken = '';

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testHealthCheck() {
  console.log('🏥 Testing health check...');
  const result = await apiCall('GET', '/health');
  
  if (result.success) {
    console.log('✅ Health check passed');
    console.log(`   Status: ${result.data.status}`);
    console.log(`   Uptime: ${result.data.uptime}s`);
  } else {
    console.log('❌ Health check failed');
    console.log(`   Error: ${result.error}`);
  }
  console.log('');
}

async function testAdminLogin() {
  console.log('🔐 Testing admin login...');
  const result = await apiCall('POST', '/auth/admin/login', testConfig.adminCredentials);
  
  if (result.success) {
    adminToken = result.data.accessToken;
    console.log('✅ Admin login successful');
    console.log(`   Admin: ${result.data.admin.username}`);
    console.log(`   Role: ${result.data.admin.role}`);
  } else {
    console.log('❌ Admin login failed');
    console.log(`   Error: ${result.error.error || result.error}`);
  }
  console.log('');
}

async function testGoogleAuth() {
  console.log('🔑 Testing Google authentication...');
  const result = await apiCall('POST', '/auth/google', testConfig.testUser);
  
  if (result.success) {
    userToken = result.data.accessToken;
    console.log('✅ Google auth successful');
    console.log(`   User: ${result.data.user.name}`);
    console.log(`   Email: ${result.data.user.email}`);
  } else {
    console.log('❌ Google auth failed');
    console.log(`   Error: ${result.error.error || result.error}`);
  }
  console.log('');
}

async function testPublicEndpoints() {
  console.log('🌐 Testing public endpoints...');
  
  // Test stats endpoint
  const statsResult = await apiCall('GET', '/stats');
  if (statsResult.success) {
    console.log('✅ Stats endpoint working');
    console.log(`   Total reports: ${statsResult.data.data.totalReports}`);
  } else {
    console.log('❌ Stats endpoint failed');
  }

  // Test search endpoint
  const searchResult = await apiCall('GET', '/search?query=test');
  if (searchResult.success) {
    console.log('✅ Search endpoint working');
    console.log(`   Results: ${searchResult.data.data.reports.length}`);
  } else {
    console.log('❌ Search endpoint failed');
  }

  // Test language endpoint
  const langResult = await apiCall('GET', '/language/en');
  if (langResult.success) {
    console.log('✅ Language endpoint working');
    console.log(`   Content keys: ${Object.keys(langResult.data.data.content).length}`);
  } else {
    console.log('❌ Language endpoint failed');
  }
  console.log('');
}

async function testUserEndpoints() {
  if (!userToken) {
    console.log('⚠️  Skipping user endpoints - no user token');
    return;
  }

  console.log('👤 Testing user endpoints...');
  
  // Test user profile
  const profileResult = await apiCall('GET', '/user/profile', null, userToken);
  if (profileResult.success) {
    console.log('✅ User profile endpoint working');
    console.log(`   User: ${profileResult.data.data.name}`);
  } else {
    console.log('❌ User profile endpoint failed');
  }

  // Test submit report
  const reportData = {
    identityType: 'PHONE',
    identityValue: '+1234567890',
    description: 'This is a test fraud report for API testing purposes.'
  };

  const reportResult = await apiCall('POST', '/user/reports', reportData, userToken);
  if (reportResult.success) {
    console.log('✅ Submit report endpoint working');
    console.log(`   Report ID: ${reportResult.data.data.report_id}`);
  } else {
    console.log('❌ Submit report endpoint failed');
    console.log(`   Error: ${reportResult.error.error || reportResult.error}`);
  }

  // Test get user reports
  const userReportsResult = await apiCall('GET', '/user/reports', null, userToken);
  if (userReportsResult.success) {
    console.log('✅ Get user reports endpoint working');
    console.log(`   Reports count: ${userReportsResult.data.data.reports.length}`);
  } else {
    console.log('❌ Get user reports endpoint failed');
  }
  console.log('');
}

async function testAdminEndpoints() {
  if (!adminToken) {
    console.log('⚠️  Skipping admin endpoints - no admin token');
    return;
  }

  console.log('👨‍💼 Testing admin endpoints...');
  
  // Test admin dashboard
  const dashboardResult = await apiCall('GET', '/admin/dashboard', null, adminToken);
  if (dashboardResult.success) {
    console.log('✅ Admin dashboard endpoint working');
    console.log(`   Total users: ${dashboardResult.data.data.overview.totalUsers}`);
  } else {
    console.log('❌ Admin dashboard endpoint failed');
  }

  // Test get users
  const usersResult = await apiCall('GET', '/admin/users', null, adminToken);
  if (usersResult.success) {
    console.log('✅ Get users endpoint working');
    console.log(`   Users count: ${usersResult.data.data.users.length}`);
  } else {
    console.log('❌ Get users endpoint failed');
  }

  // Test get reports
  const reportsResult = await apiCall('GET', '/admin/reports', null, adminToken);
  if (reportsResult.success) {
    console.log('✅ Get reports endpoint working');
    console.log(`   Reports count: ${reportsResult.data.data.reports.length}`);
  } else {
    console.log('❌ Get reports endpoint failed');
  }
  console.log('');
}

async function testErrorHandling() {
  console.log('🚨 Testing error handling...');
  
  // Test invalid endpoint
  const invalidResult = await apiCall('GET', '/invalid-endpoint');
  if (!invalidResult.success && invalidResult.status === 404) {
    console.log('✅ 404 error handling working');
  } else {
    console.log('❌ 404 error handling failed');
  }

  // Test unauthorized access
  const unauthorizedResult = await apiCall('GET', '/user/profile');
  if (!unauthorizedResult.success && unauthorizedResult.status === 401) {
    console.log('✅ Unauthorized access handling working');
  } else {
    console.log('❌ Unauthorized access handling failed');
  }

  // Test invalid token
  const invalidTokenResult = await apiCall('GET', '/user/profile', null, 'invalid-token');
  if (!invalidTokenResult.success && invalidTokenResult.status === 401) {
    console.log('✅ Invalid token handling working');
  } else {
    console.log('❌ Invalid token handling failed');
  }
  console.log('');
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting API Tests for Fraud Checker Backend\n');
  console.log('=' .repeat(50));
  console.log('');

  try {
    await testHealthCheck();
    await testAdminLogin();
    await testGoogleAuth();
    await testPublicEndpoints();
    await testUserEndpoints();
    await testAdminEndpoints();
    await testErrorHandling();

    console.log('=' .repeat(50));
    console.log('🎉 All tests completed!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Check the server logs for any errors');
    console.log('2. Verify database connection and data');
    console.log('3. Test file upload functionality manually');
    console.log('4. Configure production environment variables');
    console.log('');

  } catch (error) {
    console.error('❌ Test runner error:', error.message);
  }
}

// Check if axios is available
try {
  require('axios');
} catch (error) {
  console.log('📦 Installing axios for testing...');
  const { execSync } = require('child_process');
  execSync('npm install axios', { stdio: 'inherit' });
}

// Run tests
runTests();
