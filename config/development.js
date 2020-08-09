module.exports = {
  database: {
    database: 'hoaxify',
    username: 'my-db-user',
    password: 'db-p4ss',
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
  },
  mail: {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'hannah.stracke62@ethereal.email',
      pass: 'Udhq8A43hSujuuSPS7',
    },
  },
  uploadDir: 'uploads-dev',
  profileDir: 'profile',
  attachmentDir: 'attachment',
};
