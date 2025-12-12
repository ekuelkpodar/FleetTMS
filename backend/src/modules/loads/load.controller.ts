import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { toPaginationParams } from '../../common/pagination';
import { LoadStatus, StopType, EquipmentType, LoadMode, AccessorialType, TrackingEventType, DocumentType } from '@prisma/client';

export const loadRouter = Router();

const stopSchema = z.object({
  locationId: z.string(),
  sequenceNumber: z.number().int().positive(),
  stopType: z.nativeEnum(StopType),
  scheduledArrival: z.string().datetime().optional(),
  scheduledDeparture: z.string().datetime().optional(),
  instructions: z.string().optional(),
});

const itemSchema = z.object({
  description: z.string(),
  weight: z.number().int().optional(),
  volume: z.number().int().optional(),
  pieces: z.number().int().optional(),
  nmfcCode: z.string().optional(),
});

const loadSchema = z.object({
  customerId: z.string().optional(),
  referenceNumber: z.string().min(2),
  customerReference: z.string().optional(),
  mode: z.nativeEnum(LoadMode),
  equipmentType: z.nativeEnum(EquipmentType),
  status: z.nativeEnum(LoadStatus).optional(),
  totalWeight: z.number().int().optional(),
  totalVolume: z.number().int().optional(),
  numberOfPieces: z.number().int().optional(),
  rateTotal: z.number().optional(),
  fuelSurcharge: z.number().optional(),
  accessorialTotal: z.number().optional(),
  currency: z.string().optional(),
  stops: z.array(stopSchema),
  items: z.array(itemSchema).optional(),
  accessorials: z
    .array(
      z.object({
        type: z.nativeEnum(AccessorialType),
        amount: z.number(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export function ensureStopsValid(stops: z.infer<typeof stopSchema>[]) {
  const pickupCount = stops.filter((s) => s.stopType === StopType.PICKUP).length;
  const deliveryCount = stops.filter((s) => s.stopType === StopType.DELIVERY).length;
  if (pickupCount === 0 || deliveryCount === 0) {
    throw new Error('Load requires at least one pickup and one delivery');
  }
  const sequences = stops.map((s) => s.sequenceNumber).sort((a, b) => a - b);
  sequences.forEach((val, idx) => {
    if (val !== idx + 1) throw new Error('Stop sequence must be contiguous starting at 1');
  });
}

loadRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const { page, pageSize, skip, take } = toPaginationParams(req.query);
    const status = req.query.status as LoadStatus | undefined;
    const customerId = req.query.customerId as string | undefined;
    const where: any = { tenantId: req.user!.tenantId };
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    const [data, total] = await Promise.all([
      prisma.load.findMany({
        where,
        include: { customer: true, stops: { include: { location: true } }, invoices: true },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.load.count({ where }),
    ]);
    res.json({ data, page, pageSize, total });
  } catch (err) {
    next(err);
  }
});

loadRouter.post('/', verifyAuth, validateBody(loadSchema), async (req: AuthRequest, res, next) => {
  try {
    ensureStopsValid(req.body.stops);
    const load = await prisma.load.create({
      data: {
        tenantId: req.user!.tenantId,
        customerId: req.body.customerId,
        referenceNumber: req.body.referenceNumber,
        customerReference: req.body.customerReference,
        mode: req.body.mode,
        equipmentType: req.body.equipmentType,
        status: req.body.status || LoadStatus.DRAFT,
        totalWeight: req.body.totalWeight,
        totalVolume: req.body.totalVolume,
        numberOfPieces: req.body.numberOfPieces,
        rateTotal: req.body.rateTotal,
        fuelSurcharge: req.body.fuelSurcharge,
        accessorialTotal: req.body.accessorialTotal,
        currency: req.body.currency || 'USD',
        stops: {
          create: req.body.stops.map((s) => ({
            ...s,
            tenantId: req.user!.tenantId,
            scheduledArrival: s.scheduledArrival ? new Date(s.scheduledArrival) : undefined,
            scheduledDeparture: s.scheduledDeparture ? new Date(s.scheduledDeparture) : undefined,
          })),
        },
        items: {
          create: req.body.items?.map((item) => ({ ...item, tenantId: req.user!.tenantId })) || [],
        },
        accessorials: {
          create: req.body.accessorials?.map((a) => ({ ...a, tenantId: req.user!.tenantId })) || [],
        },
      },
      include: { stops: true, items: true, accessorials: true },
    });
    res.status(201).json({ data: load });
  } catch (err) {
    next(err);
  }
});

loadRouter.get('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const load = await prisma.load.findFirst({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      include: {
        customer: true,
        stops: { include: { location: true } },
        items: true,
        dispatches: true,
        accessorials: true,
        trackingEvents: true,
        documents: true,
        invoices: true,
      },
    });
    if (!load) return res.status(404).json({ error: { message: 'Not found' } });
    res.json({ data: load });
  } catch (err) {
    next(err);
  }
});

loadRouter.put('/:id', verifyAuth, validateBody(loadSchema.partial()), async (req: AuthRequest, res, next) => {
  try {
    if (req.body.stops) ensureStopsValid(req.body.stops as any);
    const load = await prisma.load.updateMany({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      data: { ...req.body },
    });
    if (load.count === 0) return res.status(404).json({ error: { message: 'Not found' } });
    const data = await prisma.load.findUnique({ where: { id: req.params.id } });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

loadRouter.delete('/:id', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    await prisma.load.updateMany({ where: { id: req.params.id, tenantId: req.user!.tenantId }, data: { status: LoadStatus.CANCELLED } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

const rateSchema = z.object({ baseRate: z.number(), fuelSurcharge: z.number().optional(), accessorials: z.array(z.object({ type: z.nativeEnum(AccessorialType), amount: z.number() })).optional() });

loadRouter.post('/:id/rate/calculate', verifyAuth, validateBody(rateSchema), async (req: AuthRequest, res, next) => {
  try {
    const load = await prisma.load.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!load) return res.status(404).json({ error: { message: 'Load not found' } });
    const accessorialTotal = req.body.accessorials?.reduce((sum, a) => sum + a.amount, 0) || 0;
    const total = req.body.baseRate + (req.body.fuelSurcharge || 0) + accessorialTotal;
    await prisma.rate.create({
      data: {
        tenantId: req.user!.tenantId,
        loadId: load.id,
        baseRate: req.body.baseRate,
        fuelSurcharge: req.body.fuelSurcharge,
        accessorialTotal,
        currency: load.currency,
      },
    });
    await prisma.load.update({
      where: { id: load.id },
      data: { rateTotal: total, fuelSurcharge: req.body.fuelSurcharge, accessorialTotal },
    });
    res.json({ total, currency: load.currency });
  } catch (err) {
    next(err);
  }
});

const eventSchema = z.object({
  eventType: z.nativeEnum(TrackingEventType),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  notes: z.string().optional(),
});

loadRouter.post('/:id/events', verifyAuth, validateBody(eventSchema), async (req: AuthRequest, res, next) => {
  try {
    const load = await prisma.load.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!load) return res.status(404).json({ error: { message: 'Load not found' } });
    const event = await prisma.trackingEvent.create({
      data: { ...req.body, loadId: load.id, tenantId: req.user!.tenantId, createdBy: req.user!.id },
    });
    res.status(201).json({ data: event });
  } catch (err) {
    next(err);
  }
});

loadRouter.get('/:id/events', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const events = await prisma.trackingEvent.findMany({ where: { loadId: req.params.id, tenantId: req.user!.tenantId }, orderBy: { timestamp: 'asc' } });
    res.json({ data: events });
  } catch (err) {
    next(err);
  }
});

const documentSchema = z.object({ type: z.nativeEnum(DocumentType), fileName: z.string(), storagePath: z.string().optional() });

loadRouter.post('/:id/documents', verifyAuth, validateBody(documentSchema), async (req: AuthRequest, res, next) => {
  try {
    const load = await prisma.load.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!load) return res.status(404).json({ error: { message: 'Load not found' } });
    const doc = await prisma.document.create({
      data: {
        loadId: load.id,
        tenantId: req.user!.tenantId,
        type: req.body.type,
        fileName: req.body.fileName,
        storagePath: req.body.storagePath || `/tmp/${req.body.fileName}`,
        uploadedBy: req.user!.id,
      },
    });
    res.status(201).json({ data: doc });
  } catch (err) {
    next(err);
  }
});

loadRouter.get('/:id/documents', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const docs = await prisma.document.findMany({ where: { loadId: req.params.id, tenantId: req.user!.tenantId } });
    res.json({ data: docs });
  } catch (err) {
    next(err);
  }
});
