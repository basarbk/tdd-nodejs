module.exports = function UserNotFoundException() {
  this.status = 404;
  this.message = 'user_not_found';
};
