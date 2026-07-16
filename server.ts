import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const originalEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
};

const CORRECT_DATABASE_URL = "postgresql://postgres.ihwtaxltvsgfvgcgcpdw:DYKYJHc1Apc1aGmn@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true";
const CORRECT_DIRECT_URL = "postgresql://postgres.ihwtaxltvsgfvgcgcpdw:DYKYJHc1Apc1aGmn@aws-1-us-west-2.pooler.supabase.com:5432/postgres";

process.env.DATABASE_URL = CORRECT_DATABASE_URL;
process.env.DIRECT_URL = CORRECT_DIRECT_URL;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: CORRECT_DATABASE_URL
    }
  }
});
const app = express();
const PORT = 3001;

let dbUser = 'undefined';
if (process.env.DATABASE_URL) {
  const match = process.env.DATABASE_URL.match(/postgresql:\/\/([^:]+)/);
  if (match) dbUser = match[1];
}
const obfuscateUrl = (url: string | undefined) => {
  if (!url) return 'undefined';
  return url.replace(/:([^@]+)@/, ':****@');
};
console.log('[Startup] Obfuscated DATABASE_URL:', obfuscateUrl(process.env.DATABASE_URL));
console.log('[Startup] Obfuscated DIRECT_URL:', obfuscateUrl(process.env.DIRECT_URL));

console.log('[Startup] Backend environment diagnostics:', {
  DATABASE_URL_exists: !!process.env.DATABASE_URL,
  DATABASE_URL_user: dbUser,
  DATABASE_URL_host: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] || 'no-host' : 'undefined',
  DIRECT_URL_exists: !!process.env.DIRECT_URL,
  VITE_SUPABASE_URL_exists: !!process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY_exists: !!process.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY_exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

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
    if (!orgId) orgId = await getNewarkOrgId();

    const properties = await prisma.property.findMany({
      where: { organizationId: orgId },
      include: { permits: true, inspections: true }
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
    if (!orgId) orgId = await getNewarkOrgId();

    const trackerItems = await prisma.trackerItem.findMany({
      where: { organizationId: orgId },
      orderBy: { reportedDate: 'desc' },
      include: { property: true }
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
        comments: [],
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
    
    if (!orgId) orgId = await getNewarkOrgId();

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
      data: { status, priority, assignedTo },
      include: { property: true }
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
      comments: [],
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

// 5.3. GET /api/permits: List permits
app.get('/api/permits', async (req, res) => {
  const orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    const list = await prisma.permit.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: { property: true }
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5.4. GET /api/inspections: List inspections
app.get('/api/inspections', async (req, res) => {
  const orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    const list = await prisma.inspection.findMany({
      where: orgId ? { organizationId: orgId } : {},
      include: { property: true }
    });
    res.json(list);
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

// 6.5. POST /api/onboarding: Guided Setup Wizard
app.post('/api/onboarding', async (req, res) => {
  const { name, slug, templateType, adminEmail, invitedById, enabledModules } = req.body;
  if (!name || !slug || !adminEmail) {
    return res.status(400).json({ error: 'name, slug, and adminEmail are required' });
  }

  try {
    const org = await prisma.organization.create({
      data: { 
        name, 
        slug, 
        enabledModules: enabledModules || 'all'
      }
    });

    const rolesList: { name: string; permissions: string[] }[] = [];
    
    if (templateType === 'FULL' || templateType === 'STANDARD') {
      rolesList.push(
        { name: 'Mayor / City Manager', permissions: ['command-center', 'tracker', 'gis', 'permits', 'code-enforcement', 'legislative'] },
        { name: 'City Clerk', permissions: ['command-center', 'tracker', 'legislative', 'open-records'] },
        { name: 'Building Inspector', permissions: ['command-center', 'tracker', 'gis', 'permits', 'code-enforcement'] },
        { name: 'Code Enforcement Officer', permissions: ['command-center', 'tracker', 'gis', 'code-enforcement'] },
        { name: 'Finance Director', permissions: ['command-center', 'permits'] }
      );
    } else if (templateType === 'CORE') {
      rolesList.push(
        { name: 'Administrator', permissions: ['command-center', 'tracker', 'gis', 'permits', 'code-enforcement', 'legislative', 'open-records'] },
        { name: 'Clerk', permissions: ['command-center', 'legislative', 'open-records'] },
        { name: 'Inspector', permissions: ['command-center', 'tracker', 'code-enforcement'] }
      );
    }

    for (const r of rolesList) {
      const newRole = await prisma.customRole.create({
        data: {
          organizationId: org.id,
          name: r.name
        }
      });
      const permissionData = r.permissions.map(mod => ({
        roleId: newRole.id,
        module: mod,
        canView: true,
        canEdit: true
      }));
      await prisma.permission.createMany({
        data: permissionData
      });
    }

    const invite = await prisma.invite.create({
      data: {
        email: adminEmail,
        isOrgAdmin: true,
        organizationId: org.id,
        invitedById: invitedById || 'simulated-user-global_admin',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await recordAudit(org.id, invitedById || null, adminEmail, 'CREATE', 'OrganizationOnboarding', org.id, null, { org, invite });

    res.status(201).json({ org, invite });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.6. POST /api/demo/spinup: Spin up fresh temporary sandbox organization for prospect
app.post('/api/demo/spinup', async (req, res) => {
  const rand = Math.floor(1000 + Math.random() * 9000);
  const slug = `demo-${rand}`;
  const name = `Demo City (Prospect #${rand})`;

  try {
    const org = await prisma.organization.create({
      data: { name, slug, enabledModules: 'all' }
    });

    // Create standard roles
    const roles = [
      { name: 'Mayor / City Manager', permissions: ['command-center', 'tracker', 'gis', 'permits', 'code-enforcement', 'legislative'] },
      { name: 'City Clerk', permissions: ['command-center', 'tracker', 'legislative', 'open-records'] },
      { name: 'Building Inspector', permissions: ['command-center', 'tracker', 'gis', 'permits', 'code-enforcement'] }
    ];

    for (const r of roles) {
      const newRole = await prisma.customRole.create({
        data: { organizationId: org.id, name: r.name }
      });
      await prisma.permission.createMany({
        data: r.permissions.map(mod => ({
          roleId: newRole.id,
          module: mod,
          canView: true,
          canEdit: true
        }))
      });
    }

    // Seed mock Property
    const prop = await prisma.property.create({
      data: {
        organizationId: org.id,
        address: '12 Ferry St, Demo City, NJ',
        zipCode: '07105',
        ownerName: 'Horizon Real Estate LLC',
        assessedValue: 420000,
        taxStatus: 'Paid',
        zoningDistrict: 'MXD-1',
        gisCoords: [40.732, -74.155]
      }
    });

    // Seed mock Permit
    const permit = await prisma.permit.create({
      data: {
        organizationId: org.id,
        permitNumber: `PEM-DEMO-${rand}`,
        type: 'Commercial Renovation',
        status: 'Issued',
        estimatedCost: 25000,
        propertyId: prop.id
      }
    });

    // Seed mock Inspection
    await prisma.inspection.create({
      data: {
        organizationId: org.id,
        permitId: permit.id,
        propertyId: prop.id,
        type: 'Structural Review',
        scheduledDate: '2026-07-10',
        status: 'Pending',
        inspectorName: 'Elena Rostova',
        notes: ''
      }
    });

    // Seed mock Ticket
    await prisma.trackerItem.create({
      data: {
        organizationId: org.id,
        module: '311',
        title: 'Damaged Sidewalk Safety Hazard',
        status: 'Open',
        priority: 'High',
        assignedTo: 'Public Works Operations',
        slaDays: 2,
        slaProgress: 10,
        propertyId: prop.id
      }
    });

    // Create Simulated Profile for prospect
    const profile = await prisma.profile.create({
      data: {
        id: `demo-admin-${rand}`,
        email: `prospect@democity-${rand}.gov`,
        isOrgAdmin: true,
        organizationId: org.id
      },
      include: {
        organization: true
      }
    });

    // Garbage collection of old demo organizations (> 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldDemoOrgs = await prisma.organization.findMany({
      where: {
        slug: { startsWith: 'demo-' },
        createdAt: { lt: oneDayAgo }
      }
    });
    for (const oldOrg of oldDemoOrgs) {
      await prisma.organization.delete({
        where: { id: oldOrg.id }
      }).catch(e => console.error('Failed cleanup of old demo org:', e));
    }

    res.status(201).json({ profile, organization: org });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// 6.5. POST /api/demo/requests: Capture a demo lead request from the marketing page
app.post('/api/demo/requests', async (req, res) => {
  const { name, email, municipality, notes } = req.body;
  if (!name || !email || !municipality) {
    return res.status(400).json({ error: 'Name, email, and municipality fields are required.' });
  }
  try {
    const lead = await prisma.demoRequest.create({
      data: { name, email, municipality, notes }
    });
    res.status(201).json(lead);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.6. GET /api/demo/requests: Retrieve all marketing leads
app.get('/api/demo/requests', async (req, res) => {
  try {
    const leads = await prisma.demoRequest.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const getPrefix = (val: string | undefined) => {
  if (!val) return 'undefined';
  const trimmed = val.trim();
  if (trimmed.startsWith('eyJ')) return 'eyJ';
  if (trimmed.startsWith('sb_publishable_')) return 'sb_publishable';
  if (trimmed.startsWith('sb_secret_')) return 'sb_secret';
  return trimmed.slice(0, 10) + '...';
};
const getHostname = (val: string | undefined) => {
  if (!val) return 'undefined';
  try {
    const parsed = new URL(val);
    return parsed.hostname;
  } catch (e) {
    return 'invalid-url';
  }
};
const getDbDetails = (url: string | undefined) => {
  if (!url) return 'undefined';
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@/);
  if (!match) return 'invalid-format';
  return {
    username: match[1],
    passwordLength: match[2].length,
    passwordPrefix: match[2].slice(0, 3)
  };
};

function getResolvedSupabaseUrl(): { url: string; err: string } {
  let supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  if (supabaseUrl.startsWith('"') && supabaseUrl.endsWith('"')) supabaseUrl = supabaseUrl.slice(1, -1);
  if (supabaseUrl.startsWith("'") && supabaseUrl.endsWith("'")) supabaseUrl = supabaseUrl.slice(1, -1);

  let supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (supabaseAnonKey.startsWith('"') && supabaseAnonKey.endsWith('"')) supabaseAnonKey = supabaseAnonKey.slice(1, -1);
  if (supabaseAnonKey.startsWith("'") && supabaseAnonKey.endsWith("'")) supabaseAnonKey = supabaseAnonKey.slice(1, -1);

  let resolvedUrl = '';
  let debugError = '';
  if (supabaseAnonKey.includes('.')) {
    try {
      const payloadSegment = supabaseAnonKey.split('.')[1];
      const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - payloadSegment.length % 4) % 4);
      const payload = JSON.parse(atob(base64));
      if (payload && payload.ref) {
        resolvedUrl = `https://${payload.ref}.supabase.co`;
      }
    } catch (err: any) {
      debugError = err.message || String(err);
    }
  }
  if (!resolvedUrl) {
    resolvedUrl = supabaseUrl || 'https://ihwtaxltvsgfvgcgcpdw.supabase.co';
  }
  return { url: resolvedUrl, err: debugError };
}

// 6.65. GET /api/auth/config: Expose Supabase connection credentials dynamically from backend environment
app.get('/api/auth/config', (req, res) => {
  console.log('[Auth Config Diagnostic] Env values status:', {
    DATABASE_URL: {
      exists: !!originalEnv.DATABASE_URL,
      details: getDbDetails(originalEnv.DATABASE_URL)
    },
    DIRECT_URL: {
      exists: !!originalEnv.DIRECT_URL,
      details: getDbDetails(originalEnv.DIRECT_URL)
    },
    SUPABASE_URL: {
      exists: !!originalEnv.SUPABASE_URL,
      hostname: getHostname(originalEnv.SUPABASE_URL)
    },
    VITE_SUPABASE_URL: {
      exists: !!originalEnv.VITE_SUPABASE_URL,
      hostname: getHostname(originalEnv.VITE_SUPABASE_URL)
    },
    SUPABASE_ANON_KEY: {
      exists: !!originalEnv.SUPABASE_ANON_KEY,
      prefix: getPrefix(originalEnv.SUPABASE_ANON_KEY)
    },
    VITE_SUPABASE_ANON_KEY: {
      exists: !!originalEnv.VITE_SUPABASE_ANON_KEY,
      prefix: getPrefix(originalEnv.VITE_SUPABASE_ANON_KEY)
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      exists: !!originalEnv.SUPABASE_SERVICE_ROLE_KEY,
      prefix: getPrefix(originalEnv.SUPABASE_SERVICE_ROLE_KEY)
    }
  });

  let supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  if (supabaseAnonKey.startsWith('"') && supabaseAnonKey.endsWith('"')) supabaseAnonKey = supabaseAnonKey.slice(1, -1);
  if (supabaseAnonKey.startsWith("'") && supabaseAnonKey.endsWith("'")) supabaseAnonKey = supabaseAnonKey.slice(1, -1);

  const { url: resolvedUrl, err: debugError } = getResolvedSupabaseUrl();

  res.json({
    supabaseUrl: resolvedUrl,
    supabaseAnonKey: supabaseAnonKey || 'dummy-anon-key-placeholder',
    debug: {
      rawUrl: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim(),
      atobExists: typeof atob === 'function',
      bufferExists: typeof Buffer === 'function',
      error: debugError
    }
});

app.get('/api/auth/confirm-naeem', async (req, res) => {
  const { url: resolvedUrl } = getResolvedSupabaseUrl();
  const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (!supabaseServiceRoleKey) {
    return res.status(500).json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured on server.' });
  }
  try {
    const adminClient = createClient(resolvedUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const userId = "4216415d-14e9-4404-a54e-090c878b1479";
    
    console.log(`Updating user ${userId} in production Supabase Auth...`);
    const { data: updateData, error: updateErr } = await adminClient.auth.admin.updateUserById(userId, {
      email_confirm: true
    });
    
    if (updateErr) {
      return res.status(500).json({ error: updateErr.message });
    }
    
    console.log(`Fetching user ${userId} to verify confirmation timestamps...`);
    const { data: getUserData, error: getErr } = await adminClient.auth.admin.getUserById(userId);
    
    if (getErr) {
      return res.status(500).json({ error: getErr.message, step: 'getUserById' });
    }
    
    res.json({
      message: 'Successfully updated and verified.',
      user: {
        id: getUserData.user?.id,
        email: getUserData.user?.email,
        email_confirmed_at: getUserData.user?.email_confirmed_at,
        confirmed_at: getUserData.user?.confirmed_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.7. GET /api/auth/bootstrap-status: Check if any Global Admin profiles exist
app.get('/api/auth/bootstrap-status', async (req, res) => {
  try {
    const count = await prisma.profile.count({
      where: { 
        isGlobalAdmin: true,
        NOT: {
          email: 'global_admin@munevo.gov'
        }
      }
    });
    res.json({ hasGlobalAdmin: count > 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6.8. POST /api/auth/bootstrap: Provision the first Global Admin profile securely
app.post('/api/auth/bootstrap', async (req, res) => {
  let { userId, email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'email is required.' });
  }
  try {
    const count = await prisma.profile.count({
      where: { 
        isGlobalAdmin: true,
        NOT: {
          email: 'global_admin@munevo.gov'
        }
      }
    });
    if (count > 0) {
      return res.status(403).json({ error: 'Platform already bootstrapped. Hijack blocked.' });
    }

    let targetUserId = userId;
    let userFoundInAuth = false;

    // 1. Try to find the user in auth.users by email to get their real ID if they already exist
    try {
      const existingAuthUsers: any[] = await prisma.$queryRawUnsafe('SELECT id FROM auth.users WHERE email = $1', email);
      if (existingAuthUsers.length > 0) {
        targetUserId = existingAuthUsers[0].id;
        userFoundInAuth = true;
        console.log(`Found existing auth user for email ${email} with ID ${targetUserId}`);
      }
    } catch (dbErr: any) {
      console.warn('Failed to query existing user by email in auth.users:', dbErr.message || dbErr);
    }

    // 2. Suppress/confirm or create via Supabase Admin API
    const { url: resolvedUrl } = getResolvedSupabaseUrl();
    const supabaseServiceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
    if (supabaseServiceRoleKey) {
      try {
        const adminClient = createClient(resolvedUrl, supabaseServiceRoleKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });

        if (userFoundInAuth && targetUserId) {
          // Confirm existing
          console.log(`Confirming existing user ${email} via Admin API...`);
          const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
            email_confirm: true
          });
          if (updateErr) {
            console.warn('Admin API email confirmation failed:', updateErr.message);
          } else {
            console.log(`Successfully confirmed email for existing admin user ${email} (ID: ${targetUserId})`);
          }
        } else {
          // Check if exists in Supabase Auth first but not db yet
          let supabaseUser: any = null;
          try {
            const { data: listData, error: listErr } = await adminClient.auth.admin.listUsers();
            if (!listErr && listData && listData.users) {
              supabaseUser = listData.users.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());
            }
          } catch (listErr: any) {
            console.warn('Failed to search user list via Admin API:', listErr.message || listErr);
          }

          if (supabaseUser) {
            targetUserId = supabaseUser.id;
            console.log(`Found user ${email} in Supabase Auth (but not DB). Confirming email...`);
            const { error: updateErr } = await adminClient.auth.admin.updateUserById(targetUserId, {
              email_confirm: true
            });
            if (updateErr) {
              console.warn('Admin API email confirmation failed:', updateErr.message);
            }
          } else {
            // Create user
            const tempPassword = 'Password123!';
            console.log(`Creating user ${email} via Admin API...`);
            const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
              email,
              password: tempPassword,
              email_confirm: true
            });
            if (createErr) {
              console.error('Admin API createUser failed:', createErr.message);
              throw createErr;
            }
            if (createData?.user) {
              targetUserId = createData.user.id;
              console.log(`Created admin user successfully via Admin API. ID: ${targetUserId}`);
            }
          }
        }
      } catch (adminErr: any) {
        console.error('Failed to confirm/create user via Supabase Admin API:', adminErr.message || adminErr);
      }
    } else {
      console.warn('SUPABASE_SERVICE_ROLE_KEY is not defined. Admin confirmation bypassed.');
    }

    if (!targetUserId) {
      return res.status(400).json({ error: 'Could not resolve or create userId.' });
    }

    // 3. Direct insert into auth.users to satisfy database foreign key constraints
    try {
      const existingAuthUsers: any[] = await prisma.$queryRawUnsafe('SELECT id FROM auth.users WHERE id = $1::uuid', targetUserId);
      if (existingAuthUsers.length === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role, created_at, updated_at)
          VALUES ($1::uuid, $2, '{}'::jsonb, '{}'::jsonb, 'authenticated', 'authenticated', NOW(), NOW())
        `, targetUserId, email);
        console.log(`Programmatically provisioned auth placeholder for user ${email} (ID: ${targetUserId})`);
      }
    } catch (dbErr: any) {
      console.warn('Direct auth.users placeholder provision failed/bypassed:', dbErr.message || dbErr);
    }

    const profile = await prisma.profile.upsert({
      where: { id: targetUserId },
      update: {
        isGlobalAdmin: true,
        email
      },
      create: {
        id: targetUserId,
        email,
        isGlobalAdmin: true,
        isOrgAdmin: false,
        organizationId: null,
        roleId: null
      }
    });
    res.status(201).json(profile);
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

// 10.5. GET /api/search: Cross-Module Search Engine
app.get('/api/search', async (req, res) => {
  const query = (req.query.q || '') as string;
  const orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;

  if (!query || query.length < 2) {
    return res.json({ properties: [], permits: [], tickets: [], records: [], businesses: [] });
  }

  try {
    const filter = orgId ? { organizationId: orgId } : {};

    // 1. Properties
    const properties = await prisma.property.findMany({
      where: {
        ...filter,
        OR: [
          { address: { contains: query, mode: 'insensitive' } },
          { ownerName: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    // 2. Permits
    const permits = await prisma.permit.findMany({
      where: {
        ...filter,
        OR: [
          { permitNumber: { contains: query, mode: 'insensitive' } },
          { type: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { property: true },
      take: 5
    });

    // 3. Tickets (TrackerItem)
    const tickets = await prisma.trackerItem.findMany({
      where: {
        ...filter,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { status: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: { property: true },
      take: 5
    });

    // 4. Open Records Requests
    const records = await prisma.openRecordsRequest.findMany({
      where: {
        ...filter,
        OR: [
          { requesterName: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    // 5. Businesses
    const businesses = await prisma.business.findMany({
      where: {
        ...filter,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { sector: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 5
    });

    res.json({
      properties: properties.map(p => ({ id: p.id, type: 'property', label: p.address, sub: `Owner: ${p.ownerName}` })),
      permits: permits.map(p => ({ id: p.id, type: 'permit', label: `${p.permitNumber} (${p.type})`, sub: p.property?.address || 'N/A' })),
      tickets: tickets.map(t => ({ id: t.id, type: 'permit', label: t.title, sub: `Ticket: ${t.module} • ${t.status}` })),
      records: records.map(r => ({ id: r.id, type: 'property', label: `FOIA: ${r.requesterName}`, sub: r.description })),
      businesses: businesses.map(b => ({ id: b.id, type: 'business', label: b.name, sub: `Sector: ${b.sector}` }))
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10.5. GET /api/profiles/me: Retrieve database profile for authenticated user
app.get('/api/profiles/me', async (req, res) => {
  const userId = req.headers['x-user-id'] as string;
  const userEmail = req.headers['x-user-email'] as string;

  if (!userId && !userEmail) {
    return res.status(400).json({ error: 'x-user-id or x-user-email header is required' });
  }

  try {
    const profile = await prisma.profile.findFirst({
      where: userId ? { id: userId } : { email: userEmail },
      include: {
        organization: true,
        role: {
          include: { permissions: true }
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found in government database registry.' });
    }

    res.json(profile);
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
    if (!orgId) orgId = await getNewarkOrgId();

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
    
    if (!orgId) orgId = await getNewarkOrgId();

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

    if (!orgId) orgId = await getNewarkOrgId();

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
        office: true,
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
      take: 100
    });
    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 22. POST /api/auth/badge-login: Tap Card Login endpoint
app.post('/api/auth/badge-login', async (req, res) => {
  const { badgeId } = req.body;
  if (!badgeId) return res.status(400).json({ error: 'badgeId credentials are required' });
  try {
    const profile = await prisma.profile.findUnique({
      where: { badgeId },
      include: {
        organization: true,
        role: { include: { permissions: true } }
      }
    });
    if (!profile) return res.status(404).json({ error: 'TAP CARD ID not registered.' });
    res.json(profile);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 23. GET /api/claims: Fetch Verification Claims
app.get('/api/claims', async (req, res) => {
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    if (!orgId) orgId = await getNewarkOrgId();
    const claims = await prisma.verificationClaim.findMany({
      where: { organizationId: orgId },
      include: { profile: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(claims);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 24. POST /api/claims: File a property verification claim
app.post('/api/claims', async (req, res) => {
  const { profileId, type, targetId, targetAddress, notes } = req.body;
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    if (!orgId) orgId = await getNewarkOrgId();
    const claim = await prisma.verificationClaim.create({
      data: {
        organizationId: orgId,
        profileId,
        type,
        targetId,
        targetAddress,
        notes,
        status: 'PENDING'
      }
    });
    res.status(201).json(claim);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 25. PUT /api/claims/:id: Approve/Reject Claims
app.put('/api/claims/:id', async (req, res) => {
  const { id } = req.params;
  const { status, reviewedBy } = req.body; // status: APPROVED | REJECTED
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    if (!orgId) orgId = await getNewarkOrgId();
    const updatedClaim = await prisma.verificationClaim.update({
      where: { id },
      data: {
        status,
        reviewedById: reviewedBy,
        reviewedAt: new Date()
      }
    });

    // If claim approved, sync profile home district Office if needed
    if (status === 'VERIFIED') {
      const claim = await prisma.verificationClaim.findUnique({ where: { id } });
      if (claim) {
        // Link to Newark Legislative Ward Representative district optionally
        const office = await prisma.municipalOffice.findFirst({
          where: { organizationId: orgId, name: { contains: 'Ward 1' } }
        });
        await prisma.profile.update({
          where: { id: claim.profileId },
          data: { districtOfficeId: office?.id }
        });
      }
    }

    res.json(updatedClaim);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 26. GET /api/appointments: List municipal appointments calendar
app.get('/api/appointments', async (req, res) => {
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    if (!orgId) orgId = await getNewarkOrgId();
    const list = await prisma.appointment.findMany({
      where: { organizationId: orgId },
      include: { office: true },
      orderBy: { scheduledAt: 'asc' }
    });
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 27. POST /api/appointments: Book appointment / walk-in log
app.post('/api/appointments', async (req, res) => {
  const { requesterName, requesterEmail, department, scheduledAt, purpose, type, officeId } = req.body;
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    if (!orgId) orgId = await getNewarkOrgId();
    const appt = await prisma.appointment.create({
      data: {
        organizationId: orgId,
        requesterName,
        requesterEmail,
        department,
        scheduledAt: new Date(scheduledAt),
        purpose,
        type: type || 'APPOINTMENT',
        officeId: officeId || null
      }
    });
    res.status(201).json(appt);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 28. GET /api/case-comments/:type/:id: Fetch in-context comments
app.get('/api/case-comments/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  try {
    const comments = await prisma.caseComment.findMany({
      where: {
        recordType: type,
        recordId: id
      },
      include: { authorOffice: true },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 29. POST /api/case-comments: File in-context case comment
app.post('/api/case-comments', async (req, res) => {
  const { authorId, authorName, authorEmail, authorOfficeId, recordType, recordId, message } = req.body;
  let orgId = (req.headers['x-organization-id'] || req.query.orgId) as string;
  try {
    if (!orgId) orgId = await getNewarkOrgId();
    const comment = await prisma.caseComment.create({
      data: {
        organizationId: orgId,
        authorId,
        authorName,
        authorEmail,
        authorOfficeId: authorOfficeId || null,
        recordType,
        recordId,
        message
      },
      include: { authorOffice: true }
    });
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Munevo DB API Server listening on http://localhost:${PORT}`);
  });
}

export default app;
