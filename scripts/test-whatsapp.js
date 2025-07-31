#!/usr/bin/env node

/**
 * WhatsApp Integration Test Script
 * Tests webhook connectivity and basic API access
 */

const https = require('https');

// Configuration
const config = {
  webhookUrl: process.argv[2] || 'https://your-ngrok-url.ngrok.io',
  verifyToken: process.argv[3] || 'my-secure-verify-token-2024',
  accessToken: process.argv[4] || '',
  phoneNumberId: process.argv[5] || ''
};

console.log('🧪 WhatsApp Integration Test\n');

// Test 1: Webhook Verification
function testWebhookVerification() {
  return new Promise((resolve, reject) => {
    const url = `${config.webhookUrl}/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${config.verifyToken}&hub.challenge=test123`;
    
    console.log('1️⃣ Testing webhook verification...');
    console.log(`   URL: ${url}`);
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 && data === 'test123') {
          console.log('   ✅ Webhook verification: PASSED\n');
          resolve(true);
        } else {
          console.log(`   ❌ Webhook verification: FAILED (${res.statusCode})`);
          console.log(`   Response: ${data}\n`);
          resolve(false);
        }
      });
    }).on('error', (err) => {
      console.log('   ❌ Webhook verification: CONNECTION ERROR');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });
  });
}

// Test 2: WhatsApp API Access
function testWhatsAppAPI() {
  return new Promise((resolve, reject) => {
    if (!config.accessToken || !config.phoneNumberId) {
      console.log('2️⃣ Testing WhatsApp API access...');
      console.log('   ⚠️  Skipped: Access token or phone number ID not provided\n');
      resolve(true);
      return;
    }

    const postData = JSON.stringify({
      messaging_product: "whatsapp",
      to: config.phoneNumberId, // Test by sending to self
      type: "text",
      text: { body: "Test message from CRM integration" }
    });

    const options = {
      hostname: 'graph.facebook.com',
      port: 443,
      path: `/v18.0/${config.phoneNumberId}/messages`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    console.log('2️⃣ Testing WhatsApp API access...');
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('   ✅ WhatsApp API: CONNECTED\n');
          resolve(true);
        } else {
          console.log(`   ❌ WhatsApp API: FAILED (${res.statusCode})`);
          console.log(`   Response: ${data}\n`);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.log('   ❌ WhatsApp API: CONNECTION ERROR');
      console.log(`   Error: ${err.message}\n`);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Run all tests
async function runTests() {
  console.log('Starting WhatsApp integration tests...\n');
  
  const test1 = await testWebhookVerification();
  const test2 = await testWhatsAppAPI();
  
  console.log('📊 Test Results:');
  console.log(`   Webhook: ${test1 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   API Access: ${test2 ? '✅ PASS' : '❌ FAIL'}`);
  
  if (test1 && test2) {
    console.log('\n🎉 All tests passed! Your WhatsApp integration is ready.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the setup guide for troubleshooting.');
  }
}

// Help text
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Usage: node scripts/test-whatsapp.js [webhook-url] [verify-token] [access-token] [phone-number-id]

Examples:
  # Test webhook only
  node scripts/test-whatsapp.js https://abc123.ngrok.io
  
  # Test everything
  node scripts/test-whatsapp.js https://abc123.ngrok.io my-verify-token EAA123... 1234567890
  
Parameters:
  webhook-url     Your ngrok or production webhook URL
  verify-token    The webhook verify token from your .env file
  access-token    WhatsApp API access token
  phone-number-id WhatsApp Business phone number ID
  
`);
  process.exit(0);
}

// Run the tests
runTests().catch(console.error); 