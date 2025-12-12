import { PrismaClient, Role, DriverStatus, EquipmentType, LoadMode, LoadStatus, DispatchStatus, StopType, AccessorialType, InvoiceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.refreshToken.deleteMany(),
    prisma.trackingEvent.deleteMany(),
    prisma.dispatch.deleteMany(),
    prisma.loadItem.deleteMany(),
    prisma.loadStop.deleteMany(),
    prisma.accessorialCharge.deleteMany(),
    prisma.rate.deleteMany(),
    prisma.load.deleteMany(),
    prisma.driver.deleteMany(),
    prisma.equipment.deleteMany(),
    prisma.carrier.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.location.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.tenant.deleteMany(),
  ]);

  const passwordHash = await bcrypt.hash('Password123!', 10);

  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Acme Logistics',
      domain: 'acme.test',
      users: {
        create: [
          { name: 'Alice Admin', email: 'alice@acme.test', passwordHash, role: Role.ADMIN },
          { name: 'Dan Dispatcher', email: 'dan@acme.test', passwordHash, role: Role.DISPATCHER },
          { name: 'Ivy Accounting', email: 'ivy@acme.test', passwordHash, role: Role.ACCOUNTING },
        ],
      },
      customers: {
        create: [
          { name: 'Globex Corp', contactName: 'Mary Manager', contactEmail: 'mary@globex.com', phone: '555-1000' },
          { name: 'Initech', contactName: 'Peter G', contactEmail: 'peter@initech.com', phone: '555-2222' },
        ],
      },
      carriers: {
        create: [
          { name: 'Fast Transport', mcNumber: 'MC123', dotNumber: 'DOT987', phone: '555-3333' },
          { name: 'Blue Trucking', mcNumber: 'MC456', dotNumber: 'DOT654', phone: '555-4444' },
        ],
      },
      drivers: {
        create: [
          { name: 'John Driver', phone: '555-5555', email: 'john@fast.com', status: DriverStatus.ACTIVE },
          { name: 'Rita Road', phone: '555-6666', email: 'rita@blue.com', status: DriverStatus.ACTIVE },
        ],
      },
      equipment: {
        create: [
          { type: EquipmentType.DRY_VAN, trailerNumber: 'TR-100', plateNumber: 'ABC123', capacityWeight: 45000 },
          { type: EquipmentType.REEFER, trailerNumber: 'TR-200', plateNumber: 'XYZ987', capacityWeight: 42000 },
        ],
      },
      locations: {
        create: [
          { name: 'Chicago DC', addressLine1: '100 Main St', city: 'Chicago', state: 'IL', postalCode: '60007', country: 'USA' },
          { name: 'Dallas DC', addressLine1: '200 Commerce Rd', city: 'Dallas', state: 'TX', postalCode: '75001', country: 'USA' },
          { name: 'Atlanta DC', addressLine1: '300 Cargo Ave', city: 'Atlanta', state: 'GA', postalCode: '30301', country: 'USA' },
        ],
      },
    },
    include: { customers: true, locations: true },
  });

  const [customer] = tenantA.customers;
  const [pickup, delivery] = tenantA.locations;

  const load = await prisma.load.create({
    data: {
      tenantId: tenantA.id,
      customerId: customer.id,
      referenceNumber: 'ACME-LOAD-1',
      customerReference: 'PO-123',
      mode: LoadMode.FTL,
      equipmentType: EquipmentType.DRY_VAN,
      status: LoadStatus.DISPATCHED,
      totalWeight: 20000,
      rateTotal: 3200,
      fuelSurcharge: 200,
      accessorialTotal: 150,
      stops: {
        create: [
          {
            tenantId: tenantA.id,
            locationId: pickup.id,
            sequenceNumber: 1,
            stopType: StopType.PICKUP,
            scheduledArrival: new Date(),
          },
          {
            tenantId: tenantA.id,
            locationId: delivery.id,
            sequenceNumber: 2,
            stopType: StopType.DELIVERY,
            scheduledArrival: new Date(Date.now() + 1000 * 60 * 60 * 24),
          },
        ],
      },
      items: {
        create: [
          { tenantId: tenantA.id, description: 'Pallets of widgets', weight: 20000, pieces: 20 },
        ],
      },
      accessorials: {
        create: [
          { tenantId: tenantA.id, type: AccessorialType.DETENTION, amount: 150, description: 'Detention' },
        ],
      },
      rates: {
        create: [
          { tenantId: tenantA.id, baseRate: 3000, fuelSurcharge: 200, accessorialTotal: 150, currency: 'USD' },
        ],
      },
      invoices: {
        create: [
          {
            tenantId: tenantA.id,
            invoiceNumber: 'INV-1001',
            billedToCustomerId: customer.id,
            amount: 3350,
            status: InvoiceStatus.SENT,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          },
        ],
      },
    },
  });

  await prisma.dispatch.create({
    data: {
      tenantId: tenantA.id,
      loadId: load.id,
      driverId: tenantA.drivers?.[0]?.id,
      carrierId: tenantA.carriers?.[0]?.id,
      status: DispatchStatus.IN_PROGRESS,
      trackingEvents: {
        create: [
          {
            tenantId: tenantA.id,
            loadId: load.id,
            eventType: 'STATUS_CHANGE',
            notes: 'Departed pickup',
          },
        ],
      },
    },
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Beta Freight',
      domain: 'beta.test',
      users: {
        create: [{ name: 'Bob Admin', email: 'bob@beta.test', passwordHash, role: Role.ADMIN }],
      },
      customers: { create: [{ name: 'Umbrella Corp', phone: '555-8888' }] },
    },
  });

  console.log('Seed complete', { tenantA: tenantA.id, tenantB: tenantB.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
