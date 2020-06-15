module.exports = function ForbiddenException(message) {
  this.status = 403;
  this.message = message || 'inactive_authentication_failure';
};
