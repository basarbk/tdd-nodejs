module.exports = function FileSizeException() {
  this.status = 400;
  this.message = 'attachment_size_limit';
};
