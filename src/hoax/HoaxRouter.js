const express = require('express');
const router = express.Router();
const AuthenticationException = require('../auth/AuthenticationException');
const HoaxService = require('./HoaxService');

router.post('/api/1.0/hoaxes', async (req, res, next) => {
  if (req.authenticatedUser) {
    await HoaxService.save(req.body);
    return res.send({ message: req.t('hoax_submit_success') });
  }
  next(new AuthenticationException('unauthorized_hoax_submit'));
});

module.exports = router;
