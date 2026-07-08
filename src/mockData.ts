export interface UserRole {
  id: string;
  name: string;
  department: string;
  description: string;
  commandCenter: {
    actions: string[];
    metrics: { label: string; value: string | number; trend?: string; status?: 'normal' | 'warn' | 'alert' }[];
    sections: string[];
  };
}

export const USER_ROLES: Record<string, UserRole> = {
  mayor: {
    id: 'mayor',
    name: 'Mayor / City Manager',
    department: 'Executive Administration',
    description: 'City-wide oversight, executive approvals, budget health, and strategic projects.',
    commandCenter: {
      actions: ['View Annual Budget', 'Review Legislative Agenda', 'Sign Executive Order', 'View Citizen NPS Dashboard'],
      metrics: [
        { label: '311 Response Time (Avg)', value: '18.4 hrs', trend: '-2.1 hrs', status: 'normal' },
        { label: 'Pending Approvals', value: '4 Cases', status: 'warn' },
        { label: 'Capital Projects On Track', value: '92%', trend: '+4%', status: 'normal' },
        { label: 'Budget Variance', value: '-$1.2M (Under)', status: 'normal' }
      ],
      sections: ['AI Daily Executive Briefing', 'Critical Approvals', 'City-Wide SLA Overview', 'Active Legislative Items']
    }
  },
  inspector: {
    id: 'inspector',
    name: 'Building Inspector',
    department: 'Code Enforcement & Inspections',
    description: 'Field inspections, permit signoffs, violation logging, and GIS-optimized routes.',
    commandCenter: {
      actions: ['Start Route Map', 'Log Structural Violation', 'Issue Stop Work Order', 'Schedule Emergency Inspection'],
      metrics: [
        { label: 'Inspections Today', value: '8 Inspections', status: 'normal' },
        { label: 'Completed Inspections', value: '3/8', trend: '+1 in last hour', status: 'normal' },
        { label: 'High Priority Code Cases', value: '12 Active', status: 'alert' },
        { label: 'Avg Transit Time', value: '14 min', status: 'normal' }
      ],
      sections: ['My Route Map (Newark)', 'Inspection Checklist & Field Notes', 'Assigned Open Permits', 'AI Field Report Drafts']
    }
  },
  resident: {
    id: 'resident',
    name: 'Resident (MyMunevo)',
    department: 'Public Portal',
    description: 'Citizen requests, utility accounts, property records, and payment portal.',
    commandCenter: {
      actions: ['Submit 311 Request', 'Apply for Building Permit', 'Pay Water Bill', 'View Local Agendas'],
      metrics: [
        { label: 'Active Requests', value: '1 Request', status: 'normal' },
        { label: 'Unpaid Water Bill', value: '$84.50', status: 'warn' },
        { label: 'Property Tax Balance', value: '$0.00', status: 'normal' },
        { label: 'Permit Status', value: 'In Review', status: 'normal' }
      ],
      sections: ['My Portal Dashboard', 'Submit 311 Service Request', 'Bills & Payments', 'Neighborhood GIS Feed']
    }
  },
  clerk: {
    id: 'clerk',
    name: 'Municipal Clerk',
    department: 'Legislative Records & Meetings',
    description: 'Clerking meetings, publishing notices, voting certification, and ordinance archiving.',
    commandCenter: {
      actions: ['Create Agenda Packet', 'Publish Meeting Notice', 'Draft Minutes Transcript', 'Certify Ordinance Vote'],
      metrics: [
        { label: 'Upcoming Meetings', value: '2 Scheduled', status: 'normal' },
        { label: 'Draft Minutes Pending', value: '1 Agenda', status: 'warn' },
        { label: 'Ordinances Recorded', value: '42 YTD', status: 'normal' },
        { label: 'Public Record Queries', value: '128 Requests', status: 'normal' }
      ],
      sections: ['Legislative Calendar & Agenda Planner', 'Draft Meeting Minutes Vault', 'Ordinance Certification Records', 'AI Meeting Summarizer Engine']
    }
  },
  finance: {
    id: 'finance',
    name: 'Finance Director / Comptroller',
    department: 'Finance, Tax & Treasury',
    description: 'Budget re-allocation, PILOT contracts audits, tax abatements, and grants ledgers.',
    commandCenter: {
      actions: ['Approve Budget Reallocation', 'Authorize Procurement Bid', 'Certify Abatement PILOT', 'Audit Fiscal Ledger'],
      metrics: [
        { label: 'Tax Collection Rate', value: '98.2%', trend: '+0.5%', status: 'normal' },
        { label: 'PILOT Agreements', value: '14 Active', status: 'normal' },
        { label: 'Abatements Value', value: '$4.2M (YTD)', status: 'normal' },
        { label: 'Procurement Requisitions', value: '5 Pending', status: 'warn' }
      ],
      sections: ['Municipal Budget Allocations Ledger', 'Tax Abatements & PILOT Agreements Board', 'Fiscal Audits & Ledgers', 'Pending Procurement Approval Queue']
    }
  },
  planner: {
    id: 'planner',
    name: 'Planner / Zoning Officer',
    department: 'Economic & Urban Planning',
    description: 'Zoning variance reviews, site plan approvals, and master plan GIS alignments.',
    commandCenter: {
      actions: ['Review Variance Claim', 'Update Zoning Overlay', 'Approve Site Plan Layout', 'Schedule Public Hearing'],
      metrics: [
        { label: 'Variance Cases Open', value: '6 Cases', status: 'normal' },
        { label: 'Site Plan Approvals', value: '18 YTD', status: 'normal' },
        { label: 'Opportunity Zones Active', value: '3 Zones', status: 'normal' },
        { label: 'Pending Master Plan Audits', value: '2 Areas', status: 'warn' }
      ],
      sections: ['Zoning Variance Application Queue', 'Redevelopment Agreements & PILOT Links', 'Zoning GIS Overlay Layout', 'AI Master Plan Alignment Engine']
    }
  },
  public_works: {
    id: 'public_works',
    name: 'Public Works Crew Leader',
    department: 'Infrastructure, Assets & Fleet',
    description: 'Work order routing, municipal equipment dispatching, and utility repair tracking.',
    commandCenter: {
      actions: ['Assign Work Order', 'Schedule Dispatch Crew', 'Log Water Valve Repair', 'Plan Snow Plow Route'],
      metrics: [
        { label: 'Open Work Orders', value: '9 Orders', status: 'warn' },
        { label: 'Crew Dispatch Status', value: '8/12 Active', status: 'normal' },
        { label: 'Equipment Availability', value: '95% Ready', status: 'normal' },
        { label: 'Hydrants/Trees Assets Logged', value: '1,420', status: 'normal' }
      ],
      sections: ['Today\'s Work Dispatch Queue', 'Municipal Fleet GPS & Assets Status', 'Utilities GIS Work Orders Map', 'Snow & Sanitation Routes Coordinator']
    }
  },
  global_admin: {
    id: 'global_admin',
    name: 'Global Administrator',
    department: 'Multi-Tenant Infrastructure',
    description: 'Create new municipalities, view cross-tenant directory indexes, and invite tenant administrators.',
    commandCenter: {
      actions: ['Provision New Tenant', 'Audit Active Orgs', 'Invite Tenant Admin', 'Database Maintenance'],
      metrics: [
        { label: 'Total Municipalities', value: '2 Active', status: 'normal' },
        { label: 'Active Users (Total)', value: '14 Accounts', status: 'normal' },
        { label: 'Pending Invitations', value: '3 Active', status: 'warn' },
        { label: 'Global DB Row Count', value: '42 Rows', status: 'normal' }
      ],
      sections: ['Organization Registry Status', 'Global Audit Trail Log', 'Direct Cloud Management Settings']
    }
  }
};

export interface PropertyRecord {
  id: string;
  address: string;
  zipCode: string;
  ownerName: string;
  ownerAddress: string;
  assessedValue: number;
  taxStatus: 'Paid' | 'Delinquent' | 'Pending';
  zoningDistrict: string;
  permits: string[]; // Permit IDs
  inspections: string[]; // Inspection IDs
  violations: string[]; // Violation IDs
  utilities: {
    waterAccountNumber: string;
    balance: number;
    usageTrend: string;
  };
  gisCoords: [number, number]; // SVG mock coords x, y
  notes: string;
}

const MOCK_PROPERTIES: Record<string, PropertyRecord> = {
  prop_01: {
    id: 'prop_01',
    address: '920 Broad St, Newark, NJ',
    zipCode: '07102',
    ownerName: 'City of Newark (Municipal Hall)',
    ownerAddress: '920 Broad St, Newark, NJ 07102',
    assessedValue: 14500000,
    taxStatus: 'Paid',
    zoningDistrict: 'C-3 (Downtown Commercial)',
    permits: ['perm_01', 'perm_04'],
    inspections: ['insp_01'],
    violations: [],
    utilities: {
      waterAccountNumber: 'W-920-001',
      balance: 0.00,
      usageTrend: 'Stable (-1%)'
    },
    gisCoords: [250, 350],
    notes: 'Historic City Hall building. Contains administration offices, council chambers, and municipal courtrooms.'
  },
  prop_02: {
    id: 'prop_02',
    address: '15 Washington St, Newark, NJ',
    zipCode: '07102',
    ownerName: 'Washington Street Development Partners LLC',
    ownerAddress: '24 Park Place, Suite 400, Newark, NJ 07102',
    assessedValue: 3420000,
    taxStatus: 'Paid',
    zoningDistrict: 'R-5 (Multi-Family Residential)',
    permits: ['perm_02', 'perm_03'],
    inspections: ['insp_02', 'insp_03'],
    violations: ['viol_01'],
    utilities: {
      waterAccountNumber: 'W-015-894',
      balance: 1420.50,
      usageTrend: 'Elevated (+12%)'
    },
    gisCoords: [230, 150],
    notes: '18-story residential structure built in 1930. Undergoing structural facade rehabilitation.'
  },
  prop_03: {
    id: 'prop_03',
    address: '42 Ferry St, Newark, NJ',
    zipCode: '07105',
    ownerName: 'Silva Bakery & Café',
    ownerAddress: '42 Ferry St, Newark, NJ 07105',
    assessedValue: 780000,
    taxStatus: 'Paid',
    zoningDistrict: 'MXD-1 (Mixed Use Ironbound)',
    permits: ['perm_05'],
    inspections: ['insp_04'],
    violations: [],
    utilities: {
      waterAccountNumber: 'W-042-302',
      balance: 84.50,
      usageTrend: 'Stable (+2%)'
    },
    gisCoords: [420, 410],
    notes: 'Commercial storefront in the Ironbound district. Ground floor bakery, two residential apartments above.'
  },
  prop_04: {
    id: 'prop_04',
    address: '105 Market St, Newark, NJ',
    zipCode: '07102',
    ownerName: 'Market Street Realty Holdings',
    ownerAddress: '100 Mulberry St, Newark, NJ 07102',
    assessedValue: 1250000,
    taxStatus: 'Delinquent',
    zoningDistrict: 'C-2 (Commercial Corridor)',
    permits: [],
    inspections: ['insp_05'],
    violations: ['viol_02', 'viol_03'],
    utilities: {
      waterAccountNumber: 'W-105-092',
      balance: 620.00,
      usageTrend: 'Unreported (Meter error)'
    },
    gisCoords: [310, 310],
    notes: 'Unoccupied retail commercial unit with structural exterior warnings. Outstanding tax lien since 2025.'
  },
  prop_05: {
    id: 'prop_05',
    address: '125 Market St, Newark, NJ',
    zipCode: '07102',
    ownerName: 'DCF Developers, LLC',
    ownerAddress: '100 Mulberry St, Newark, NJ 07102',
    assessedValue: 1850000,
    taxStatus: 'Paid',
    zoningDistrict: 'C-2 (Commercial Corridor)',
    permits: ['perm_06'],
    inspections: ['insp_06'],
    violations: [],
    utilities: {
      waterAccountNumber: 'W-125-001',
      balance: 0.00,
      usageTrend: 'Stable'
    },
    gisCoords: [330, 310],
    notes: 'Undergoing structural review for West Ward Redevelopment construction projects.'
  },
  prop_06: {
    id: 'prop_06',
    address: '129 Market St, Newark, NJ',
    zipCode: '07102',
    ownerName: 'DCF Developers, LLC',
    ownerAddress: '100 Mulberry St, Newark, NJ 07102',
    assessedValue: 1980000,
    taxStatus: 'Paid',
    zoningDistrict: 'C-2 (Commercial Corridor)',
    permits: [],
    inspections: [],
    violations: [],
    utilities: {
      waterAccountNumber: 'W-129-001',
      balance: 0.00,
      usageTrend: 'Stable'
    },
    gisCoords: [350, 310],
    notes: 'Adjacent lot acquired for secondary vehicle logistics entrance.'
  }
};

export interface PermitRecord {
  id: string;
  permitNumber: string;
  propertyId: string;
  type: 'Building' | 'Electrical' | 'Plumbing' | 'Zoning' | 'Demolition';
  status: 'Draft' | 'Applied' | 'In Review' | 'Approved' | 'Issued' | 'Completed';
  submittedDate: string;
  issuedDate?: string;
  description: string;
  estimatedCost: number;
  feePaid: number;
  workflowSteps: {
    name: string;
    status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
    assignedTo: string;
    completedDate?: string;
  }[];
}

export const PERMITS: Record<string, PermitRecord> = {
  perm_01: {
    id: 'perm_01',
    permitNumber: 'PM-2026-0045',
    propertyId: 'prop_01',
    type: 'Electrical',
    status: 'Completed',
    submittedDate: '2026-02-12',
    issuedDate: '2026-02-20',
    description: 'Upgrade of emergency electrical generator panels at City Hall.',
    estimatedCost: 120000,
    feePaid: 1500,
    workflowSteps: [
      { name: 'Application Intake', status: 'Completed', assignedTo: 'Clerk Office', completedDate: '2026-02-12' },
      { name: 'Plan Review', status: 'Completed', assignedTo: 'Electrical Inspector', completedDate: '2026-02-18' },
      { name: 'Fee Payment', status: 'Completed', assignedTo: 'Finance Dept', completedDate: '2026-02-20' },
      { name: 'Inspections', status: 'Completed', assignedTo: 'Electrical Inspector', completedDate: '2026-03-05' },
      { name: 'Final Sign-off', status: 'Completed', assignedTo: 'Building Official', completedDate: '2026-03-06' }
    ]
  },
  perm_02: {
    id: 'perm_02',
    permitNumber: 'PM-2026-0182',
    propertyId: 'prop_02',
    type: 'Building',
    status: 'Issued',
    submittedDate: '2026-04-10',
    issuedDate: '2026-05-02',
    description: 'Facade restoration, replacement of window lintels, and structural masonry work.',
    estimatedCost: 450000,
    feePaid: 6200,
    workflowSteps: [
      { name: 'Application Intake', status: 'Completed', assignedTo: 'Clerk Office', completedDate: '2026-04-10' },
      { name: 'Plan Review', status: 'Completed', assignedTo: 'Structural Engineer', completedDate: '2026-04-28' },
      { name: 'Fee Payment', status: 'Completed', assignedTo: 'Finance Dept', completedDate: '2026-05-02' },
      { name: 'Inspections', status: 'In Progress', assignedTo: 'Building Inspector' },
      { name: 'Final Sign-off', status: 'Pending', assignedTo: 'Building Official' }
    ]
  },
  perm_03: {
    id: 'perm_03',
    permitNumber: 'PM-2026-0211',
    propertyId: 'prop_02',
    type: 'Plumbing',
    status: 'In Review',
    submittedDate: '2026-06-15',
    description: 'Installation of high-efficiency low-flow main line water pump booster.',
    estimatedCost: 35000,
    feePaid: 450,
    workflowSteps: [
      { name: 'Application Intake', status: 'Completed', assignedTo: 'Clerk Office', completedDate: '2026-06-15' },
      { name: 'Plan Review', status: 'In Progress', assignedTo: 'Plumbing Inspector' },
      { name: 'Fee Payment', status: 'Pending', assignedTo: 'Finance Dept' },
      { name: 'Inspections', status: 'Pending', assignedTo: 'Plumbing Inspector' },
      { name: 'Final Sign-off', status: 'Pending', assignedTo: 'Building Official' }
    ]
  },
  perm_04: {
    id: 'perm_04',
    permitNumber: 'PM-2026-0309',
    propertyId: 'prop_01',
    type: 'Building',
    status: 'Applied',
    submittedDate: '2026-07-01',
    description: 'Restoration of stained glass dome structures in Council Chambers ceiling.',
    estimatedCost: 85000,
    feePaid: 0,
    workflowSteps: [
      { name: 'Application Intake', status: 'Completed', assignedTo: 'Clerk Office', completedDate: '2026-07-02' },
      { name: 'Plan Review', status: 'Pending', assignedTo: 'Historical Landmarks Board' },
      { name: 'Fee Payment', status: 'Pending', assignedTo: 'Finance Dept' },
      { name: 'Inspections', status: 'Pending', assignedTo: 'Building Inspector' },
      { name: 'Final Sign-off', status: 'Pending', assignedTo: 'Building Official' }
    ]
  },
  perm_05: {
    id: 'perm_05',
    permitNumber: 'PM-2026-0298',
    propertyId: 'prop_03',
    type: 'Zoning',
    status: 'Approved',
    submittedDate: '2026-06-20',
    description: 'Variance request to install outdoor sidewalk dining area structure.',
    estimatedCost: 8000,
    feePaid: 200,
    workflowSteps: [
      { name: 'Application Intake', status: 'Completed', assignedTo: 'Clerk Office', completedDate: '2026-06-20' },
      { name: 'Plan Review', status: 'Completed', assignedTo: 'Zoning Board', completedDate: '2026-07-05' },
      { name: 'Fee Payment', status: 'Completed', assignedTo: 'Finance Dept', completedDate: '2026-07-06' },
      { name: 'Inspections', status: 'Pending', assignedTo: 'Zoning Inspector' },
      { name: 'Final Sign-off', status: 'Pending', assignedTo: 'Building Official' }
    ]
  },
  perm_06: {
    id: 'perm_06',
    permitNumber: 'BP-2026-0145',
    propertyId: 'prop_05',
    type: 'Building',
    status: 'Issued',
    submittedDate: '2026-05-10',
    issuedDate: '2026-05-25',
    description: 'Foundation and core framework construction of structural three-family multi-residential building.',
    estimatedCost: 1200000,
    feePaid: 15400,
    workflowSteps: [
      { name: 'Application Intake', status: 'Completed', assignedTo: 'Clerk Office', completedDate: '2026-05-10' },
      { name: 'Plan Review', status: 'Completed', assignedTo: 'Zoning Board', completedDate: '2026-05-20' },
      { name: 'Fee Payment', status: 'Completed', assignedTo: 'Finance Dept', completedDate: '2026-05-25' },
      { name: 'Inspections', status: 'In Progress', assignedTo: 'Building Inspector' },
      { name: 'Final Sign-off', status: 'Pending', assignedTo: 'Building Official' }
    ]
  }
};

export interface CodeViolation {
  id: string;
  caseNumber: string;
  propertyId: string;
  violationType: 'Trash & Debris' | 'Structural Hazard' | 'Illegal Signage' | 'Zoning Violation' | 'Unlicensed Business';
  status: 'Open' | 'Notice Issued' | 'In Court' | 'Abated' | 'Fines Paid';
  reportedDate: string;
  inspectorName: string;
  fineAmount: number;
  description: string;
}

export const VIOLATIONS: Record<string, CodeViolation> = {
  viol_01: {
    id: 'viol_01',
    caseNumber: 'CE-2026-0122',
    propertyId: 'prop_02',
    violationType: 'Structural Hazard',
    status: 'Notice Issued',
    reportedDate: '2026-05-18',
    inspectorName: 'Marcus Miller (Building Inspector)',
    fineAmount: 500.00,
    description: 'Loose brick masonry falling from 12th-story exterior ledge. Scaffolding protective netting required.'
  },
  viol_02: {
    id: 'viol_02',
    caseNumber: 'CE-2026-0201',
    propertyId: 'prop_04',
    violationType: 'Trash & Debris',
    status: 'Open',
    reportedDate: '2026-06-28',
    inspectorName: 'Elena Rostova (Code Officer)',
    fineAmount: 250.00,
    description: 'Accumulation of debris and commercial waste bags blocking public right-of-way alley.'
  },
  viol_03: {
    id: 'viol_03',
    caseNumber: 'CE-2026-0205',
    propertyId: 'prop_04',
    violationType: 'Structural Hazard',
    status: 'Open',
    reportedDate: '2026-07-02',
    inspectorName: 'Marcus Miller (Building Inspector)',
    fineAmount: 1500.00,
    description: 'Exposed structural wooden lintels show severe weather rot. Main entryway awning sagging dangerously.'
  }
};

export interface InspectionRecord {
  id: string;
  propertyId: string;
  permitId?: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Passed' | 'Failed' | 'Rescheduled';
  inspectorName: string;
  type: 'Structural' | 'Electrical' | 'Plumbing' | 'Code Enforcement' | 'Safety';
  notes: string;
}

export const INSPECTIONS: Record<string, InspectionRecord> = {
  insp_01: {
    id: 'insp_01',
    propertyId: 'prop_01',
    permitId: 'perm_01',
    scheduledDate: '2026-03-05',
    status: 'Passed',
    inspectorName: 'Sarah Jenkins',
    type: 'Electrical',
    notes: 'Emergency switchboard panels successfully integrated. Auto-transfer tests passed under full building load.'
  },
  insp_02: {
    id: 'insp_02',
    propertyId: 'prop_02',
    permitId: 'perm_02',
    scheduledDate: '2026-05-15',
    status: 'Failed',
    inspectorName: 'Marcus Miller',
    type: 'Structural',
    notes: 'Masonry tuckpointing failed to meet mortar thickness guidelines on south facade. Violation ticket CE-2026-0122 issued.'
  },
  insp_03: {
    id: 'insp_03',
    propertyId: 'prop_02',
    permitId: 'perm_02',
    scheduledDate: '2026-07-07', // Today!
    status: 'Scheduled',
    inspectorName: 'Marcus Miller',
    type: 'Structural',
    notes: 'Re-inspection of brick tuckpointing and review of scaffolding netting installation.'
  },
  insp_04: {
    id: 'insp_04',
    propertyId: 'prop_03',
    permitId: 'perm_05',
    scheduledDate: '2026-07-07', // Today!
    status: 'Scheduled',
    inspectorName: 'Elena Rostova',
    type: 'Code Enforcement',
    notes: 'Verify spacing constraints for sidewalk café table limits relative to fire hydrants.'
  },
  insp_05: {
    id: 'insp_05',
    propertyId: 'prop_04',
    scheduledDate: '2026-07-07', // Today!
    status: 'Scheduled',
    inspectorName: 'Marcus Miller',
    type: 'Safety',
    notes: 'Emergency site visit regarding complaint about deteriorating wooden entryway awning.'
  },
  insp_06: {
    id: 'insp_06',
    propertyId: 'prop_05',
    permitId: 'perm_06',
    scheduledDate: '2026-06-01',
    status: 'Passed',
    inspectorName: 'Marcus Miller',
    type: 'Safety',
    notes: 'Initial Site Inspection. Foundation ground soil conditions assessed and approved for concrete pouring.'
  }
};

export interface TrackerItem {
  id: string;
  module: '311' | 'Permits' | 'Inspections' | 'Code Enforcement' | 'Legislative' | 'Utilities';
  title: string;
  status: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedTo: string;
  slaDays: number;
  slaProgress: number; // 0 to 100 percentage
  reportedDate: string;
  address: string;
  comments: { user: string; text: string; date: string }[];
  history: { action: string; user: string; date: string }[];
  attachments: string[];
  relatedRecords: { type: 'Property' | 'Permit' | 'Violation'; id: string; label: string }[];
  customFields: Record<string, string>;
}

const MOCK_TRACKER_ITEMS: TrackerItem[] = [
  {
    id: 'TRK-9831',
    module: '311',
    title: 'Water pressure drop reported on Ferry St commercial block.',
    status: 'In Progress',
    priority: 'High',
    assignedTo: 'Public Works Water Div',
    slaDays: 2,
    slaProgress: 40,
    reportedDate: '2026-07-06',
    address: '42 Ferry St, Newark, NJ',
    comments: [
      { user: 'Elena Rostova', text: 'Checked local meter. Back-pressure valve shows stable reading. Issue likely street-side.', date: '2026-07-06 14:30' }
    ],
    history: [
      { action: 'Ticket Created', user: 'Resident (Silva Bakery)', date: '2026-07-06 10:11' },
      { action: 'Assigned to Public Works Water Div', user: 'Auto-Routing AI', date: '2026-07-06 10:12' }
    ],
    attachments: ['meter_photo_july6.jpg'],
    relatedRecords: [{ type: 'Property', id: 'prop_03', label: '42 Ferry St' }],
    customFields: { 'SLA Category': 'Water Main Pressure', 'Impact Radius': '1 commercial block', 'Customer Status': 'Silva Bakery Storefront' }
  },
  {
    id: 'TRK-9832',
    module: 'Code Enforcement',
    title: 'Deteriorating entrance structure/sagging awning.',
    status: 'Open',
    priority: 'Critical',
    assignedTo: 'Marcus Miller',
    slaDays: 1,
    slaProgress: 90,
    reportedDate: '2026-07-07',
    address: '105 Market St, Newark, NJ',
    comments: [],
    history: [
      { action: 'Created from Resident Complaint', user: 'Clerk Intake', date: '2026-07-07 08:30' },
      { action: 'Assigned to Marcus Miller', user: 'Supervisor', date: '2026-07-07 08:35' }
    ],
    attachments: ['deteriorating_awning_entryway.jpg'],
    relatedRecords: [{ type: 'Property', id: 'prop_04', label: '105 Market St' }],
    customFields: { 'SLA Category': 'Structural Awning Deterioration', 'Inspector Notes': 'Rotten wood framing exposed to street', 'Public Hazard': 'High' }
  },
  {
    id: 'TRK-9833',
    module: 'Permits',
    title: 'Permit Application: Stained Glass Dome Restoration',
    status: 'Applied',
    priority: 'Medium',
    assignedTo: 'Historical Landmarks Board',
    slaDays: 14,
    slaProgress: 10,
    reportedDate: '2026-07-02',
    address: '920 Broad St, Newark, NJ',
    comments: [],
    history: [
      { action: 'Application Filed', user: 'Municipal Clerk Office', date: '2026-07-02 11:30' }
    ],
    attachments: ['stained_glass_intake_drawings.pdf'],
    relatedRecords: [{ type: 'Property', id: 'prop_01', label: '920 Broad St' }],
    customFields: { 'SLA Category': 'Historical Restoration Permit', 'Estimated Cost': '$85,000', 'Contractor License': 'LIC-2024-0012' }
  },
  {
    id: 'TRK-9834',
    module: 'Inspections',
    title: 'Re-inspection of scaffolding safety netting.',
    status: 'Scheduled',
    priority: 'High',
    assignedTo: 'Marcus Miller',
    slaDays: 2,
    slaProgress: 80,
    reportedDate: '2026-07-05',
    address: '15 Washington St, Newark, NJ',
    comments: [],
    history: [
      { action: 'Inspection Scheduled', user: 'Scheduler system', date: '2026-07-05 16:00' }
    ],
    attachments: ['scaffolding_safety_certificate.pdf', 'netting_reanchor_photo.jpg'],
    relatedRecords: [{ type: 'Property', id: 'prop_02', label: '15 Washington St' }, { type: 'Permit', id: 'perm_02', label: 'PM-2026-0182' }],
    customFields: { 'SLA Category': 'Safety Inspection', 'Netting Required': 'Yes', 'Compliance Penalty': '$500 / day' }
  }
];

export interface LegislativeItem {
  id: string;
  meetingDate: string;
  agendaNumber: string;
  title: string;
  description: string;
  status: 'Draft' | 'Pending Action' | 'Approved' | 'Tabled' | 'Passed';
  linkedEntities: {
    type: 'Property' | 'Business' | 'Developer' | 'Project' | 'Permit';
    id: string;
    label: string;
  }[];
  parsedEntities: {
    resolutionNumber: string;
    department: string;
    businesses: string[];
    developers: string[];
    contractors: string[];
    propertyAddresses: string[];
    parcelNumbers: string[];
    projectNames: string[];
    permitNumbers: string[];
    ordinanceNumbers: string[];
    boardCommittee: string;
    meetingDate: string;
  };
  aiSummary: {
    plainSummary: string;
    departmentsAffected: string[];
    projectsAffected: string[];
    businessesAffected: string[];
    propertiesAffected: string[];
    suggestedUpdates: string[];
    followUpTasks: string[];
    riskFlags: string[];
    deadlines: string[];
  };
}

export const LEGISLATIVE_ITEMS: LegislativeItem[] = [
  {
    id: 'LEG-2026-004',
    meetingDate: '2026-07-09',
    agendaNumber: 'IX.B.1',
    title: 'Resolution Allocating Redevelopment Grant Funds for 15 Washington St Facade Restoration',
    description: 'Consideration of a resolution authorizing municipal cost-sharing under the Historic Rehabilitation Act for structural repairs on multi-family high-density envelopes.',
    status: 'Pending Action',
    linkedEntities: [
      { type: 'Property', id: 'prop_02', label: '15 Washington St' },
      { type: 'Permit', id: 'perm_02', label: 'PM-2026-0182' }
    ],
    parsedEntities: {
      resolutionNumber: 'RES-2026-094',
      department: 'Economic & Housing Development',
      businesses: ['Washington Street Development Partners LLC'],
      developers: ['Washington Street Development Partners LLC'],
      contractors: ['Miller Facade Restoration Inc'],
      propertyAddresses: ['15 Washington St, Newark, NJ'],
      parcelNumbers: ['Block 201, Lot 14'],
      projectNames: ['Historic Rehabilitation Facade Program'],
      permitNumbers: ['PM-2026-0182'],
      ordinanceNumbers: ['ORD-2025-0812'],
      boardCommittee: 'Zoning & Landmarks Committee',
      meetingDate: '2026-07-09'
    },
    aiSummary: {
      plainSummary: 'Approves cost-sharing grant under the Historic Rehabilitation Act to co-fund facade repairs at 15 Washington St. Funds allocated from city reserves.',
      departmentsAffected: ['Economic & Housing Development', 'Finance Department'],
      projectsAffected: ['Historic Rehabilitation Program'],
      businessesAffected: ['Washington Street Development Partners LLC'],
      propertiesAffected: ['15 Washington St (prop_02)'],
      suggestedUpdates: ['Update Redevelopment Agreement active status', 'Link permit PM-2026-0182 compliance notes'],
      followUpTasks: [
        'Collect builder safety certificate post-council approval',
        'Verify scaffolding permit duration dates'
      ],
      riskFlags: ['Work has already commenced under temporary permit', 'Budget variance threshold is close to allocation limits (+/- 5%)'],
      deadlines: ['Submit expenditure claims before 2026-08-31']
    }
  },
  {
    id: 'LEG-2026-005',
    meetingDate: '2026-07-09',
    agendaNumber: 'X.A.2',
    title: 'Ordinance Declaring Downtown Market St Properties Tax-Delinquent Conservation Zone',
    description: 'An ordinance introducing specific tax foreclosures and revitalization options for properties failing code requirements for over 180 continuous days.',
    status: 'Pending Action',
    linkedEntities: [
      { type: 'Property', id: 'prop_04', label: '105 Market St' }
    ],
    parsedEntities: {
      resolutionNumber: 'RES-2026-105',
      department: 'Finance & Law Administration',
      businesses: ['Market Street Realty Holdings'],
      developers: [],
      contractors: [],
      propertyAddresses: ['105 Market St, Newark, NJ'],
      parcelNumbers: ['Block 304, Lot 22'],
      projectNames: ['Downtown Conservation Initiative'],
      permitNumbers: [],
      ordinanceNumbers: ['ORD-2026-0091'],
      boardCommittee: 'Finance Committee',
      meetingDate: '2026-07-09'
    },
    aiSummary: {
      plainSummary: 'Mandates tax foreclosure proceedings and redevelopment zone status for commercial properties showing outstanding code violations and delinquent tax liabilities exceeding 180 days.',
      departmentsAffected: ['Finance Department', 'Code Enforcement & Legal Board'],
      projectsAffected: ['Downtown Conservation Zone Initiative'],
      businessesAffected: ['Market Street Realty Holdings'],
      propertiesAffected: ['105 Market St (prop_04)'],
      suggestedUpdates: ['Update property tax delinquency status to Alert', 'Issue notices of foreclosure eligibility'],
      followUpTasks: [
        'Confirm duration of open code violation CE-2026-0201 (Debris)',
        'Draft tax foreclosure warning notice for owner'
      ],
      riskFlags: ['Prop 04 is currently unoccupied', 'Owner response window expires in 14 business days'],
      deadlines: ['First Reading on 2026-07-09', 'Owner Response Deadline: 2026-07-23']
    }
  },
  {
    id: 'LEG-2026-007',
    meetingDate: '2026-07-09',
    agendaNumber: 'IX.B.2',
    title: 'Resolution 26-0356: Authorizing West Ward Redevelopment Agreement and Site Plan Approval with DCF Developers, LLC for Market Street Enclaves',
    description: 'A resolution approving the Redevelopment Agreement, Site Plan Approval, and construction licenses to DCF Developers, LLC for building multi-family units at 125 and 129 Market Street.',
    status: 'Pending Action',
    linkedEntities: [
      { type: 'Property', id: 'prop_05', label: '125 Market St' },
      { type: 'Property', id: 'prop_06', label: '129 Market St' },
      { type: 'Permit', id: 'perm_06', label: 'BP-2026-0145' }
    ],
    parsedEntities: {
      resolutionNumber: 'RES-2026-0356',
      department: 'Economic & Housing Development',
      businesses: ['DCF Developers, LLC'],
      developers: ['DCF Developers, LLC'],
      contractors: [],
      propertyAddresses: ['125 Market St, Newark, NJ', '129 Market St, Newark, NJ'],
      parcelNumbers: ['Block 304, Lots 12 & 13'],
      projectNames: ['West Ward Redevelopment Project'],
      permitNumbers: ['BP-2026-0145'],
      ordinanceNumbers: ['ORD-2026-0044'],
      boardCommittee: 'Zoning & Landmarks Committee',
      meetingDate: '2026-07-09'
    },
    aiSummary: {
      plainSummary: 'Approves the formal West Ward Redevelopment Agreement and Site Plan details with DCF Developers, LLC for the 125 & 129 Market St properties. Establishes structural guidelines and inspection protocols.',
      departmentsAffected: ['Economic & Housing Development', 'Zoning Board'],
      projectsAffected: ['West Ward Redevelopment'],
      businessesAffected: ['DCF Developers, LLC'],
      propertiesAffected: ['125 Market St (prop_05)', '129 Market St (prop_06)'],
      suggestedUpdates: ['Mark Building Permit BP-2026-0145 active status', 'Log Initial Site Inspection insp_06 outputs'],
      followUpTasks: [
        'Collect signature execution sheets for Redevelopment Agreement',
        'Verify council resolution minutes records post-vote'
      ],
      riskFlags: ['High priority project. Local parking setback requirements must be closely audited during foundation inspections'],
      deadlines: ['Approval Hearing on 2026-07-09', 'Site Plan final claims: 2026-08-15']
    }
  }
];

export const PROPERTIES = MOCK_PROPERTIES;
export const TRACKER_ITEMS = MOCK_TRACKER_ITEMS;
