const Game = require("./models/Game.js");

async function addOrUpdateGame(gameData) {
  const filter = { title: gameData.title };
  const update = gameData;
  const options = { upsert: true, new: true, setDefaultsOnInsert: true };

  const updatedGame = await Game.findOneAndUpdate(filter, update, options);

  return updatedGame;
}

module.exports = addOrUpdateGame;