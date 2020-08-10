const fs = require('fs');
const path = require('path');
const config = require('config');

const { uploadDir, profileDir, attachmentDir } = config;
const profileDirectory = path.join('.', uploadDir, profileDir);
const attachmentDirectory = path.join('.', uploadDir, attachmentDir);

const clearFolders = (folder) => {
  const files = fs.readdirSync(folder);
  for (const file of files) {
    fs.unlinkSync(path.join(folder, file));
  }
};

clearFolders(profileDirectory);
clearFolders(attachmentDirectory);
