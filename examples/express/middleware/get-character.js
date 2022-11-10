const LoggerFactory = require("../LoggerFactory");
const characters = require("../db/characters.json");

module.exports = (req, res, next) => {
  const logger = LoggerFactory.getInstance();
  const id = Number(req.params.id);
  const character = characters[id];
  if (!character) {
    logger.info(`Character not found`, { id });
    return next();
  }

  logger.info("Found character", { character });
  res.json(character);
};
