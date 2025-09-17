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
    },
    {
      google_id: 'google_555666777',
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      profile_picture: 'https://via.placeholder.com/150',
      status: 'ACTIVE'
    },
    {
      google_id: 'google_111222333',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@example.com',
      profile_picture: 'https://via.placeholder.com/150',
      status: 'SUSPENDED'
    },
    {
      name: 'Test User',
      email: 'test@example.com',
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
  let sampleReports = [];
  if (users.length > 0) {
    sampleReports = [
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
      },
      {
        user_id: users[1].user_id,
        phone: '+9876543210',
        description: 'SMS scam messages asking for OTP and personal details.',
        status: 'REJECTED',
        rejection_reason: 'Insufficient evidence provided'
      },
      {
        user_id: users[0].user_id,
        email: 'fake@investment.com',
        description: 'Investment scam email promising unrealistic returns.',
        status: 'APPROVED',
        approved_at: new Date(),
        approved_by: moderator.admin_id
      },
      {
        user_id: users[2].user_id,
        phone: '+1122334455',
        description: 'Robocall scam asking for social security number.',
        status: 'PENDING'
      },
      {
        user_id: users[2].user_id,
        email: 'noreply@fakebank.com',
        description: 'Phishing email pretending to be from a bank.',
        status: 'APPROVED',
        approved_at: new Date(),
        approved_by: superAdmin.admin_id
      },
      {
        user_id: users[3].user_id,
        facebook_id: 'facebook.com/scammer123',
        description: 'Fake profile selling counterfeit products.',
        status: 'REJECTED',
        rejection_reason: 'Profile appears to be legitimate business'
      }
    ];

    for (const reportData of sampleReports) {
      const report = await prisma.fraudReport.create({
        data: reportData
      });
      const identityValue = reportData.phone || reportData.email || reportData.facebook_id;
      console.log('✅ Fraud report created:', identityValue);
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
    { content_key: 'search_button', language: 'EN', content_value: 'Search' },
    { content_key: 'report_fraud', language: 'EN', content_value: 'Report Fraud' },
    { content_key: 'phone_number', language: 'EN', content_value: 'Phone Number' },
    { content_key: 'email_address', language: 'EN', content_value: 'Email Address' },
    { content_key: 'facebook_profile', language: 'EN', content_value: 'Facebook Profile' },
    { content_key: 'description', language: 'EN', content_value: 'Description' },
    { content_key: 'upload_images', language: 'EN', content_value: 'Upload Images' },
    { content_key: 'status', language: 'EN', content_value: 'Status' },
    { content_key: 'created_at', language: 'EN', content_value: 'Created At' },
    { content_key: 'no_reports_found', language: 'EN', content_value: 'No reports found' },
    { content_key: 'login_required', language: 'EN', content_value: 'Login Required' },
    { content_key: 'admin_dashboard', language: 'EN', content_value: 'Admin Dashboard' },
    { content_key: 'total_users', language: 'EN', content_value: 'Total Users' },
    { content_key: 'total_reports', language: 'EN', content_value: 'Total Reports' },
    { content_key: 'recent_activity', language: 'EN', content_value: 'Recent Activity' },
    
    // Bengali content
    { content_key: 'site_title', language: 'BN', content_value: 'জালিয়াতি চেকার' },
    { content_key: 'site_description', language: 'BN', content_value: 'চেক করুন একটি ফোন নম্বর, ইমেইল, বা ফেসবুক প্রোফাইল জালিয়াতির সাথে যুক্ত কিনা' },
    { content_key: 'search_placeholder', language: 'BN', content_value: 'ফোন নম্বর, ইমেইল, বা ফেসবুক প্রোফাইল লিখুন...' },
    { content_key: 'submit_report', language: 'BN', content_value: 'রিপোর্ট জমা দিন' },
    { content_key: 'admin_login', language: 'BN', content_value: 'অ্যাডমিন লগইন' },
    { content_key: 'pending_reports', language: 'BN', content_value: 'মুলতুবি রিপোর্ট' },
    { content_key: 'approved_reports', language: 'BN', content_value: 'অনুমোদিত রিপোর্ট' },
    { content_key: 'rejected_reports', language: 'BN', content_value: 'প্রত্যাখ্যান রিপোর্ট' },
    { content_key: 'search_button', language: 'BN', content_value: 'খুঁজুন' },
    { content_key: 'report_fraud', language: 'BN', content_value: 'জালিয়াতি রিপোর্ট করুন' },
    { content_key: 'phone_number', language: 'BN', content_value: 'ফোন নম্বর' },
    { content_key: 'email_address', language: 'BN', content_value: 'ইমেইল ঠিকানা' },
    { content_key: 'facebook_profile', language: 'BN', content_value: 'ফেসবুক প্রোফাইল' },
    { content_key: 'description', language: 'BN', content_value: 'বিবরণ' },
    { content_key: 'upload_images', language: 'BN', content_value: 'ছবি আপলোড করুন' },
    { content_key: 'status', language: 'BN', content_value: 'অবস্থা' },
    { content_key: 'created_at', language: 'BN', content_value: 'তৈরি হয়েছে' },
    { content_key: 'no_reports_found', language: 'BN', content_value: 'কোন রিপোর্ট পাওয়া যায়নি' },
    { content_key: 'login_required', language: 'BN', content_value: 'লগইন প্রয়োজন' },
    { content_key: 'admin_dashboard', language: 'BN', content_value: 'অ্যাডমিন ড্যাশবোর্ড' },
    { content_key: 'total_users', language: 'BN', content_value: 'মোট ব্যবহারকারী' },
    { content_key: 'total_reports', language: 'BN', content_value: 'মোট রিপোর্ট' },
    { content_key: 'recent_activity', language: 'BN', content_value: 'সাম্প্রতিক কার্যক্রম' }
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

  // Create sample report images for approved reports
  const approvedReports = await prisma.fraudReport.findMany({
    where: { status: 'APPROVED' },
    take: 2
  });

  for (const report of approvedReports) {
    const sampleImages = [
      {
        report_id: report.report_id,
        image_filename: `evidence_${report.report_id}_1.png`,
        image_path: `/uploads/images/evidence_${report.report_id}_1.png`,
        image_size: 1024000
      },
      {
        report_id: report.report_id,
        image_filename: `evidence_${report.report_id}_2.png`,
        image_path: `/uploads/images/evidence_${report.report_id}_2.png`,
        image_size: 2048000
      }
    ];

    for (const imageData of sampleImages) {
      await prisma.reportImage.create({
        data: imageData
      });
    }
    console.log(`✅ Report images created for report ${report.report_id}`);
  }

  // Create sample refresh tokens for users
  const allUsers = await prisma.user.findMany();
  for (const user of allUsers) {
    const refreshToken = {
      user_id: user.user_id,
      token: `refresh_${user.user_id}_${Date.now()}`,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    };

    await prisma.refreshToken.create({
      data: refreshToken
    });
    console.log(`✅ Refresh token created for user ${user.email}`);
  }

  console.log('🎉 Database seed completed successfully!');
  console.log('\n📋 Default Admin Credentials:');
  console.log('Super Admin: superadmin / admin123');
  console.log('Moderator: moderator / moderator123');
  console.log('\n📊 Sample Data Created:');
  console.log(`- ${allUsers.length} users`);
  console.log(`- ${sampleReports.length} fraud reports`);
  console.log(`- ${approvedReports.length * 2} report images`);
  console.log(`- ${allUsers.length} refresh tokens`);
  console.log(`- ${languageContent.length} language content entries`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
