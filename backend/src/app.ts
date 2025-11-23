import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { appConfig } from '@config/app.config';
import { loggerMiddleware } from '@config/logger.config';
import { errorHandler, notFoundHandler } from '@shared/middleware/error.middleware';

import { authRouter } from './modules/auth/auth.routes';
import { clientsRouter } from './modules/clients/clients.routes';
import { unitsRouter } from './modules/units/units.routes';
import { wasteTypesRouter } from './modules/waste-types/waste-types.routes';
import { collectionsRouter } from './modules/collections/collections.routes';
import { gravimetricDataRouter } from './modules/gravimetric-data/gravimetric-data.routes';
import { imagesRouter } from './modules/images/images.routes';
import { dashboardRouter } from './modules/dashboard/dashboard.routes';
import { reportsRouter } from './modules/reports/reports.routes';
import { recipientsRouter } from './modules/recipients/recipients.routes';
import backupRouter from './modules/backup/backup.routes';

const createRateLimiter = () => {
  return rateLimit({
    windowMs: appConfig.rateLimitWindowMs,
    max: appConfig.rateLimitMaxRequests,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

export const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: appConfig.corsOrigin,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(loggerMiddleware);

  const limiter = createRateLimiter();
  app.use(limiter);

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: appConfig.env,
    });
  });

  app.use('/uploads', express.static('uploads'));

  app.use(`${appConfig.apiPrefix}/auth`, authRouter);
  app.use(`${appConfig.apiPrefix}/clients`, clientsRouter);
  app.use(`${appConfig.apiPrefix}/units`, unitsRouter);
  app.use(`${appConfig.apiPrefix}/waste-types`, wasteTypesRouter);
  app.use(`${appConfig.apiPrefix}/recipients`, recipientsRouter);
  app.use(`${appConfig.apiPrefix}/collections`, collectionsRouter);
  app.use(`${appConfig.apiPrefix}/gravimetric-data`, gravimetricDataRouter);
  app.use(`${appConfig.apiPrefix}/images`, imagesRouter);
  app.use(`${appConfig.apiPrefix}/dashboard`, dashboardRouter);
  app.use(`${appConfig.apiPrefix}/reports`, reportsRouter);
  app.use(`${appConfig.apiPrefix}/backup`, backupRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
