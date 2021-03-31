const characters = require('../db/characters');

module.exports = (req, res) => {
  res.json(characters);
};
