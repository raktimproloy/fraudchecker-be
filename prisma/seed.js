const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create super admin
  const superAdminPassword = await bcrypt.hash('admin123', 12);
  const superAdmin = await prisma.admin.upsert({
    where: { username: 'superadmin' },
    update: {},
    create: {
      username: 'superadmin',
      password_hash: superAdminPassword,
      role: 'SUPER_ADMIN'
    }
  });

  console.log('✅ Super admin created:', superAdmin.username);

  // Create moderator
  const moderatorPassword = await bcrypt.hash('moderator123', 12);
  const moderator = await prisma.admin.upsert({
    where: { username: 'moderator' },
    update: {},
    create: {
      username: 'moderator',
      password_hash: moderatorPassword,
      role: 'MODERATOR'
    }
  });

  console.log('✅ Moderator created:', moderator.username);

  // Create sample users
  const sampleUsers = [
    {
      google_id: 'google_123456789',
      name: 'John Doe',
      email: 'john.doe@example.com',
      profile_picture: 'https://via.placeholder.com/150',
      status: 'ACTIVE'
    },
    {
      google_id: 'google_987654321',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      profile_picture: 'https://via.placeholder.com/150',
      status: 'ACTIVE'
    }
  ];

  for (const userData of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData
    });
    console.log('✅ User created:', user.email);
  }

  // Create sample fraud reports
  const users = await prisma.user.findMany();
  if (users.length > 0) {
    const sampleReports = [
      {
        user_id: users[0].user_id,
        phone: '+1234567890',
        description: 'This phone number is being used for fraudulent activities. They called me claiming to be from a bank and asked for my personal information.',
        status: 'APPROVED',
        approved_at: new Date(),
        approved_by: superAdmin.admin_id
      },
      {
        user_id: users[0].user_id,
        email: 'scammer@fakebank.com',
        description: 'Received phishing emails from this address trying to steal login credentials.',
        status: 'APPROVED',
        approved_at: new Date(),
        approved_by: superAdmin.admin_id
      },
      {
        user_id: users[1].user_id,
        facebook_id: 'facebook.com/fakeprofile',
        description: 'This Facebook profile is impersonating a legitimate business and scamming customers.',
        status: 'PENDING'
      }
    ];

    for (const reportData of sampleReports) {
      const report = await prisma.fraudReport.create({
        data: reportData
      });
      console.log('✅ Fraud report created:', report.identity_value);
    }
  }

  // Create language content
  const languageContent = [
    // English content
    { content_key: 'site_title', language: 'EN', content_value: 'Fraud Checker' },
    { content_key: 'site_description', language: 'EN', content_value: 'Check if a phone number, email, or Facebook profile is associated with fraud' },
    { content_key: 'search_placeholder', language: 'EN', content_value: 'Enter phone number, email, or Facebook profile...' },
    { content_key: 'submit_report', language: 'EN', content_value: 'Submit Report' },
    { content_key: 'admin_login', language: 'EN', content_value: 'Admin Login' },
    { content_key: 'pending_reports', language: 'EN', content_value: 'Pending Reports' },
    { content_key: 'approved_reports', language: 'EN', content_value: 'Approved Reports' },
    { content_key: 'rejected_reports', language: 'EN', content_value: 'Rejected Reports' },
    
    // Bengali content
    { content_key: 'site_title', language: 'BN', content_value: 'জালিয়াতি চেকার' },
    { content_key: 'site_description', language: 'BN', content_value: 'চেক করুন একটি ফোন নম্বর, ইমেইল, বা ফেসবুক প্রোফাইল জালিয়াতির সাথে যুক্ত কিনা' },
    { content_key: 'search_placeholder', language: 'BN', content_value: 'ফোন নম্বর, ইমেইল, বা ফেসবুক প্রোফাইল লিখুন...' },
    { content_key: 'submit_report', language: 'BN', content_value: 'রিপোর্ট জমা দিন' },
    { content_key: 'admin_login', language: 'BN', content_value: 'অ্যাডমিন লগইন' },
    { content_key: 'pending_reports', language: 'BN', content_value: 'মুলতুবি রিপোর্ট' },
    { content_key: 'approved_reports', language: 'BN', content_value: 'অনুমোদিত রিপোর্ট' },
    { content_key: 'rejected_reports', language: 'BN', content_value: 'প্রত্যাখ্যান রিপোর্ট' }
  ];

  for (const content of languageContent) {
    await prisma.languageContent.upsert({
      where: {
        content_key_language: {
          content_key: content.content_key,
          language: content.language
        }
      },
      update: { content_value: content.content_value },
      create: content
    });
  }

  console.log('✅ Language content created');

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Default Admin Credentials:');
  console.log('Super Admin: superadmin / admin123');
  console.log('Moderator: moderator / moderator123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
