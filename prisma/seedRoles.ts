import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PermissionTemplate {
  module: string;
  canView: boolean;
  canEdit: boolean;
}

interface RoleTemplate {
  name: string;
  permissions: PermissionTemplate[];
}

// 1. Reusable Role Template List Mapping Municipal Job Functions
export const MUNICIPAL_ROLES_TEMPLATE: RoleTemplate[] = [
  // Executive / Leadership
  {
    name: 'Mayor / City Manager',
    permissions: [
      { module: 'command-center', canView: true, canEdit: true },
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: true },
      { module: 'identity-security', canView: true, canEdit: false },
      { module: 'open-records', canView: true, canEdit: false },
      { module: 'employee-roster', canView: true, canEdit: false },
      { module: 'system-audit', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Deputy City Manager',
    permissions: [
      { module: 'command-center', canView: true, canEdit: true },
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: false },
      { module: 'identity-security', canView: true, canEdit: false },
      { module: 'open-records', canView: true, canEdit: false },
      { module: 'employee-roster', canView: true, canEdit: false },
      { module: 'system-audit', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Chief of Staff',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: true }
    ]
  },
  // Code Enforcement & Inspections
  {
    name: 'Code Enforcement Director',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: true }
    ]
  },
  {
    name: 'Code Enforcement Officer',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: true }
    ]
  },
  {
    name: 'Building Inspector',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: true }
    ]
  },
  {
    name: 'Fire Marshal / Fire Inspector',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: true }
    ]
  },
  {
    name: 'Property Maintenance Inspector',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: true }
    ]
  },
  // Permits & Licensing
  {
    name: 'Permits & Licensing Director',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: true },
      { module: 'code-enforcement', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Permits Clerk',
    permissions: [
      { module: 'tracker', canView: true, canEdit: false },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: true }
    ]
  },
  {
    name: 'Zoning Reviewer',
    permissions: [
      { module: 'tracker', canView: true, canEdit: false },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: true },
      { module: 'code-enforcement', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Business License Examiner',
    permissions: [
      { module: 'tracker', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: true }
    ]
  },
  {
    name: 'Historical Landmarks Reviewer',
    permissions: [
      { module: 'tracker', canView: true, canEdit: false },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: true },
      { module: 'code-enforcement', canView: true, canEdit: false }
    ]
  },
  // Public Works / Infrastructure
  {
    name: 'Public Works Director',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Water Dept Lead',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Sanitation Supervisor',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Streets & Roads Coordinator',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Utilities Field Technician',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false }
    ]
  },
  // 311 / Resident Services
  {
    name: '311 Dispatch Supervisor',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false }
    ]
  },
  {
    name: '311 Call Center Agent',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Resident Services Coordinator',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true }
    ]
  },
  // Legislative / Council
  {
    name: 'City Council President',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: true },
      { module: 'tracker', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Council Member',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: true },
      { module: 'tracker', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Legislative Aide',
    permissions: [
      { module: 'legislative', canView: true, canEdit: true },
      { module: 'tracker', canView: true, canEdit: false }
    ]
  },
  {
    name: 'City Clerk',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: true },
      { module: 'tracker', canView: true, canEdit: false },
      { module: 'open-records', canView: true, canEdit: true }
    ]
  },
  // Finance / Administration
  {
    name: 'Finance Director / Treasurer',
    permissions: [
      { module: 'command-center', canView: true, canEdit: true },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Budget Analyst',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Procurement Officer',
    permissions: [
      { module: 'command-center', canView: true, canEdit: false },
      { module: 'permits', canView: true, canEdit: true }
    ]
  },
  {
    name: 'HR / Personnel Manager',
    permissions: [
      { module: 'identity-security', canView: true, canEdit: true },
      { module: 'employee-roster', canView: true, canEdit: true }
    ]
  },
  // Legal / Compliance
  {
    name: 'City Attorney',
    permissions: [
      { module: 'tracker', canView: true, canEdit: false },
      { module: 'code-enforcement', canView: true, canEdit: false },
      { module: 'legislative', canView: true, canEdit: true },
      { module: 'identity-security', canView: true, canEdit: false },
      { module: 'open-records', canView: true, canEdit: true },
      { module: 'employee-roster', canView: true, canEdit: false },
      { module: 'system-audit', canView: true, canEdit: false }
    ]
  },
  {
    name: 'Compliance Officer',
    permissions: [
      { module: 'tracker', canView: true, canEdit: true },
      { module: 'code-enforcement', canView: true, canEdit: true },
      { module: 'legislative', canView: true, canEdit: false },
      { module: 'identity-security', canView: true, canEdit: false },
      { module: 'open-records', canView: true, canEdit: true },
      { module: 'employee-roster', canView: true, canEdit: false },
      { module: 'system-audit', canView: true, canEdit: true }
    ]
  },
  // IT / Systems
  {
    name: 'IT Director',
    permissions: [
      { module: 'identity-security', canView: true, canEdit: true },
      { module: 'org-admin', canView: true, canEdit: true },
      { module: 'gis', canView: true, canEdit: true },
      { module: 'employee-roster', canView: true, canEdit: true },
      { module: 'system-audit', canView: true, canEdit: true }
    ]
  },
  {
    name: 'GIS Analyst',
    permissions: [
      { module: 'identity-security', canView: true, canEdit: false },
      { module: 'gis', canView: true, canEdit: true }
    ]
  }
];

// 2. Reusable seed function
export async function seedMunicipalRoles(orgId: string) {
  console.log(`Seeding dynamic RBAC template roles for organization ${orgId}...`);
  
  let seededCount = 0;
  for (const roleTemp of MUNICIPAL_ROLES_TEMPLATE) {
    // Upsert role to prevent duplicates on rerun
    const role = await prisma.customRole.upsert({
      where: {
        organizationId_name: {
          organizationId: orgId,
          name: roleTemp.name
        }
      },
      update: {},
      create: {
        organizationId: orgId,
        name: roleTemp.name
      }
    });

    // Delete existing permissions for this role and rebuild them
    await prisma.permission.deleteMany({
      where: { roleId: role.id }
    });

    const permissionsData = roleTemp.permissions.map(p => ({
      roleId: role.id,
      module: p.module,
      canView: p.canView,
      canEdit: p.canEdit
    }));

    await prisma.permission.createMany({
      data: permissionsData
    });

    seededCount++;
  }
  console.log(`Successfully seeded ${seededCount} custom roles and permissions matrices for org ${orgId}!`);
  return seededCount;
}

// 3. Script main execution entrypoint
async function main() {
  const newark = await prisma.organization.findUnique({
    where: { slug: 'newark' }
  });

  if (!newark) {
    console.error("Newark organization not found. Make sure to run prisma db seed first!");
    process.exit(1);
  }

  await seedMunicipalRoles(newark.id);
  console.log("Template roles successfully seeded into Newark NJ!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

