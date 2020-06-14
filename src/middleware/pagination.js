const pagination = (req, res, next) => {
  const pageAsNumber = Number.parseInt(req.query.page);
  const sizeAsNumber = Number.parseInt(req.query.size);

  let page = Number.isNaN(pageAsNumber) ? 0 : pageAsNumber;
  if (page < 0) {
    page = 0;
  }
  let size = Number.isNaN(sizeAsNumber) ? 10 : sizeAsNumber;
  if (size > 10 || size < 1) {
    size = 10;
  }
  req.pagination = { size, page };
  next();
};

module.exports = pagination;
