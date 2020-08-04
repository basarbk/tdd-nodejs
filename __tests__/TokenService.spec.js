const sequelize = require('../src/config/database');
const Token = require('../src/auth/Token');

const TokenService = require('../src/auth/TokenService');

beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await sequelize.sync();
  }
});

beforeEach(async () => {
  await Token.destroy({ truncate: true });
});

describe('Scheduled Token Cleanup', () => {
  it('clears the expired token with scheduled task', async () => {
    jest.useFakeTimers();
    const token = 'test-token';
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    await Token.create({
      token: token,
      lastUsedAt: eightDaysAgo,
    });

    TokenService.scheduleCleanup();
    jest.advanceTimersByTime(60 * 60 * 1000 + 5000);
    const tokenInDB = await Token.findOne({ where: { token: token } });
    expect(tokenInDB).toBeNull();
  });
});
