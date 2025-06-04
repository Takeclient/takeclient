import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'

// Initialize Prisma Client
const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'admin@clicksalesmedia',
      },
    })

    if (existingUser) {
      console.log('Admin user already exists.')
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Azerty@123123', 10)

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@clicksalesmedia',
        password: hashedPassword,
        role: Role.ADMIN,
      },
    })

    console.log('Admin user created successfully:', adminUser.id)
  } catch (error) {
    console.error('Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
