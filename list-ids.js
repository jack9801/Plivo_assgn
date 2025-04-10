const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:sql123@localhost:5432/status_page?schema=public"
    }
  }
});

async function listIds() {
  try {
    const services = await prisma.service.findMany();
    console.log('\nServices:');
    services.forEach(service => {
      console.log(`${service.name}: ${service.id}`);
    });

    const incidents = await prisma.incident.findMany();
    console.log('\nIncidents:');
    incidents.forEach(incident => {
      console.log(`${incident.title}: ${incident.id}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listIds(); 