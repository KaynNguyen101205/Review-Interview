const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  const adminEmail = "nguyenkayn5@gmail.com"
  const adminPassword = "Namkhanh101205@"

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingAdmin) {
    // Update existing user to be admin
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        role: "ADMIN",
        password: hashedPassword, // Update password in case it changed
      },
    })
    console.log(`✅ Admin user updated: ${adminEmail}`)
  } else {
    // Create new admin user
    const hashedPassword = await bcrypt.hash(adminPassword, 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin",
        role: "ADMIN",
      },
    })
    console.log(`✅ Admin user created: ${adminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

