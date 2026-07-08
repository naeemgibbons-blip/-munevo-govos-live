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

  console.log('Seeding Newark Staff directory (Employees & Certifications)...');
  await prisma.timesheet.deleteMany();
  await prisma.certification.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.auditLog.deleteMany();

  const empElena = await prisma.employee.create({
    data: {
      organizationId: newark.id,
      firstName: 'Elena',
      lastName: 'Rostova',
      email: 'elena.rostova@newark.gov',
      department: 'Code Enforcement',
      hireDate: new Date('2023-03-15')
    }
  });

  const empMarcus = await prisma.employee.create({
    data: {
      organizationId: newark.id,
      firstName: 'Marcus',
      lastName: 'Miller',
      email: 'marcus.miller@newark.gov',
      department: 'Public Works',
      hireDate: new Date('2022-06-10')
    }
  });

  const empBob = await prisma.employee.create({
    data: {
      organizationId: newark.id,
      firstName: 'Bob',
      lastName: 'Carter',
      email: 'bob.carter@newark.gov',
      department: 'Legal & Compliance',
      hireDate: new Date('2024-01-10')
    }
  });

  await prisma.certification.createMany({
    data: [
      {
        employeeId: empElena.id,
        name: 'Structural Building Inspector Level II',
        credentialId: 'CERT-STR-2025-09',
        issuedDate: new Date('2025-09-15'),
        expiresAt: new Date('2026-12-15')
      },
      {
        employeeId: empElena.id,
        name: 'Zoning Board Review Certification',
        credentialId: 'CERT-ZON-2024-11',
        issuedDate: new Date('2024-11-20'),
        expiresAt: new Date('2026-08-30') // Soon expiring!
      },
      {
        employeeId: empMarcus.id,
        name: 'Municipal Lead Water Technician',
        credentialId: 'CERT-WAT-2023-04',
        issuedDate: new Date('2023-04-01'),
        expiresAt: new Date('2027-04-01')
      }
    ]
  });

  await prisma.timesheet.createMany({
    data: [
      { employeeId: empElena.id, date: new Date('2026-07-06'), hoursWorked: 8.0, notes: 'Completed structural reviews on Washington St' },
      { employeeId: empElena.id, date: new Date('2026-07-07'), hoursWorked: 8.5, notes: 'Code violations audits' },
      { employeeId: empMarcus.id, date: new Date('2026-07-06'), hoursWorked: 8.0, notes: 'Water pressure sensor inspections' },
      { employeeId: empMarcus.id, date: new Date('2026-07-07'), hoursWorked: 7.5, notes: 'Main line flush' }
    ]
  });

  console.log('Seeding initial Audit Logs...');
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: newark.id,
        userId: 'simulated-user-global_admin',
        userEmail: 'global_admin@munevo.gov',
        action: 'CREATE',
        tableName: 'Organization',
        recordId: newark.id,
        newValues: { name: 'City of Newark', slug: 'newark' }
      },
      {
        organizationId: newark.id,
        userId: 'simulated-user-mayor',
        userEmail: 'mayor@munevo.gov',
        action: 'UPDATE',
        tableName: 'CustomRole',
        recordId: 'role-water-lead',
        newValues: { name: 'Water Dept Lead', module: 'tracker', canEdit: true }
      },
      {
        organizationId: newark.id,
        userId: 'simulated-user-inspector',
        userEmail: 'inspector@munevo.gov',
        action: 'APPROVE',
        tableName: 'Permit',
        recordId: 'BP-2026-0145',
        newValues: { status: 'Approved' }
      }
    ]
  });

  console.log('Seeding Open Records requests...');
  await prisma.openRecordsRequest.deleteMany();
  await prisma.openRecordsRequest.createMany({
    data: [
      {
        organizationId: newark.id,
        requesterName: 'John Miller (Newark Ledger)',
        requesterEmail: 'j.miller@newarkledger.com',
        description: 'Copy of council voting sheets and final Redevelopment Agreement signed with DCF Developers, LLC for Market Street Enclaves on June 18, 2026.',
        dateRange: 'June 2026',
        status: 'Fulfilled',
        assignedTo: 'City Clerk'
      },
      {
        organizationId: newark.id,
        requesterName: 'Sarah Thompson',
        requesterEmail: 'sthompson@ironboundcoalition.org',
        description: 'Water lead content test reports conducted at local school facilities in the Ironbound district between January 1, 2026 and June 30, 2026.',
        dateRange: 'Jan 2026 - Jun 2026',
        status: 'Under Review',
        assignedTo: 'Water Dept Lead'
      }
    ]
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
