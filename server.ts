import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Log incoming API calls
app.use((req, res, next) => {
  console.log(`[API Call] ${req.method} ${req.path}`);
  next();
});

// Helper: Resolve Newark organization ID as standard fallback
async function getNewarkOrgId() {
  const newark = await prisma.organization.findUnique({
    where: { slug: 'newark' }
  });
  return newark?.id || '';
}

// Helper: Automatically record actions in Audit Log
async function recordAudit(
  orgId: string, 
  userId: string | null, 
  email: string | null, 
  action: string, 
  tableName: string, 
  recordId: string, 
  oldValues: any = null, 
  newValues: any = null
) {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId: orgId,
        userId: userId || 'simulated-system-user',
        userEmail: email || 'system@munevo.gov',
        action,
        tableName,
        recordId,
        oldValues,
        newValues
      }
    });
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
}

// 1. GET: Fetch all properties (filtered by organization)
app.get('/api/properties', async (req, res) => {
  try {
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    
    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    const properties = await prisma.property.findMany({
      where: {
        organizationId: orgId
      },
      include: {
        permits: true,
        inspections: true
      }
    });

    const propertyRecords: Record<string, any> = {};
    properties.forEach((p) => {
      propertyRecords[p.id] = {
        id: p.id,
        address: p.address,
        zipCode: p.zipCode,
        ownerName: p.ownerName,
        assessedValue: p.assessedValue,
        taxStatus: p.taxStatus,
        zoningDistrict: p.zoningDistrict,
        notes: p.notes,
        permits: p.permits.map((perm) => perm.id),
        inspections: p.inspections.map((insp) => insp.id),
        violations: [], 
        utilities: {
          waterAccountNumber: `W-${p.id.replace('prop_', '')}-092`,
          balance: p.taxStatus === 'Delinquent' ? 620.00 : 0.00,
          usageTrend: 'Stable'
        },
        gisCoords: p.address.includes('Leon') 
          ? [110, 230] 
          : p.address.includes('125') 
          ? [330, 310] 
          : p.address.includes('129') 
          ? [350, 310] 
          : p.address.includes('Ferry') 
          ? [420, 410] 
          : p.address.includes('Washington') 
          ? [230, 150] 
          : p.address.includes('105') 
          ? [310, 310] 
          : [250, 350]
      };
    });

    res.json(propertyRecords);
  } catch (error: any) {
    console.error('Error fetching properties:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. GET: Fetch all Universal Tracker items (filtered by organization)
app.get('/api/tracker', async (req, res) => {
  try {
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    
    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    const trackerItems = await prisma.trackerItem.findMany({
      where: {
        organizationId: orgId
      },
      orderBy: {
        reportedDate: 'desc'
      },
      include: {
        property: true
      }
    });

    const formatted = trackerItems.map((item) => {
      return {
        id: item.id,
        module: item.module,
        title: item.title,
        status: item.status,
        priority: item.priority,
        assignedTo: item.assignedTo,
        slaDays: item.slaDays,
        slaProgress: item.slaProgress,
        reportedDate: item.reportedDate.toISOString().split('T')[0],
        address: item.property.address,
        comments: [
          { user: 'Elena Rostova', text: 'Zoning constraints audited and verified.', date: 'Recently' }
        ],
        history: [
          { action: 'Record synchronised to Supabase DB', user: 'Prisma Client', date: 'Synced' }
        ],
        attachments: ['attachment_document.pdf'],
        relatedRecords: [{ type: 'Property', id: item.propertyId, label: item.property.address.split(',')[0] }],
        customFields: {
          'SLA Category': 'Production Sync',
          'Postgres Provider': 'AWS West 2 Pooler'
        }
      };
    });

    res.json(formatted);
  } catch (error: any) {
    console.error('Error fetching tracker:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. POST: Create a new operation tracker item
app.post('/api/tracker', async (req, res) => {
  try {
    const { module, title, status, priority, assignedTo, slaDays, address } = req.body;
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    
    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    let property = await prisma.property.findFirst({
      where: { 
        address,
        organizationId: orgId
      }
    });

    if (!property) {
      property = await prisma.property.create({
        data: {
          organizationId: orgId,
          address,
          zipCode: '07103',
          ownerName: 'Municipal Redevelopment Board',
          assessedValue: 120000,
          taxStatus: 'Paid',
          zoningDistrict: 'MXD-1'
        }
      });
    }

    const newItem = await prisma.trackerItem.create({
      data: {
        organizationId: orgId,
        module: module || '311',
        title,
        status: status || 'Open',
        priority: priority || 'Medium',
        assignedTo: assignedTo || 'Marcus Miller',
        slaDays: slaDays || 14,
        slaProgress: 0,
        propertyId: property.id
      },
      include: {
        property: true
      }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'CREATE', 'TrackerItem', newItem.id, null, newItem);

    const formatted = {
      id: newItem.id,
      module: newItem.module,
      title: newItem.title,
      status: newItem.status,
      priority: newItem.priority,
      assignedTo: newItem.assignedTo,
      slaDays: newItem.slaDays,
      slaProgress: newItem.slaProgress,
      reportedDate: newItem.reportedDate.toISOString().split('T')[0],
      address: newItem.property.address,
      comments: [],
      history: [
        { action: 'Ticket Created in Supabase Database', user: 'Munevo ID', date: 'Just now' }
      ],
      attachments: [],
      relatedRecords: [{ type: 'Property', id: property.id, label: address.split(',')[0] }],
      customFields: {}
    };

    res.status(201).json(formatted);
  } catch (error: any) {
    console.error('Error creating tracker item:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. PUT: Update a tracker item field
app.put('/api/tracker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    const oldItem = await prisma.trackerItem.findUnique({ where: { id } });

    const updatedItem = await prisma.trackerItem.update({
      where: { id },
      data: {
        status,
        priority,
        assignedTo
      },
      include: {
        property: true
      }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'UPDATE', 'TrackerItem', id, oldItem, updatedItem);

    const formatted = {
      id: updatedItem.id,
      module: updatedItem.module,
      title: updatedItem.title,
      status: updatedItem.status,
      priority: updatedItem.priority,
      assignedTo: updatedItem.assignedTo,
      slaDays: updatedItem.slaDays,
      slaProgress: updatedItem.slaProgress,
      reportedDate: updatedItem.reportedDate.toISOString().split('T')[0],
      address: updatedItem.property.address,
      comments: [
        { user: 'Elena Rostova', text: 'Zoning constraints audited and verified.', date: 'Recently' }
      ],
      history: [
        { action: `Fields updated dynamically: Status=${status}, Priority=${priority}`, user: 'Prisma client', date: 'Just now' }
      ],
      attachments: [],
      relatedRecords: [{ type: 'Property', id: updatedItem.propertyId, label: updatedItem.property.address.split(',')[0] }],
      customFields: {}
    };

    res.json(formatted);
  } catch (error: any) {
    console.error('Error updating tracker item:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. GET /api/organizations: List all organizations
app.get('/api/organizations', async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany();
    res.json(orgs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. POST /api/organizations: Create a new organization
app.post('/api/organizations', async (req, res) => {
  const { name, slug } = req.body;
  try {
    const org = await prisma.organization.create({
      data: { name, slug }
    });
    res.status(201).json(org);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. GET /api/invites: List invites
app.get('/api/invites', async (req, res) => {
  const orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    const invites = await prisma.invite.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: {
        organization: true,
        role: true,
        invitedBy: true
      }
    });
    res.json(invites);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. POST /api/invites: Create pending user invitation
app.post('/api/invites', async (req, res) => {
  const { email, isOrgAdmin, roleId, organizationId, invitedById } = req.body;
  try {
    const invite = await prisma.invite.create({
      data: {
        email,
        isOrgAdmin: !!isOrgAdmin,
        roleId: roleId || null,
        organizationId: organizationId || null,
        invitedById,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiration
      }
    });
    res.status(201).json(invite);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. GET /api/profiles: Get profiles list
app.get('/api/profiles', async (req, res) => {
  const orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    const profiles = await prisma.profile.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: {
        organization: true,
        role: true
      }
    });
    res.json(profiles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. POST /api/profiles/sync: Upsert a simulated profile for client login testing
app.post('/api/profiles/sync', async (req, res) => {
  const { id, email, isGlobalAdmin, isOrgAdmin, organizationId, roleId } = req.body;
  try {
    let org = null;
    if (organizationId) {
      org = await prisma.organization.findUnique({
        where: { id: organizationId }
      });
    }

    let role = null;
    if (roleId) {
      role = await prisma.customRole.findUnique({
        where: { id: roleId }
      });
    }

    const profile = await prisma.profile.upsert({
      where: { id },
      update: {
        email,
        isGlobalAdmin: !!isGlobalAdmin,
        isOrgAdmin: !!isOrgAdmin,
        organizationId: org ? organizationId : null,
        roleId: role ? roleId : null
      },
      create: {
        id,
        email,
        isGlobalAdmin: !!isGlobalAdmin,
        isOrgAdmin: !!isOrgAdmin,
        organizationId: org ? organizationId : null,
        roleId: role ? roleId : null
      },
      include: {
        organization: true,
        role: {
          include: { permissions: true }
        }
      }
    });
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. GET /api/custom-roles: List custom roles
app.get('/api/custom-roles', async (req, res) => {
  const orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    const roles = await prisma.customRole.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: {
        permissions: true
      }
    });
    res.json(roles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 12. POST /api/custom-roles: Create role with custom permissions matrix
app.post('/api/custom-roles', async (req, res) => {
  const { name, permissions } = req.body;
  const orgId = req.headers['x-organization-id'] as string;
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;
  
  if (!orgId) {
    return res.status(400).json({ error: 'x-organization-id header is required' });
  }
  
  try {
    const newRole = await prisma.customRole.create({
      data: {
        organizationId: orgId,
        name
      }
    });
    
    if (permissions && Array.isArray(permissions)) {
      const permissionData = permissions.map((p: any) => ({
        roleId: newRole.id,
        module: p.module,
        canView: !!p.canView,
        canEdit: !!p.canEdit
      }));
      await prisma.permission.createMany({
        data: permissionData
      });
    }
    
    const roleWithPermissions = await prisma.customRole.findUnique({
      where: { id: newRole.id },
      include: { permissions: true }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'CREATE', 'CustomRole', newRole.id, null, roleWithPermissions);
    
    res.status(201).json(roleWithPermissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 13. PUT /api/custom-roles/:id/permissions: Update role permissions
app.put('/api/custom-roles/:id/permissions', async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (!orgId) {
    orgId = await getNewarkOrgId();
  }
  
  try {
    const oldRole = await prisma.customRole.findUnique({ where: { id }, include: { permissions: true } });

    await prisma.permission.deleteMany({
      where: { roleId: id }
    });
    
    if (permissions && Array.isArray(permissions)) {
      const permissionData = permissions.map((p: any) => ({
        roleId: id,
        module: p.module,
        canView: !!p.canView,
        canEdit: !!p.canEdit
      }));
      await prisma.permission.createMany({
        data: permissionData
      });
    }
    
    const updatedRole = await prisma.customRole.findUnique({
      where: { id },
      include: { permissions: true }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'UPDATE', 'CustomRole', id, oldRole, updatedRole);
    
    res.json(updatedRole);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 14. POST: AI Suggested routing classification
app.post('/api/ai/suggest-routing', async (req, res) => {
  const { description, organizationId } = req.body;
  if (!description || !organizationId) {
    return res.status(400).json({ error: 'description and organizationId are required' });
  }

  try {
    const text = description.toLowerCase();
    let suggestedModule = 'tracker'; 
    let suggestedRoleName = 'Resident Services Coordinator';
    let suggestedAssignee = 'Marcus Miller';
    let rationale = 'Default ticket classification for general resident inquiries.';

    if (text.includes('leak') || text.includes('pressure') || text.includes('water') || text.includes('pipe') || text.includes('hydrant')) {
      suggestedModule = 'tracker';
      suggestedRoleName = 'Water Dept Lead';
      suggestedAssignee = 'Marcus Miller';
      rationale = 'The request mentions issues with water pressure or leakage, which fall under the Water Department lead.';
    } else if (text.includes('pothole') || text.includes('street') || text.includes('road') || text.includes('paving') || text.includes('traffic')) {
      suggestedModule = 'tracker';
      suggestedRoleName = 'Streets & Roads Coordinator';
      suggestedAssignee = 'Marcus Miller';
      rationale = 'The incident pertains to municipal road maintenance and traffic infrastructure, managed by the Streets Coordinator.';
    } else if (text.includes('trash') || text.includes('debris') || text.includes('garbage') || text.includes('overgrowth') || text.includes('litter')) {
      suggestedModule = 'code-enforcement';
      suggestedRoleName = 'Property Maintenance Inspector';
      suggestedAssignee = 'Elena Rostova';
      rationale = 'Identified trash, debris, or overgrowth violation. Property maintenance inspections are required.';
    } else if (text.includes('structural') || text.includes('unsafe') || text.includes('collapse') || text.includes('foundation') || text.includes('hazard')) {
      suggestedModule = 'code-enforcement';
      suggestedRoleName = 'Building Inspector';
      suggestedAssignee = 'Elena Rostova';
      rationale = 'The details indicate possible structural hazards or unsafe conditions requiring safety inspection.';
    } else if (text.includes('permit') || text.includes('zoning') || text.includes('renovation') || text.includes('licensing') || text.includes('building cost')) {
      suggestedModule = 'permits';
      suggestedRoleName = 'Permits Clerk';
      suggestedAssignee = 'Elena Rostova';
      rationale = 'The request relates directly to municipal building permitting, zoning desk reviews, or construction licenses.';
    }

    // Find the role ID in the database for the matching organization
    const targetRole = await prisma.customRole.findFirst({
      where: {
        organizationId,
        name: { equals: suggestedRoleName, mode: 'insensitive' }
      }
    });

    res.json({
      suggestedModule,
      suggestedRoleName,
      suggestedRoleId: targetRole?.id || null,
      suggestedAssignee,
      rationale
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 15. GET: Fetch all Open Records Requests (filtered by organization)
app.get('/api/open-records', async (req, res) => {
  try {
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    
    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    const requests = await prisma.openRecordsRequest.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' }
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 16. POST: Create a new Open Records Request
app.post('/api/open-records', async (req, res) => {
  try {
    const { requesterName, requesterEmail, description, dateRange, status, assignedTo } = req.body;
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;
    
    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    const newRequest = await prisma.openRecordsRequest.create({
      data: {
        organizationId: orgId,
        requesterName,
        requesterEmail,
        description,
        dateRange: dateRange || null,
        status: status || 'Received',
        assignedTo: assignedTo || 'City Clerk'
      }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'CREATE', 'OpenRecordsRequest', newRequest.id, null, newRequest);

    res.status(201).json(newRequest);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 17. PUT: Update an Open Records Request status/assignee
app.put('/api/open-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!orgId) {
      orgId = await getNewarkOrgId();
    }

    const oldRequest = await prisma.openRecordsRequest.findUnique({ where: { id } });

    const updated = await prisma.openRecordsRequest.update({
      where: { id },
      data: { status, assignedTo }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'UPDATE', 'OpenRecordsRequest', id, oldRequest, updated);

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 18. GET: Fetch Newark staff roster (employees directory)
app.get('/api/employees', async (req, res) => {
  try {
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    if (!orgId) orgId = await getNewarkOrgId();

    const employees = await prisma.employee.findMany({
      where: { organizationId: orgId },
      include: {
        certifications: true,
        timesheets: {
          orderBy: { date: 'desc' }
        }
      }
    });
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 19. POST: Register a new employee
app.post('/api/employees', async (req, res) => {
  try {
    const { firstName, lastName, email, department, hireDate } = req.body;
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!orgId) orgId = await getNewarkOrgId();

    const emp = await prisma.employee.create({
      data: {
        organizationId: orgId,
        firstName,
        lastName,
        email,
        department,
        hireDate: new Date(hireDate || Date.now())
      }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'CREATE', 'Employee', emp.id, null, emp);

    res.status(201).json(emp);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 20. POST: Add hours to an employee timesheet
app.post('/api/employees/:id/timesheets', async (req, res) => {
  try {
    const { id } = req.params;
    const { date, hoursWorked, notes } = req.body;
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    const userId = req.headers['x-user-id'] as string;
    const userEmail = req.headers['x-user-email'] as string;

    if (!orgId) orgId = await getNewarkOrgId();

    const ts = await prisma.timesheet.create({
      data: {
        employeeId: id,
        date: new Date(date),
        hoursWorked: parseFloat(hoursWorked),
        notes
      }
    });

    // Record in AuditLog
    await recordAudit(orgId, userId, userEmail, 'CREATE', 'Timesheet', ts.id, null, ts);

    res.status(201).json(ts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 21. GET: Fetch system audit trail log
app.get('/api/audit-logs', async (req, res) => {
  try {
    let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
    if (!orgId) orgId = await getNewarkOrgId();

    const logs = await prisma.auditLog.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 100 // cap at 100 recent rows
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Munevo DB API Server listening on http://localhost:${PORT}`);
});
