const fetch = require('node-fetch');
require('dotenv').config();

async function testVerification() {
  console.log('🧪 Testing Discord Bot Verification System...\n');
  
  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables:');
  console.log(`   DISCORD_BOT_TOKEN: ${process.env.DISCORD_BOT_TOKEN ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DISCORD_SERVER_ID: ${process.env.DISCORD_SERVER_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DISCORD_MONTHLY_ROLE_ID: ${process.env.DISCORD_MONTHLY_ROLE_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   DISCORD_LIFETIME_ROLE_ID: ${process.env.DISCORD_LIFETIME_ROLE_ID ? '✅ Set' : '❌ Missing'}`);
  console.log(`   WEBSITE_API_URL: ${process.env.WEBSITE_API_URL ? '✅ Set' : '❌ Missing'}\n`);
  
  // Test 2: Test verify-code API
  console.log('2️⃣ Testing verify-code API:');
  try {
    const verifyResponse = await fetch('https://dreamzz.lol/api/discord/verify-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'TEST123',
        discordUserId: '123456789'
      })
    });
    
    const verifyData = await verifyResponse.json();
    console.log(`   Status: ${verifyResponse.status}`);
    console.log(`   Response: ${JSON.stringify(verifyData, null, 2)}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 3: Test assign-role API with real bot token
  console.log('3️⃣ Testing assign-role API:');
  try {
    const roleResponse = await fetch('https://dreamzz.lol/api/discord/assign-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: '123456789',
        plan: 'monthly',
        botToken: process.env.DISCORD_BOT_TOKEN
      })
    });
    
    const roleData = await roleResponse.json();
    console.log(`   Status: ${roleResponse.status}`);
    console.log(`   Response: ${JSON.stringify(roleData, null, 2)}\n`);
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}\n`);
  }
  
  // Test 4: Check if bot can connect to Discord
  console.log('4️⃣ Testing Discord connection:');
  try {
    const { Client, GatewayIntentBits } = require('discord.js');
    const client = new Client({ 
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] 
    });
    
    client.once('ready', () => {
      console.log(`   ✅ Bot connected as ${client.user.tag}`);
      console.log(`   ✅ Bot ID: ${client.user.id}`);
      client.destroy();
    });
    
    client.on('error', (error) => {
      console.log(`   ❌ Discord connection error: ${error.message}`);
    });
    
    await client.login(process.env.DISCORD_BOT_TOKEN);
  } catch (error) {
    console.log(`   ❌ Discord connection failed: ${error.message}\n`);
  }
  
  console.log('✅ Verification test complete!');
}

testVerification().catch(console.error); 