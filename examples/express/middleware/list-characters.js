const characters = require("../db/characters.json");
const LoggerFactory = require("../LoggerFactory");

module.exports = (req, res) => {
  const logger = LoggerFactory.getInstance();
  logger.info(`Found ${characters.length} characters`);
  res.json(characters);
};
