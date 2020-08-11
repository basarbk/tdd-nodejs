const app = require('./src/app');
const sequelize = require('./src/config/database');
const TokenService = require('./src/auth/TokenService');
const logger = require('./src/shared/logger');
const FileService = require('./src/file/FileService');

sequelize.sync();

TokenService.scheduleCleanup();
FileService.removeUnusedAttachments();

app.listen(process.env.PORT || 3000, () => logger.info('app is running. version: ' + process.env.npm_package_version));
