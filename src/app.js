const express = require('express');
const UserRouter = require('./user/UserRouter');
const AuthenticationRouter = require('./auth/AuthenticationRouter');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const errorHandler = require('./error/ErrorHandler');
const tokenAuthentication = require('./middleware/tokenAuthentication');
const FileService = require('./file/FileService');
const config = require('config');
const path = require('path');
const HoaxRouter = require('./hoax/HoaxRouter');
const FileRouter = require('./file/FileRouter');

const { uploadDir, profileDir, attachmentDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

const ONE_YEAR_IN_MILLIS = 365 * 24 * 60 * 60 * 1000;

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

FileService.createFolders();

const app = express();

app.use(middleware.handle(i18next));

app.use(express.json({ limit: '3mb' }));

app.use('/images', express.static(profileFolder, { maxAge: ONE_YEAR_IN_MILLIS }));

app.use('/attachments', express.static(attachmentFolder, { maxAge: ONE_YEAR_IN_MILLIS }));

app.use(tokenAuthentication);

app.use(UserRouter);
app.use(AuthenticationRouter);
app.use(HoaxRouter);
app.use(FileRouter);

app.use(errorHandler);

module.exports = app;
