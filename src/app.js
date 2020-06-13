const express = require('express');
const UserRouter = require('./user/UserRouter');
const app = express();

app.use(express.json());

app.use(UserRouter);

module.exports = app;
