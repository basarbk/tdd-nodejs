const FileAttachment = require('./src/file/FileAttachment');
const sequelize = require('./src/config/database');

beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }

  await FileAttachment.destroy({ truncate: true });
});
