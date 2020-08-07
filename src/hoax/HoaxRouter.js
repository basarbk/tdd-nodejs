const express = require('express');
const router = express.Router();
const AuthenticationException = require('../auth/AuthenticationException');

router.post('/api/1.0/hoaxes', (req, res) => {
  if (req.authenticatedUser) {
    return res.send();
  }
  throw new AuthenticationException('unauthorized_hoax_submit');
});

module.exports = router;
