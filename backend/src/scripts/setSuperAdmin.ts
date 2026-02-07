import prisma from '../config/database';

async function setSuperAdmin() {
  try {
    const phone = '9953520620';
    const name = 'Sitambas Patel';

    console.log(`Setting up super admin for phone: ${phone}...`);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          phone,
          name,
        },
      });
      console.log(`✅ Created new user: ${name} (${phone})`);
    } else {
      // Update user name if different
      if (user.name !== name) {
        user = await prisma.user.update({
          where: { phone },
          data: { name },
        });
        console.log(`✅ Updated user name to: ${name}`);
      } else {
        console.log(`✅ User already exists: ${name} (${phone})`);
      }
    }

    // Check if user is in Staff table
    const staff = await prisma.staff.findUnique({
      where: { userId: user.id },
    });

    if (staff) {
      // Remove from Staff table to make them owner
      await prisma.staff.delete({
        where: { userId: user.id },
      });
      console.log(`✅ Removed user from Staff table - now has owner/super admin access`);
    } else {
      console.log(`✅ User is not in Staff table - already has owner/super admin access`);
    }

    console.log('\n✅ Super admin setup complete!');
    console.log(`   Phone: ${phone}`);
    console.log(`   Name: ${name}`);
    console.log(`   Status: Owner (Full Access)`);
  } catch (error) {
    console.error('❌ Error setting up super admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setSuperAdmin()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default setSuperAdmin;

