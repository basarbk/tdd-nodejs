const express = require('express');
const User = require('./user/User');

const app = express();

app.use(express.json());

app.post('/api/1.0/users', (req, res) => {
  User.create(req.body).then(() => {
    return res.send({ message: 'User created' });
  });
});

module.exports = app;
