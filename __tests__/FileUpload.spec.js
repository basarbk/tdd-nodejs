const request = require('supertest');
const app = require('../src/app');
const path = require('path');
const FileAttachment = require('../src/file/FileAttachment');
const sequelize = require('../src/config/database');
const fs = require('fs');
const config = require('config');

const { uploadDir, attachmentDir } = config;

beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach(async () => {
  await FileAttachment.destroy({ truncate: true });
});

const uploadFile = () => {
  return request(app)
    .post('/api/1.0/hoaxes/attachments')
    .attach('file', path.join('.', '__tests__', 'resources', 'test-png.png'));
};

describe('Upload File for Hoax', () => {
  it('returns 200 ok after successful upload', async () => {
    const response = await uploadFile();
    expect(response.status).toBe(200);
  });
  it('saves dynamicFilename, uploadDate as attachment object in database', async () => {
    const beforeSubmit = Date.now();
    await uploadFile();
    const attachments = await FileAttachment.findAll();
    const attachment = attachments[0];
    expect(attachment.filename).not.toBe('test-png.png');
    expect(attachment.uploadDate.getTime()).toBeGreaterThan(beforeSubmit);
  });
  it('saves file to attachment folder', async () => {
    await uploadFile();
    const attachments = await FileAttachment.findAll();
    const attachment = attachments[0];
    const filePath = path.join('.', uploadDir, attachmentDir, attachment.filename);
    expect(fs.existsSync(filePath)).toBe(true);
  });
});
