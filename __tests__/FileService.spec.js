const FileService = require('../src/file/FileService');
const fs = require('fs');
const path = require('path');
const config = require('config');

const { uploadDir, profileDir, attachmentDir } = config;

describe('createFolders', () => {
  it('creates upload folder', () => {
    FileService.createFolders();
    expect(fs.existsSync(uploadDir)).toBe(true);
  });
  it('creates profile folder under upload folder', () => {
    FileService.createFolders();
    const profileFolder = path.join('.', uploadDir, profileDir);
    expect(fs.existsSync(profileFolder)).toBe(true);
  });
  it('creates attachments folder under upload folder', () => {
    FileService.createFolders();
    const attachmentFolder = path.join('.', uploadDir, attachmentDir);
    expect(fs.existsSync(attachmentFolder)).toBe(true);
  });
});
