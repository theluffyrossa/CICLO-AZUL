import 'reflect-metadata';
import { createApp } from './app';
import { appConfig } from '@config/app.config';
import { logger } from '@config/logger.config';
import { connectDatabase } from '@database/connection';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();

    const app = createApp();

    app.listen(appConfig.port, '0.0.0.0', () => {
      logger.info(`🚀 Server running on port ${appConfig.port}`);
      logger.info(`📝 Environment: ${appConfig.env}`);
      logger.info(`🔗 API Prefix: ${appConfig.apiPrefix}`);

      const corsInfo = appConfig.corsOrigin === true
        ? 'All origins (*)'
        : Array.isArray(appConfig.corsOrigin)
          ? appConfig.corsOrigin.join(', ')
          : String(appConfig.corsOrigin);

      logger.info(`🌐 CORS Origins: ${corsInfo}`);
      logger.info(`🔌 Listening on all network interfaces (0.0.0.0)`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
