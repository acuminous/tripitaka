const { v4: uuid } = require("uuid");

module.exports = (req, res, next) => {
  const store = new Map();
  store.set("correlationId", uuid());
  req.app.locals.als.run(store, () => next());
};
