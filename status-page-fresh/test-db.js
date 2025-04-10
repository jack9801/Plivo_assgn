const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function main() {
  try {
    console.log('Attempting to connect to database...')
    const result = await prisma.$queryRaw`SELECT current_database()`
    console.log('Connected to database:', result)
    
    console.log('Checking for existing users...')
    const users = await prisma.user.findMany()
    console.log('Existing users:', users)

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    })
  } finally {
    await prisma.$disconnect()
  }
}

main() 