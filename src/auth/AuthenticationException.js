module.exports = function AuthenticationException() {
  this.status = 401;
  this.message = 'authentication_failure';
};
