const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const Token = require('../src/auth/Token');
const bcrypt = require('bcrypt');
const en = require('../locales/en/translation.json');
const tr = require('../locales/tr/translation.json');
const SMTPServer = require('smtp-server').SMTPServer;
const config = require('config');

let lastMail, server;
let simulateSmtpFailure = false;

beforeAll(async () => {
  server = new SMTPServer({
    authOptional: true,
    onData(stream, session, callback) {
      let mailBody;
      stream.on('data', (data) => {
        mailBody += data.toString();
      });
      stream.on('end', () => {
        if (simulateSmtpFailure) {
          const err = new Error('Invalid mailbox');
          err.responseCode = 553;
          return callback(err);
        }
        lastMail = mailBody;
        callback();
      });
    },
  });

  await server.listen(config.mail.port, 'localhost');

  jest.setTimeout(20000);
});

beforeEach(async () => {
  simulateSmtpFailure = false;
  await User.destroy({ truncate: { cascade: true } });
});

afterAll(async () => {
  await server.close();
  jest.setTimeout(5000);
});

const activeUser = { username: 'user1', email: 'user1@mail.com', password: 'P4ssword', inactive: false };

const addUser = async (user = { ...activeUser }) => {
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  return await User.create(user);
};
const postPasswordReset = (email = 'user1@mail.com', options = {}) => {
  const agent = request(app).post('/api/1.0/user/password');
  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return agent.send({ email: email });
};

const putPasswordUpdate = (body = {}, options = {}) => {
  const agent = request(app).put('/api/1.0/user/password');

  if (options.language) {
    agent.set('Accept-Language', options.language);
  }
  return agent.send(body);
};

describe('Password Reset Request', () => {
  it('returns 404 when a password reset request is sent for unknown e-mail', async () => {
    const response = await postPasswordReset();
    expect(response.status).toBe(404);
  });

  it.each`
    language | message
    ${'tr'}  | ${tr.email_not_inuse}
    ${'en'}  | ${en.email_not_inuse}
  `(
    'returns error body with $message for unknown email for password reset request when language is $language',
    async ({ language, message }) => {
      const nowInMillis = new Date().getTime();
      const response = await postPasswordReset('user1@mail.com', { language: language });
      expect(response.body.path).toBe('/api/1.0/user/password');
      expect(response.body.timestamp).toBeGreaterThan(nowInMillis);
      expect(response.body.message).toBe(message);
    }
  );

  it.each`
    language | message
    ${'tr'}  | ${tr.email_invalid}
    ${'en'}  | ${en.email_invalid}
  `(
    'returns 400 with validation error response having $message when request does not have valid email and language is $language',
    async ({ language, message }) => {
      const response = await postPasswordReset(null, { language: language });
      expect(response.body.validationErrors.email).toBe(message);
      expect(response.status).toBe(400);
    }
  );
  it('returns 200 ok when a password reset request is sent for known e-mail', async () => {
    const user = await addUser();
    const response = await postPasswordReset(user.email);
    expect(response.status).toBe(200);
  });
  it.each`
    language | message
    ${'tr'}  | ${tr.password_reset_request_success}
    ${'en'}  | ${en.password_reset_request_success}
  `(
    'returns success response body with $message for known email for password reset request when language is set as $language',
    async ({ language, message }) => {
      const user = await addUser();
      const response = await postPasswordReset(user.email, { language });
      expect(response.body.message).toBe(message);
    }
  );
  it('creates passwordResetToken when a password reset request is sent for known e-mail', async () => {
    const user = await addUser();
    await postPasswordReset(user.email);
    const userInDB = await User.findOne({ where: { email: user.email } });
    expect(userInDB.passwordResetToken).toBeTruthy();
  });
  it('sends a password reset email with passwordResetToken', async () => {
    const user = await addUser();
    await postPasswordReset(user.email);
    const userInDB = await User.findOne({ where: { email: user.email } });
    const passwordResetToken = userInDB.passwordResetToken;
    expect(lastMail).toContain('user1@mail.com');
    expect(lastMail).toContain(passwordResetToken);
  });
  it('returns 502 Bad Gateway when sending email fails', async () => {
    simulateSmtpFailure = true;
    const user = await addUser();
    const response = await postPasswordReset(user.email);
    expect(response.status).toBe(502);
  });
  it.each`
    language | message
    ${'tr'}  | ${tr.email_failure}
    ${'en'}  | ${en.email_failure}
  `('returns $message when language is set as $language after e-mail failure', async ({ language, message }) => {
    simulateSmtpFailure = true;
    const user = await addUser();
    const response = await postPasswordReset(user.email, { language });
    expect(response.body.message).toBe(message);
  });
});

describe('Password Update', () => {
  it('returns 403 when password update request does not have the valid password reset token', async () => {
    const response = await putPasswordUpdate({
      password: 'P4ssword',
      passwordResetToken: 'abcd',
    });
    expect(response.status).toBe(403);
  });

  it.each`
    language | message
    ${'tr'}  | ${tr.unauthroized_password_reset}
    ${'en'}  | ${en.unauthroized_password_reset}
  `(
    'returns error body with $message when language is set to $language after trying to update with invalid token',
    async ({ language, message }) => {
      const nowInMillis = new Date().getTime();
      const response = await putPasswordUpdate(
        {
          password: 'P4ssword',
          passwordResetToken: 'abcd',
        },
        { language }
      );
      expect(response.body.path).toBe('/api/1.0/user/password');
      expect(response.body.timestamp).toBeGreaterThan(nowInMillis);
      expect(response.body.message).toBe(message);
    }
  );
  it('returns 403 when password update request with invalid password pattern and the reset token is invalid', async () => {
    const response = await putPasswordUpdate({
      password: 'not-valid',
      passwordResetToken: 'abcd',
    });
    expect(response.status).toBe(403);
  });
  it('returns 400 when trying to update with invalid password and the reset token is valid', async () => {
    const user = await addUser();
    user.passwordResetToken = 'test-token';
    await user.save();
    const response = await putPasswordUpdate({
      password: 'not-valid',
      passwordResetToken: 'test-token',
    });
    expect(response.status).toBe(400);
  });

  it.each`
    language | value              | message
    ${'en'}  | ${null}            | ${en.password_null}
    ${'en'}  | ${'P4ssw'}         | ${en.password_size}
    ${'en'}  | ${'alllowercase'}  | ${en.password_pattern}
    ${'en'}  | ${'ALLUPPERCASE'}  | ${en.password_pattern}
    ${'en'}  | ${'1234567890'}    | ${en.password_pattern}
    ${'en'}  | ${'lowerandUPPER'} | ${en.password_pattern}
    ${'en'}  | ${'lower4nd5667'}  | ${en.password_pattern}
    ${'en'}  | ${'UPPER44444'}    | ${en.password_pattern}
    ${'tr'}  | ${null}            | ${tr.password_null}
    ${'tr'}  | ${'P4ssw'}         | ${tr.password_size}
    ${'tr'}  | ${'alllowercase'}  | ${tr.password_pattern}
    ${'tr'}  | ${'ALLUPPERCASE'}  | ${tr.password_pattern}
    ${'tr'}  | ${'1234567890'}    | ${tr.password_pattern}
    ${'tr'}  | ${'lowerandUPPER'} | ${tr.password_pattern}
    ${'tr'}  | ${'lower4nd5667'}  | ${tr.password_pattern}
    ${'tr'}  | ${'UPPER44444'}    | ${tr.password_pattern}
  `(
    'returns password validation error $message when language is set to $language and the value is $value',
    async ({ language, message, value }) => {
      const user = await addUser();
      user.passwordResetToken = 'test-token';
      await user.save();
      const response = await putPasswordUpdate(
        {
          password: value,
          passwordResetToken: 'test-token',
        },
        { language: language }
      );
      expect(response.body.validationErrors.password).toBe(message);
    }
  );

  it('returns 200 when valid password is sent with valid reset token', async () => {
    const user = await addUser();
    user.passwordResetToken = 'test-token';
    await user.save();
    const response = await putPasswordUpdate({
      password: 'N3w-password',
      passwordResetToken: 'test-token',
    });
    expect(response.status).toBe(200);
  });
  it('updates the password in database when the request is valid', async () => {
    const user = await addUser();
    user.passwordResetToken = 'test-token';
    await user.save();
    await putPasswordUpdate({
      password: 'N3w-password',
      passwordResetToken: 'test-token',
    });
    const userInDB = await User.findOne({ where: { email: 'user1@mail.com' } });
    expect(userInDB.password).not.toEqual(user.password);
  });
  it('clears the reset token in database when the request is valid', async () => {
    const user = await addUser();
    user.passwordResetToken = 'test-token';
    await user.save();
    await putPasswordUpdate({
      password: 'N3w-password',
      passwordResetToken: 'test-token',
    });
    const userInDB = await User.findOne({ where: { email: 'user1@mail.com' } });
    expect(userInDB.passwordResetToken).toBeFalsy();
  });
  it('activates and clears activation token if the account is inactive after valid password reset', async () => {
    const user = await addUser();
    user.passwordResetToken = 'test-token';
    user.activationToken = 'activation-token';
    user.inactive = true;
    await user.save();
    await putPasswordUpdate({
      password: 'N3w-password',
      passwordResetToken: 'test-token',
    });
    const userInDB = await User.findOne({ where: { email: 'user1@mail.com' } });
    expect(userInDB.activationToken).toBeFalsy();
    expect(userInDB.inactive).toBe(false);
  });
  it('clears all tokens of user after valid password reset', async () => {
    const user = await addUser();
    user.passwordResetToken = 'test-token';
    await user.save();
    await Token.create({
      token: 'token-1',
      userId: user.id,
      lastUsedAt: Date.now(),
    });
    await putPasswordUpdate({
      password: 'N3w-password',
      passwordResetToken: 'test-token',
    });
    const tokens = await Token.findAll({ where: { userId: user.id } });
    expect(tokens.length).toBe(0);
  });
});
