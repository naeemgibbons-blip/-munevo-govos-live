import { PrismaClient } from '@prisma/client';
import { 
  PROPERTIES, 
  PERMITS, 
  INSPECTIONS, 
  TRACKER_ITEMS 
} from '../src/mockData.ts';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database tables...');
  await prisma.trackerItem.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.project.deleteMany();
  await prisma.business.deleteMany();
  await prisma.property.deleteMany();

  console.log('Seeding Properties...');
  for (const [key, p] of Object.entries(PROPERTIES)) {
    await prisma.property.create({
      data: {
        id: p.id,
        address: p.address,
        zipCode: p.zipCode,
        ownerName: p.ownerName,
        assessedValue: p.assessedValue,
        taxStatus: p.taxStatus,
        zoningDistrict: p.zoningDistrict,
        notes: p.notes
      }
    });
  }

  console.log('Seeding Businesses...');
  // Register DCF Developers, LLC and Silva Bakery & Café
  const biz1 = await prisma.business.create({
    data: {
      name: 'DCF Developers, LLC',
      sector: 'Real Estate & Construction',
      complianceRating: 'Grade A'
    }
  });

  const biz2 = await prisma.business.create({
    data: {
      name: 'Silva Bakery & Café',
      sector: 'Food Services',
      complianceRating: 'Grade A'
    }
  });

  console.log('Seeding Projects...');
  const proj1 = await prisma.project.create({
    data: {
      id: 'proj_01',
      name: 'West Ward Redevelopment Project',
      status: 'Active',
      businessId: biz1.id
    }
  });

  console.log('Seeding Permits...');
  for (const [key, perm] of Object.entries(PERMITS)) {
    // Determine if it links to West Ward Redevelopment Project
    let projectId: string | null = null;
    if (perm.permitNumber === 'BP-2026-0145') {
      projectId = proj1.id;
    }

    await prisma.permit.create({
      data: {
        id: perm.id,
        permitNumber: perm.permitNumber,
        type: perm.type,
        status: perm.status,
        estimatedCost: perm.estimatedCost,
        propertyId: perm.propertyId,
        projectId: projectId
      }
    });
  }

  console.log('Seeding Inspections...');
  for (const [key, insp] of Object.entries(INSPECTIONS)) {
    await prisma.inspection.create({
      data: {
        id: insp.id,
        type: insp.type,
        scheduledDate: new Date(insp.scheduledDate),
        status: insp.status,
        inspectorName: insp.inspectorName,
        notes: insp.notes,
        propertyId: insp.propertyId,
        permitId: insp.permitId || null
      }
    });
  }

  console.log('Seeding Universal Tracker Items...');
  for (const item of TRACKER_ITEMS) {
    // Map address to propertyId
    let propertyId = 'prop_01'; // Default
    const matchingProp = Object.values(PROPERTIES).find(p => p.address === item.address);
    if (matchingProp) {
      propertyId = matchingProp.id;
    }

    await prisma.trackerItem.create({
      data: {
        id: item.id,
        module: item.module,
        title: item.title,
        status: item.status,
        priority: item.priority,
        assignedTo: item.assignedTo,
        slaDays: item.slaDays,
        slaProgress: item.slaProgress,
        reportedDate: new Date(item.reportedDate),
        propertyId: propertyId
      }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
