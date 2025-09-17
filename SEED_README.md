# Database Seed File

This seed file populates the database with sample data for development and testing purposes.

## What Gets Created

### Admins
- **Super Admin**: `superadmin` / `admin123`
- **Moderator**: `moderator` / `moderator123`

### Users
- 5 sample users with different statuses (ACTIVE, SUSPENDED)
- Mix of Google OAuth users and regular users

### Fraud Reports
- 8 sample fraud reports with different statuses:
  - **Approved**: 4 reports (phone, email, investment scam, phishing)
  - **Pending**: 2 reports (Facebook profile, robocall)
  - **Rejected**: 2 reports (SMS scam, fake profile)

### Report Images
- Sample images for approved reports (2 images per approved report)

### Refresh Tokens
- Active refresh tokens for all users (7-day expiration)

### Language Content
- Comprehensive English and Bengali translations for UI elements
- 24 content keys in both languages

## How to Run

### Prerequisites
1. Make sure your database is set up and running
2. Run Prisma migrations: `npm run db:push` or `npm run db:migrate`

### Run the Seed
```bash
# Using npm
npm run db:seed

# Or directly with node
node prisma/seed.js
```

### Reset and Reseed
If you want to clear existing data and reseed:
```bash
# Reset the database (WARNING: This will delete all data)
npx prisma migrate reset

# Or manually truncate tables and run seed
npm run db:seed
```

## Sample Data Details

### Fraud Report Types
- **Phone Scams**: Robocalls, SMS scams, bank impersonation
- **Email Scams**: Phishing, investment fraud, fake bank emails
- **Facebook Scams**: Fake profiles, counterfeit products, impersonation

### User Statuses
- **ACTIVE**: Normal users who can submit reports
- **SUSPENDED**: Users who have been suspended by admin

### Report Statuses
- **PENDING**: Awaiting admin review
- **APPROVED**: Verified as legitimate fraud
- **REJECTED**: Not considered fraud (with rejection reason)

## Customization

To modify the seed data:
1. Edit the arrays in `prisma/seed.js`
2. Add new sample data following the existing patterns
3. Run `npm run db:seed` to apply changes

## Notes

- The seed file uses `upsert` operations, so it's safe to run multiple times
- Passwords are hashed using bcrypt with 12 rounds
- All timestamps are set to current time when seeded
- Refresh tokens expire after 7 days
