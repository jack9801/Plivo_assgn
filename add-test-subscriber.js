// Script to add a test subscriber directly to the database
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

async function addTestSubscriber() {
  try {
    // Get the first organization (modify this if you want a specific organization)
    const organization = await prisma.organization.findFirst();
    
    if (!organization) {
      console.error('No organizations found in the database');
      return;
    }
    
    console.log(`Found organization: ${organization.name} (${organization.id})`);
    
    // Generate a token for unsubscribe functionality
    const token = crypto.randomBytes(32).toString('hex');
    
    // Email to use for testing (modify as needed)
    const testEmail = 'mailtrap-test@example.com';
    
    // Create or update subscription with confirmed=true
    const subscription = await prisma.subscription.upsert({
      where: {
        email_organizationId: {
          email: testEmail,
          organizationId: organization.id
        }
      },
      update: {
        token,
        confirmed: true // Set to true directly
      },
      create: {
        email: testEmail,
        organizationId: organization.id,
        token,
        confirmed: true // Create as confirmed
      }
    });
    
    console.log(`✅ Successfully added test subscriber:`);
    console.log(`- Email: ${subscription.email}`);
    console.log(`- Organization: ${organization.name}`);
    console.log(`- Subscription ID: ${subscription.id}`);
    console.log(`- Confirmed: ${subscription.confirmed}`);
    console.log(`- Token: ${token.substring(0, 8)}...`);
    console.log('\nNow your notifications should work!');
    
  } catch (error) {
    console.error('Error adding test subscriber:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestSubscriber(); 