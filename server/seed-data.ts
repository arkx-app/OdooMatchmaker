import { db } from "./db";
import { partners, users, briefs, clients, matches } from "@shared/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// Sample clients for testing partner swiping
export const SAMPLE_CLIENTS = [
  {
    name: "John Smith",
    email: "john@acmecorp.com",
    company: "Acme Corporation",
    industry: "Manufacturing",
    budget: "50000-100000",
    companySize: "smb",
    projectTimeline: "3-6 months",
    odooModules: ["Manufacturing", "Inventory", "Accounting", "MRP"],
  },
  {
    name: "Emily Davis",
    email: "emily@techstart.io",
    company: "TechStart Inc",
    industry: "Technology",
    budget: "25000-50000",
    companySize: "startup",
    projectTimeline: "1-3 months",
    odooModules: ["CRM", "Sales", "Project", "Invoicing"],
  },
  {
    name: "Michael Brown",
    email: "michael@globalretail.com",
    company: "Global Retail Group",
    industry: "Retail",
    budget: "100000-250000",
    companySize: "enterprise",
    projectTimeline: "6-12 months",
    odooModules: ["Point of Sale", "eCommerce", "Inventory", "Accounting", "CRM"],
  },
  {
    name: "Sarah Wilson",
    email: "sarah@healthplus.org",
    company: "HealthPlus Medical",
    industry: "Healthcare",
    budget: "25000-50000",
    companySize: "smb",
    projectTimeline: "3-6 months",
    odooModules: ["HR", "Payroll", "Timesheets", "Accounting"],
  },
  {
    name: "David Lee",
    email: "david@constructco.com",
    company: "ConstructCo Builders",
    industry: "Construction",
    budget: "50000-100000",
    companySize: "smb",
    projectTimeline: "3-6 months",
    odooModules: ["Project", "Timesheets", "Accounting", "Invoicing"],
  },
];

// Sample project briefs for testing
export const SAMPLE_BRIEFS = [
  {
    title: "ERP Implementation for E-commerce Platform",
    description: "Looking for an experienced Odoo partner to help implement a full ERP solution for our growing e-commerce business. We need inventory management, order processing, and accounting integration.",
    modules: ["eCommerce", "Inventory", "Accounting", "CRM"],
    budget: "$25k-50k",
    timelineWeeks: 12,
    painPoints: ["Manual inventory tracking", "Disconnected systems", "Slow order processing"],
    integrations: ["Shopify", "QuickBooks", "Stripe"],
    priority: "high",
    status: "active",
  },
  {
    title: "Manufacturing MRP System Upgrade",
    description: "Need to upgrade our existing manufacturing processes with Odoo MRP. Currently using spreadsheets for production planning and need a more robust solution.",
    modules: ["Manufacturing", "MRP", "Quality Control", "Maintenance"],
    budget: "$50k-100k",
    timelineWeeks: 16,
    painPoints: ["Production delays", "Quality issues", "Lack of visibility"],
    integrations: ["CAD Software", "IoT Sensors"],
    priority: "medium",
    status: "matching",
  },
  {
    title: "HR & Payroll System Implementation",
    description: "Small but growing company seeking Odoo partner for HR module implementation. Need employee management, timesheet tracking, and payroll integration for 50+ employees.",
    modules: ["HR", "Payroll", "Timesheets", "Recruitment"],
    budget: "$10k-25k",
    timelineWeeks: 8,
    painPoints: ["Manual payroll processing", "No time tracking", "Paper-based HR"],
    integrations: ["ADP", "Slack"],
    priority: "high",
    status: "active",
  },
];

export const SEED_PARTNERS = [
  {
    name: "Sarah Chen",
    email: "sarah@openbridge.io",
    company: "OpenBridge Solutions",
    industry: "Manufacturing",
    services: ["ERP Implementation", "Manufacturing MRP", "Quality Control", "Inventory Management", "Production Planning"],
    rating: 5,
    reviewCount: 47,
    description: "Specialized in helping manufacturers digitize their operations with Odoo. 8+ years of experience in automotive and electronics industries. Certified Odoo Gold Partner with expertise in MRP, PLM, and shop floor automation.",
    hourlyRateMin: 150,
    hourlyRateMax: 250,
    capacity: "available",
    certifications: ["Odoo Gold Partner", "Manufacturing Specialist", "Inventory Expert"],
    website: "https://openbridge.io",
    verified: true,
  },
  {
    name: "Marcus Johnson",
    email: "marcus@retailflow.com",
    company: "RetailFlow Partners",
    industry: "Retail",
    services: ["Point of Sale", "eCommerce Integration", "Inventory Management", "Multi-store Operations", "Loyalty Programs"],
    rating: 5,
    reviewCount: 63,
    description: "We transform retail businesses with integrated Odoo solutions. From single stores to 100+ location chains, we've helped retailers increase efficiency by 40% on average. Specialists in omnichannel retail.",
    hourlyRateMin: 125,
    hourlyRateMax: 200,
    capacity: "limited",
    certifications: ["Odoo Silver Partner", "Retail Expert", "POS Specialist"],
    website: "https://retailflow.com",
    verified: true,
  },
  {
    name: "Elena Rodriguez",
    email: "elena@financeodoo.pro",
    company: "FinanceOdoo Pro",
    industry: "Financial Services",
    services: ["Accounting", "Financial Reporting", "Multi-currency", "Bank Reconciliation", "Budgeting", "Audit Trail"],
    rating: 5,
    reviewCount: 89,
    description: "Former Big 4 consultant now dedicated to Odoo financial implementations. Expert in complex multi-company structures, consolidation, and regulatory compliance. Helped 200+ companies streamline their finance operations.",
    hourlyRateMin: 175,
    hourlyRateMax: 300,
    capacity: "available",
    certifications: ["Odoo Gold Partner", "Accounting Expert", "CPA"],
    website: "https://financeodoo.pro",
    verified: true,
  },
  {
    name: "Thomas Weber",
    email: "thomas@supplychain.expert",
    company: "SupplyChain Expert GmbH",
    industry: "Logistics",
    services: ["Warehouse Management", "Purchase Management", "Shipping Integration", "Dropshipping", "Demand Forecasting"],
    rating: 4,
    reviewCount: 34,
    description: "German precision meets Odoo flexibility. We optimize supply chains for European businesses with complex logistics needs. Integrated 50+ WMS and TMS systems with Odoo.",
    hourlyRateMin: 140,
    hourlyRateMax: 220,
    capacity: "available",
    certifications: ["Odoo Silver Partner", "Logistics Specialist"],
    website: "https://supplychain.expert",
    verified: true,
  },
  {
    name: "Priya Sharma",
    email: "priya@hrtech.solutions",
    company: "HRTech Solutions",
    industry: "Human Resources",
    services: ["HR Management", "Payroll", "Recruitment", "Employee Self-Service", "Time & Attendance", "Performance Management"],
    rating: 5,
    reviewCount: 52,
    description: "End-to-end HR digital transformation with Odoo. We've helped companies reduce HR admin time by 60% and improve employee satisfaction. Specialists in payroll localization for 30+ countries.",
    hourlyRateMin: 100,
    hourlyRateMax: 175,
    capacity: "available",
    certifications: ["Odoo Partner", "HR Expert", "Payroll Specialist"],
    website: "https://hrtech.solutions",
    verified: true,
  },
  {
    name: "David Kim",
    email: "david@projectmaster.io",
    company: "ProjectMaster",
    industry: "Professional Services",
    services: ["Project Management", "Timesheets", "Resource Planning", "Billing & Invoicing", "Field Service"],
    rating: 4,
    reviewCount: 28,
    description: "Helping consulting firms and agencies manage projects profitably with Odoo. Our implementations focus on billable utilization tracking and client profitability analysis.",
    hourlyRateMin: 120,
    hourlyRateMax: 190,
    capacity: "limited",
    certifications: ["Odoo Partner", "Project Management Pro"],
    website: "https://projectmaster.io",
    verified: true,
  },
  {
    name: "Sophie Martin",
    email: "sophie@healthodoo.eu",
    company: "HealthOdoo Europe",
    industry: "Healthcare",
    services: ["Hospital Management", "Patient Records", "Appointment Scheduling", "Medical Inventory", "GDPR Compliance"],
    rating: 5,
    reviewCount: 41,
    description: "HIPAA and GDPR compliant Odoo implementations for healthcare providers. From small clinics to hospital networks, we ensure your systems meet regulatory requirements while improving patient care.",
    hourlyRateMin: 160,
    hourlyRateMax: 280,
    capacity: "available",
    certifications: ["Odoo Gold Partner", "Healthcare Specialist", "GDPR Expert"],
    website: "https://healthodoo.eu",
    verified: true,
  },
  {
    name: "James O'Connor",
    email: "james@foodbeverage.odoo",
    company: "F&B Digital Solutions",
    industry: "Food & Beverage",
    services: ["Recipe Management", "Lot Traceability", "Quality Control", "Expiry Management", "Production Planning"],
    rating: 4,
    reviewCount: 23,
    description: "Specialists in food manufacturing and distribution. We understand FDA requirements, lot traceability, and the unique challenges of perishable inventory management.",
    hourlyRateMin: 130,
    hourlyRateMax: 210,
    capacity: "available",
    certifications: ["Odoo Partner", "Food Industry Expert"],
    website: "https://foodbeverage.odoo",
    verified: true,
  },
  {
    name: "Lisa Thompson",
    email: "lisa@constructodoo.com",
    company: "ConstructOdoo",
    industry: "Construction",
    services: ["Project Costing", "Subcontractor Management", "Equipment Tracking", "Job Costing", "Progress Billing"],
    rating: 5,
    reviewCount: 36,
    description: "Building the future with Odoo. We help construction companies manage complex projects with multiple subcontractors, track equipment, and ensure accurate job costing.",
    hourlyRateMin: 145,
    hourlyRateMax: 230,
    capacity: "limited",
    certifications: ["Odoo Silver Partner", "Construction Specialist"],
    website: "https://constructodoo.com",
    verified: true,
  },
  {
    name: "Ahmed Hassan",
    email: "ahmed@educationerp.pro",
    company: "EduERP Pro",
    industry: "Education",
    services: ["Student Management", "Course Planning", "Admission Portal", "Fee Management", "Learning Management"],
    rating: 4,
    reviewCount: 19,
    description: "Transforming educational institutions with Odoo. From K-12 schools to universities, we provide complete student lifecycle management solutions.",
    hourlyRateMin: 90,
    hourlyRateMax: 150,
    capacity: "available",
    certifications: ["Odoo Partner", "Education Specialist"],
    website: "https://educationerp.pro",
    verified: true,
  },
  {
    name: "Maria Garcia",
    email: "maria@ecommerce.master",
    company: "eCommerce Masters",
    industry: "Technology",
    services: ["Odoo eCommerce", "Website Builder", "SEO Optimization", "Payment Gateways", "Marketplace Integration"],
    rating: 5,
    reviewCount: 78,
    description: "We build high-converting Odoo eCommerce stores. Integrated with Amazon, eBay, Shopify, and 20+ marketplaces. Average client sees 35% increase in online sales.",
    hourlyRateMin: 110,
    hourlyRateMax: 185,
    capacity: "available",
    certifications: ["Odoo Gold Partner", "eCommerce Expert", "SEO Specialist"],
    website: "https://ecommerce.master",
    verified: true,
  },
  {
    name: "Robert Chen",
    email: "robert@automotiveodoo.com",
    company: "Automotive Odoo Solutions",
    industry: "Automotive",
    services: ["Dealer Management", "Service Scheduling", "Parts Inventory", "Vehicle Tracking", "Warranty Management"],
    rating: 4,
    reviewCount: 31,
    description: "Comprehensive Odoo solutions for automotive dealers and service centers. We integrate with major DMS systems and provide specialized modules for vehicle sales and service.",
    hourlyRateMin: 155,
    hourlyRateMax: 245,
    capacity: "available",
    certifications: ["Odoo Silver Partner", "Automotive Industry Expert"],
    website: "https://automotiveodoo.com",
    verified: true,
  },
];

export async function seedPartners() {
  console.log("Checking for existing partners...");
  
  const existingPartners = await db.select().from(partners);
  
  if (existingPartners.length > 0) {
    console.log(`Found ${existingPartners.length} existing partners, skipping seed.`);
    return;
  }

  console.log("Seeding partner data...");

  for (const partnerData of SEED_PARTNERS) {
    try {
      const partnerId = randomUUID();
      const userId = randomUUID();
      const passwordHash = await bcrypt.hash("demo123", 10);

      await db.insert(users).values({
        id: partnerData.email,
        email: partnerData.email,
        passwordHash,
        firstName: partnerData.name.split(" ")[0],
        lastName: partnerData.name.split(" ").slice(1).join(" "),
        role: "partner",
        authProvider: "local",
        emailVerified: true,
      }).onConflictDoNothing();

      await db.insert(partners).values({
        id: partnerId,
        userId: partnerData.email,
        name: partnerData.name,
        email: partnerData.email,
        company: partnerData.company,
        industry: partnerData.industry,
        services: partnerData.services,
        rating: partnerData.rating,
        reviewCount: partnerData.reviewCount,
        description: partnerData.description,
        hourlyRateMin: partnerData.hourlyRateMin,
        hourlyRateMax: partnerData.hourlyRateMax,
        capacity: partnerData.capacity,
        certifications: partnerData.certifications,
        website: partnerData.website,
        verified: partnerData.verified,
      }).onConflictDoNothing();

      console.log(`Seeded partner: ${partnerData.company}`);
    } catch (error) {
      console.log(`Partner ${partnerData.company} may already exist, skipping...`);
    }
  }

  console.log("Partner seeding complete!");
}

// Seed sample briefs for a specific client
export async function seedBriefsForClient(clientId: string) {
  console.log(`Checking for existing briefs for client ${clientId}...`);
  
  const existingBriefs = await db.select().from(briefs).where(
    eq(briefs.clientId, clientId)
  );
  
  if (existingBriefs.length > 0) {
    console.log(`Client already has ${existingBriefs.length} briefs, skipping seed.`);
    return existingBriefs;
  }

  console.log("Seeding sample briefs for client...");
  const seededBriefs = [];

  for (const briefData of SAMPLE_BRIEFS) {
    try {
      const briefId = randomUUID();
      
      const [newBrief] = await db.insert(briefs).values({
        id: briefId,
        clientId,
        title: briefData.title,
        description: briefData.description,
        modules: briefData.modules,
        budget: briefData.budget,
        timelineWeeks: briefData.timelineWeeks,
        painPoints: briefData.painPoints,
        integrations: briefData.integrations,
        priority: briefData.priority,
        status: briefData.status,
      }).returning();

      seededBriefs.push(newBrief);
      console.log(`Seeded brief: ${briefData.title}`);
    } catch (error) {
      console.log(`Failed to seed brief: ${briefData.title}`, error);
    }
  }

  console.log(`Brief seeding complete! Created ${seededBriefs.length} briefs.`);
  return seededBriefs;
}

// Seed test clients who have "liked" partners for testing partner swiping
export async function seedTestClientsForPartnerSwiping() {
  console.log("Checking for existing test clients...");
  
  // Get all partners
  const allPartners = await db.select().from(partners);
  if (allPartners.length === 0) {
    console.log("No partners found, skipping client seeding.");
    return;
  }

  // Check if we already have test clients
  const existingClients = await db.select().from(clients);
  if (existingClients.length >= 5) {
    console.log(`Found ${existingClients.length} existing clients, skipping seed.`);
    return;
  }

  console.log("Seeding test clients for partner swiping...");

  for (const clientData of SAMPLE_CLIENTS) {
    try {
      const clientId = randomUUID();
      const passwordHash = await bcrypt.hash("demo123", 10);

      // Create user for client
      await db.insert(users).values({
        id: clientData.email,
        email: clientData.email,
        passwordHash,
        firstName: clientData.name.split(" ")[0],
        lastName: clientData.name.split(" ").slice(1).join(" "),
        role: "client",
        authProvider: "local",
        emailVerified: true,
      }).onConflictDoNothing();

      // Create client profile
      await db.insert(clients).values({
        id: clientId,
        userId: clientData.email,
        name: clientData.name,
        email: clientData.email,
        company: clientData.company,
        industry: clientData.industry,
        budget: clientData.budget,
        companySize: clientData.companySize,
        projectTimeline: clientData.projectTimeline,
        odooModules: clientData.odooModules,
      }).onConflictDoNothing();

      // Create a brief for this client
      const briefId = randomUUID();
      await db.insert(briefs).values({
        id: briefId,
        clientId,
        title: `${clientData.company} ERP Implementation`,
        description: `Looking for an Odoo partner to help with ${clientData.odooModules.join(", ")} implementation.`,
        modules: clientData.odooModules,
        budget: clientData.budget,
        timelineWeeks: 12,
        priority: "high",
        status: "active",
      }).onConflictDoNothing();

      // Create matches where this client "liked" some partners
      // Each client likes 2-3 random partners
      const partnersToLike = allPartners.slice(0, 3);
      for (const partner of partnersToLike) {
        const matchId = randomUUID();
        await db.insert(matches).values({
          id: matchId,
          clientId,
          partnerId: partner.id,
          briefId,
          clientLiked: true,
          partnerResponded: false,
          partnerAccepted: false,
          status: "suggested",
          score: Math.floor(Math.random() * 30) + 70, // 70-100 score
        }).onConflictDoNothing();
      }

      console.log(`Seeded client: ${clientData.company} with matches`);
    } catch (error) {
      console.log(`Client ${clientData.company} may already exist, skipping...`);
    }
  }

  console.log("Test client seeding complete!");
}
