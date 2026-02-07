import prisma from '../config/database';
import { AVAILABLE_MODULES } from '../controllers/roleController';

async function seedRoles() {
  try {
    console.log('Seeding default system roles...');

    // Define default system roles with their permissions
    const defaultRoles = [
      {
        name: 'ADMIN',
        description: 'Full system access with all permissions',
        isSystem: true,
        permissions: AVAILABLE_MODULES.map((m) => m.id),
      },
      {
        name: 'MANAGER',
        description: 'Advanced operations with most permissions',
        isSystem: true,
        permissions: AVAILABLE_MODULES.filter((m) => m.id !== 'staff').map((m) => m.id),
      },
      {
        name: 'STAFF',
        description: 'Basic operations for daily tasks',
        isSystem: true,
        permissions: ['dashboard', 'loans', 'people', 'transactions', 'deposits'],
      },
      {
        name: 'VIEWER',
        description: 'Read-only access to view data',
        isSystem: true,
        permissions: ['dashboard', 'books', 'loans', 'people', 'transactions', 'reports'],
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      });

      if (existingRole) {
        // Update existing role
        await prisma.role.update({
          where: { name: roleData.name },
          data: {
            description: roleData.description,
            permissions: JSON.stringify(roleData.permissions),
            isSystem: roleData.isSystem,
          },
        });
        console.log(`Updated role: ${roleData.name}`);
      } else {
        // Create new role
        await prisma.role.create({
          data: {
            name: roleData.name,
            description: roleData.description,
            permissions: JSON.stringify(roleData.permissions),
            isSystem: roleData.isSystem,
          },
        });
        console.log(`Created role: ${roleData.name}`);
      }
    }

    console.log('✅ Default roles seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding roles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedRoles()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default seedRoles;

