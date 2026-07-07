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

// 1. GET: Fetch all properties (with permits & inspections)
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        permits: true,
        inspections: true
      }
    });

    // Structure properties into key-value records mapping mockData style
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
        violations: [], // Standard fallback mock array
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

// 2. GET: Fetch all Universal Tracker items
app.get('/api/tracker', async (req, res) => {
  try {
    const trackerItems = await prisma.trackerItem.findMany({
      orderBy: {
        reportedDate: 'desc'
      },
      include: {
        property: true
      }
    });

    // Reconstruct into mockData structure containing default comments & history logs
    const formatted = trackerItems.map((item) => {
      // Map mock comments/history logs based on ID
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

// 3. POST: Create a new operation tracker item (e.g. 311 citizen report)
app.post('/api/tracker', async (req, res) => {
  try {
    const { module, title, status, priority, assignedTo, slaDays, address } = req.body;

    // Resolve propertyId from address
    let property = await prisma.property.findFirst({
      where: { address }
    });

    // If property doesn't exist, create it (e.g. 255 Leon Avenue geocoded)
    if (!property) {
      property = await prisma.property.create({
        data: {
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
        module,
        title,
        status,
        priority,
        assignedTo,
        slaDays,
        slaProgress: 0,
        propertyId: property.id
      },
      include: {
        property: true
      }
    });

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

// 4. PUT: Update a tracker item field (e.g. status, priority, assignee)
app.put('/api/tracker/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

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

app.listen(PORT, () => {
  console.log(`🚀 Munevo DB API Server listening on http://localhost:${PORT}`);
});
