const express = require('express');
const router = express.Router();
const FileService = require('./FileService');

router.post('/api/1.0/hoaxes/attachments', async (req, res) => {
  await FileService.saveAttachment();
  res.send();
});

module.exports = router;
