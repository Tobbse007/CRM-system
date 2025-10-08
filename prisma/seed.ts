import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding database...');

  // Cleanup existing data
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();

  // Create Clients
  const client1 = await prisma.client.create({
    data: {
      name: 'Max Mustermann',
      email: 'max@musterfirma.de',
      phone: '+49 123 456789',
      company: 'Musterfirma GmbH',
      website: 'https://musterfirma.de',
      status: 'ACTIVE',
    },
  });

  const client2 = await prisma.client.create({
    data: {
      name: 'Anna Schmidt',
      email: 'anna@designstudio.de',
      phone: '+49 987 654321',
      company: 'Design Studio Berlin',
      website: 'https://designstudio-berlin.de',
      status: 'ACTIVE',
    },
  });

  const client3 = await prisma.client.create({
    data: {
      name: 'Thomas Weber',
      email: 'thomas@techstart.io',
      phone: '+49 555 123456',
      company: 'TechStart Innovation',
      website: 'https://techstart.io',
      status: 'INACTIVE',
    },
  });

  console.log('✅ Created 3 clients');

  // Create Projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Corporate Website Redesign',
      description: 'Komplette Neugestaltung der Firmenwebsite mit modernem Design und CMS',
      clientId: client1.id,
      status: 'IN_PROGRESS',
      budget: 15000,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-03-31'),
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'E-Commerce Platform',
      description: 'Entwicklung eines Online-Shops mit Shopify',
      clientId: client1.id,
      status: 'PLANNING',
      budget: 25000,
      startDate: new Date('2025-02-01'),
      endDate: new Date('2025-05-15'),
    },
  });

  const project3 = await prisma.project.create({
    data: {
      name: 'Brand Identity Package',
      description: 'Logo, Corporate Design, Geschäftsausstattung',
      clientId: client2.id,
      status: 'REVIEW',
      budget: 8000,
      startDate: new Date('2024-12-01'),
      endDate: new Date('2025-02-28'),
    },
  });

  const project4 = await prisma.project.create({
    data: {
      name: 'Social Media Kampagne',
      description: 'Instagram & LinkedIn Content für 3 Monate',
      clientId: client2.id,
      status: 'IN_PROGRESS',
      budget: 5000,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-03-31'),
    },
  });

  const project5 = await prisma.project.create({
    data: {
      name: 'MVP Webapplikation',
      description: 'Erste Version der SaaS-Plattform',
      clientId: client3.id,
      status: 'PLANNING',
      budget: 35000,
      startDate: new Date('2025-03-01'),
      endDate: new Date('2025-08-31'),
    },
  });

  console.log('✅ Created 5 projects');

  // Create Tasks
  await prisma.task.createMany({
    data: [
      // Project 1 Tasks
      {
        title: 'Wireframes erstellen',
        description: 'Wireframes für alle Hauptseiten',
        projectId: project1.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2025-01-20'),
      },
      {
        title: 'Design-System aufbauen',
        description: 'Farben, Typografie, Komponenten definieren',
        projectId: project1.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2025-10-12'),
      },
      {
        title: 'Content Migration',
        description: 'Alte Inhalte ins neue CMS übertragen',
        projectId: project1.id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2025-10-15'),
      },
      // Project 2 Tasks
      {
        title: 'Shopify Theme auswählen',
        description: 'Passendes Theme evaluieren und kaufen',
        projectId: project2.id,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date('2025-02-05'),
      },
      {
        title: 'Produktkatalog vorbereiten',
        description: 'Alle Produktdaten strukturieren',
        projectId: project2.id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2025-02-10'),
      },
      // Project 3 Tasks
      {
        title: 'Logo-Konzepte präsentieren',
        description: '3 verschiedene Logo-Varianten zeigen',
        projectId: project3.id,
        status: 'DONE',
        priority: 'HIGH',
        dueDate: new Date('2024-12-15'),
      },
      {
        title: 'Finales Logo ausarbeiten',
        description: 'Gewähltes Konzept in allen Formaten',
        projectId: project3.id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2025-10-10'),
      },
      // Project 4 Tasks
      {
        title: 'Content-Plan Februar',
        description: '15 Posts für Instagram & LinkedIn',
        projectId: project4.id,
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2025-10-14'),
      },
      {
        title: 'Fotoshooting organisieren',
        description: 'Termin mit Fotografen vereinbaren',
        projectId: project4.id,
        status: 'TODO',
        priority: 'LOW',
        dueDate: new Date('2025-10-20'),
      },
      // Project 5 Tasks
      {
        title: 'Tech-Stack finalisieren',
        description: 'Entscheidung über Framework und Datenbank',
        projectId: project5.id,
        status: 'TODO',
        priority: 'HIGH',
        dueDate: new Date('2025-10-18'),
      },
    ],
  });

  console.log('✅ Created 10 tasks');

  // Create Notes
  await prisma.note.createMany({
    data: [
      {
        title: 'Kick-off Meeting Notizen',
        content: 'Kunde wünscht minimalistische Design. Wichtig: Mobile-First Ansatz. Zielgruppe: 25-45 Jahre.',
        projectId: project1.id,
      },
      {
        title: 'Design Feedback Runde 1',
        content: 'Kunde mag die Farbpalette. Header soll größer werden. Mehr Whitespace gewünscht.',
        projectId: project1.id,
      },
      {
        title: 'Shopify Account Details',
        content: 'Zugangsdaten: shop-url.myshopify.com - Wird nach Go-Live auf eigene Domain umgezogen.',
        projectId: project2.id,
      },
      {
        title: 'Logo Feedback',
        content: 'Variante 2 wurde gewählt. Änderungen: Schrift etwas dünner, Icon etwas größer.',
        projectId: project3.id,
      },
      {
        title: 'Social Media Guidelines',
        content: 'Tonalität: Professionell aber freundlich. Hashtags immer mit #DesignBerlin. Posts bis 12 Uhr.',
        projectId: project4.id,
      },
    ],
  });

  console.log('✅ Created 5 notes');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
