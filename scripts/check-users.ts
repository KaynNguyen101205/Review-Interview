// Quick script to check users in database
// Run with: npx tsx scripts/check-users.ts

import { prisma } from "../lib/prisma"

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        school: true,
        gradYear: true,
        major: true,
        createdAt: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    console.log(`\n📊 Found ${users.length} user(s) in database:\n`)
    
    if (users.length === 0) {
      console.log("No users found. Try signing up first!")
      return
    }

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name || "No name"}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Role: ${user.role}`)
      if (user.school) console.log(`   School: ${user.school}`)
      if (user.gradYear) console.log(`   Grad Year: ${user.gradYear}`)
      if (user.major) console.log(`   Major: ${user.major}`)
      if (user.accounts.length > 0) {
        console.log(`   Sign-in method: ${user.accounts.map(a => a.provider).join(", ")}`)
      } else {
        console.log(`   Sign-in method: Email/Password`)
      }
      console.log(`   Created: ${user.createdAt.toLocaleString()}`)
      console.log("")
    })
  } catch (error) {
    console.error("Error checking users:", error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()

