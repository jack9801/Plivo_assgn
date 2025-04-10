const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getIds() {
  try {
    console.log('Fetching services...')
    const services = await prisma.service.findMany()
    console.log('\nServices:')
    services.forEach(service => {
      console.log(`${service.name}: ${service.id}`)
    })

    console.log('\nFetching incidents...')
    const incidents = await prisma.incident.findMany()
    console.log('\nIncidents:')
    incidents.forEach(incident => {
      console.log(`${incident.title}: ${incident.id}`)
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getIds() 