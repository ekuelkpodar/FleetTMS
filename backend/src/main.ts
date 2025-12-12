import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './common/errors';
import { authRouter } from './modules/auth/auth.controller';
import { tenantRouter } from './modules/tenants/tenant.controller';
import { customerRouter } from './modules/customers/customer.controller';
import { carrierRouter } from './modules/carriers/carrier.controller';
import { driverRouter } from './modules/drivers/driver.controller';
import { equipmentRouter } from './modules/equipment/equipment.controller';
import { locationRouter } from './modules/locations/location.controller';
import { loadRouter } from './modules/loads/load.controller';
import { dispatchRouter } from './modules/dispatches/dispatch.controller';
import { analyticsRouter } from './modules/analytics/analytics.controller';
import { billingRouter } from './modules/billing/billing.controller';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/tenants', tenantRouter);
app.use('/api/v1/customers', customerRouter);
app.use('/api/v1/carriers', carrierRouter);
app.use('/api/v1/drivers', driverRouter);
app.use('/api/v1/equipment', equipmentRouter);
app.use('/api/v1/locations', locationRouter);
app.use('/api/v1/loads', loadRouter);
app.use('/api/v1/dispatches', dispatchRouter);
app.use('/api/v1/analytics', analyticsRouter);
app.use('/api/v1/billing', billingRouter);

app.use(errorHandler);

const port = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`FleetTMS API listening on port ${port}`);
  });
}

export default app;
