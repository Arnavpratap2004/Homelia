import { authService } from './src/services/auth.service.js';
import { prisma } from './src/config/database.js';
import { Role } from '@prisma/client';

async function main() {
    console.log('🧪 Testing B2B Registration...');

    const email = `test-b2b-${Date.now()}@example.com`;
    console.log(`Using email: ${email}`);

    try {
        const result = await authService.register({
            email,
            password: 'password123',
            name: 'Test B2B User',
            phone: '9876543210',
            role: 'B2B_CUSTOMER' as Role, // Force cast string to Role to match interface
            companyName: 'Test Corp'
        });

        console.log('✅ Registration SUCCESS');
        console.log('User ID:', result.user.id);
        console.log('User Role:', result.user.role);

        if (result.user.role === 'B2B_CUSTOMER') {
            console.log('✨ Role is correctly set to B2B_CUSTOMER');
        } else {
            console.log('❌ Role MISMATCH! Expected B2B_CUSTOMER, got:', result.user.role);
        }

        // Cleanup
        await prisma.user.delete({ where: { id: result.user.id } });
        console.log('🧹 Cleanup done');

    } catch (error) {
        console.error('❌ Registration FAILED:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
