module.exports = function AuthenticationException(message) {
  this.status = 401;
  this.message = message || 'authentication_failure';
};
