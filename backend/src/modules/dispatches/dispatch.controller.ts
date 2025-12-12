import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../common/prisma';
import { verifyAuth, AuthRequest } from '../../common/auth';
import { validateBody } from '../../common/validate';
import { DispatchStatus, TrackingEventType } from '@prisma/client';

export const dispatchRouter = Router();

const dispatchSchema = z.object({ driverId: z.string().optional(), carrierId: z.string().optional(), plannedStartTime: z.string().datetime().optional(), plannedEndTime: z.string().datetime().optional(), notes: z.string().optional() });

dispatchRouter.post('/load/:loadId', verifyAuth, validateBody(dispatchSchema), async (req: AuthRequest, res, next) => {
  try {
    const load = await prisma.load.findFirst({ where: { id: req.params.loadId, tenantId: req.user!.tenantId } });
    if (!load) return res.status(404).json({ error: { message: 'Load not found' } });
    const dispatch = await prisma.dispatch.create({
      data: {
        tenantId: req.user!.tenantId,
        loadId: load.id,
        driverId: req.body.driverId,
        carrierId: req.body.carrierId,
        plannedStart: req.body.plannedStartTime ? new Date(req.body.plannedStartTime) : undefined,
        plannedEnd: req.body.plannedEndTime ? new Date(req.body.plannedEndTime) : undefined,
        notes: req.body.notes,
      },
    });
    res.status(201).json({ data: dispatch });
  } catch (err) {
    next(err);
  }
});

dispatchRouter.post('/:id/accept', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.dispatch.updateMany({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      data: { status: DispatchStatus.ACCEPTED, acceptedAt: new Date() },
    });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Dispatch not found' } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

dispatchRouter.post('/:id/reject', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const updated = await prisma.dispatch.updateMany({
      where: { id: req.params.id, tenantId: req.user!.tenantId },
      data: { status: DispatchStatus.REJECTED, rejectedAt: new Date() },
    });
    if (updated.count === 0) return res.status(404).json({ error: { message: 'Dispatch not found' } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

const statusSchema = z.object({ status: z.nativeEnum(DispatchStatus), latitude: z.number().optional(), longitude: z.number().optional(), notes: z.string().optional() });

dispatchRouter.post('/:id/status', verifyAuth, validateBody(statusSchema), async (req: AuthRequest, res, next) => {
  try {
    const dispatch = await prisma.dispatch.findFirst({ where: { id: req.params.id, tenantId: req.user!.tenantId } });
    if (!dispatch) return res.status(404).json({ error: { message: 'Dispatch not found' } });
    await prisma.dispatch.update({ where: { id: dispatch.id }, data: { status: req.body.status } });
    await prisma.trackingEvent.create({
      data: {
        tenantId: req.user!.tenantId,
        loadId: dispatch.loadId,
        dispatchId: dispatch.id,
        eventType: TrackingEventType.STATUS_CHANGE,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        notes: req.body.notes,
      },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// List dispatch board
dispatchRouter.get('/', verifyAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = await prisma.dispatch.findMany({
      where: { tenantId: req.user!.tenantId },
      include: { load: true, driver: true, carrier: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data });
  } catch (err) {
    next(err);
  }
});
