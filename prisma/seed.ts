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
  await prisma.invite.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.customRole.deleteMany();
  await prisma.organization.deleteMany();

  console.log('Seeding Organizations...');
  const newark = await prisma.organization.create({
    data: {
      name: 'City of Newark',
      slug: 'newark'
    }
  });

  const austin = await prisma.organization.create({
    data: {
      name: 'City of Austin',
      slug: 'austin'
    }
  });

  console.log('Seeding Newark Custom Roles & Permissions...');
  // Newark Custom Role: Code Enforcement Officer
  const roleCodeOfficer = await prisma.customRole.create({
    data: {
      organizationId: newark.id,
      name: 'Code Enforcement Officer'
    }
  });

  await prisma.permission.createMany({
    data: [
      { roleId: roleCodeOfficer.id, module: 'code-enforcement', canView: true, canEdit: true },
      { roleId: roleCodeOfficer.id, module: 'gis', canView: true, canEdit: false },
      { roleId: roleCodeOfficer.id, module: 'tracker', canView: true, canEdit: false },
      { roleId: roleCodeOfficer.id, module: 'command-center', canView: true, canEdit: false },
      { roleId: roleCodeOfficer.id, module: 'permits', canView: true, canEdit: false },
      { roleId: roleCodeOfficer.id, module: 'legislative', canView: true, canEdit: false }
    ]
  });

  // Newark Custom Role: Building Inspector
  const roleInspector = await prisma.customRole.create({
    data: {
      organizationId: newark.id,
      name: 'Building Inspector'
    }
  });

  await prisma.permission.createMany({
    data: [
      { roleId: roleInspector.id, module: 'code-enforcement', canView: true, canEdit: true },
      { roleId: roleInspector.id, module: 'permits', canView: true, canEdit: true },
      { roleId: roleInspector.id, module: 'tracker', canView: true, canEdit: true },
      { roleId: roleInspector.id, module: 'command-center', canView: true, canEdit: false },
      { roleId: roleInspector.id, module: 'gis', canView: true, canEdit: true },
      { roleId: roleInspector.id, module: 'legislative', canView: true, canEdit: false }
    ]
  });

  console.log('Seeding Profiles (User Sessions)...');
  // 1. Global Admin Profile
  await prisma.profile.create({
    data: {
      id: 'simulated-user-global_admin',
      email: 'global_admin@munevo.gov',
      isGlobalAdmin: true,
      isOrgAdmin: false,
      organizationId: null,
      roleId: null
    }
  });

  // 2. Newark Org Admin Profile (Mayor/City Manager)
  await prisma.profile.create({
    data: {
      id: 'simulated-user-mayor',
      email: 'mayor@munevo.gov',
      isGlobalAdmin: false,
      isOrgAdmin: true,
      organizationId: newark.id,
      roleId: null
    }
  });

  // 3. Newark Staff Inspector Profile
  await prisma.profile.create({
    data: {
      id: 'simulated-user-inspector',
      email: 'inspector@munevo.gov',
      isGlobalAdmin: false,
      isOrgAdmin: false,
      organizationId: newark.id,
      roleId: roleInspector.id
    }
  });

  // 4. Newark Resident Profile
  await prisma.profile.create({
    data: {
      id: 'simulated-user-resident',
      email: 'resident@munevo.gov',
      isGlobalAdmin: false,
      isOrgAdmin: false,
      organizationId: newark.id,
      roleId: null
    }
  });

  console.log('Seeding Newark NJ Operational Data...');
  for (const [key, p] of Object.entries(PROPERTIES)) {
    await prisma.property.create({
      data: {
        id: p.id,
        organizationId: newark.id,
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

  const biz1 = await prisma.business.create({
    data: {
      organizationId: newark.id,
      name: 'DCF Developers, LLC',
      sector: 'Real Estate & Construction',
      complianceRating: 'Grade A'
    }
  });

  await prisma.business.create({
    data: {
      organizationId: newark.id,
      name: 'Silva Bakery & Café',
      sector: 'Food Services',
      complianceRating: 'Grade A'
    }
  });

  const proj1 = await prisma.project.create({
    data: {
      id: 'proj_01',
      organizationId: newark.id,
      name: 'West Ward Redevelopment Project',
      status: 'Active',
      businessId: biz1.id
    }
  });

  for (const [key, perm] of Object.entries(PERMITS)) {
    let projectId: string | null = null;
    if (perm.permitNumber === 'BP-2026-0145') {
      projectId = proj1.id;
    }

    await prisma.permit.create({
      data: {
        id: perm.id,
        organizationId: newark.id,
        permitNumber: perm.permitNumber,
        type: perm.type,
        status: perm.status,
        estimatedCost: perm.estimatedCost,
        propertyId: perm.propertyId,
        projectId: projectId
      }
    });
  }

  for (const [key, insp] of Object.entries(INSPECTIONS)) {
    await prisma.inspection.create({
      data: {
        id: insp.id,
        organizationId: newark.id,
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

  for (const item of TRACKER_ITEMS) {
    let propertyId = 'prop_01'; 
    const matchingProp = Object.values(PROPERTIES).find(p => p.address === item.address);
    if (matchingProp) {
      propertyId = matchingProp.id;
    }

    await prisma.trackerItem.create({
      data: {
        id: item.id,
        organizationId: newark.id,
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

  console.log('Seeding Austin TX Operational Data...');
  const austinProp1 = await prisma.property.create({
    data: {
      id: 'austin_prop_01',
      organizationId: austin.id,
      address: '301 Congress Ave, Austin, TX',
      zipCode: '78701',
      ownerName: 'Austin Congress Holdings',
      assessedValue: 4500000.0,
      taxStatus: 'Paid',
      zoningDistrict: 'CBD (Central Business District)',
      notes: 'High-rise commercial structure'
    }
  });

  const austinBiz = await prisma.business.create({
    data: {
      organizationId: austin.id,
      name: 'Lone Star Builders',
      sector: 'General Contracting',
      complianceRating: 'Grade A'
    }
  });

  const austinProj = await prisma.project.create({
    data: {
      id: 'austin_proj_01',
      organizationId: austin.id,
      name: 'Austin Downtown Plaza',
      status: 'Active',
      businessId: austinBiz.id
    }
  });

  const austinPermit = await prisma.permit.create({
    data: {
      id: 'austin_perm_01',
      organizationId: austin.id,
      permitNumber: 'BP-2026-9901',
      type: 'Building',
      status: 'Issued',
      estimatedCost: 120000.0,
      propertyId: austinProp1.id,
      projectId: austinProj.id
    }
  });

  await prisma.inspection.create({
    data: {
      id: 'austin_insp_01',
      organizationId: austin.id,
      type: 'Foundation',
      scheduledDate: new Date('2026-08-10'),
      status: 'Passed',
      inspectorName: 'Bob Carter',
      notes: 'Foundation structural compliance met',
      propertyId: austinProp1.id,
      permitId: austinPermit.id
    }
  });

  await prisma.trackerItem.create({
    data: {
      id: 'austin_track_01',
      organizationId: austin.id,
      module: 'tracker',
      title: 'Austin Downtown Plaza Site Review',
      status: 'Open',
      priority: 'High',
      assignedTo: 'Bob Carter',
      reportedDate: new Date(),
      slaDays: 14,
      slaProgress: 30,
      propertyId: austinProp1.id
    }
  });

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
