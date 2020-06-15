module.exports = function ForbiddenException() {
  this.status = 403;
  this.message = 'inactive_authentication_failure';
};
