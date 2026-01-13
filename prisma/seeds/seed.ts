import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@example.com';
    const password = 'admin123'; // Change this!

    // Check if admin exists
    const existingAdmin = await prisma.admin.findUnique({
        where: { email },
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.admin.create({
            data: {
                email,
                password: hashedPassword,
            },
        });
        console.log('Default admin created');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    } else {
        console.log('Admin already exists');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
