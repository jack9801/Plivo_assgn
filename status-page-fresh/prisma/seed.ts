import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a test user
  const hashedPassword = await hash('password123', 12)
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  })

  // Create some initial services
  const webApp = await prisma.service.create({
    data: {
      name: 'Web Application',
      description: 'Main web application service',
      status: 'OPERATIONAL',
    },
  })

  const api = await prisma.service.create({
    data: {
      name: 'API Service',
      description: 'REST API endpoints',
      status: 'OPERATIONAL',
    },
  })

  const database = await prisma.service.create({
    data: {
      name: 'Database',
      description: 'Primary database service',
      status: 'OPERATIONAL',
    },
  })

  // Create some initial incidents
  await prisma.incident.create({
    data: {
      title: 'API Performance Degradation',
      description: 'We are experiencing slower than normal API response times.',
      status: 'INVESTIGATING',
      severity: 'MEDIUM',
      serviceId: api.id,
    },
  })

  await prisma.incident.create({
    data: {
      title: 'Database Connectivity Issues',
      description: 'Some users are experiencing intermittent database connection issues.',
      status: 'RESOLVED',
      severity: 'HIGH',
      serviceId: database.id,
    },
  })

  console.log('Database has been seeded')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 