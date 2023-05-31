const log = require("../lib/log");
const router = require("express").Router();
const addOrUpdateGame = require("../addGame");
const Game = require("../models/Game");
const path = require("path");

const basepath = '/api/games';

function relativeRoute(relativePath) {
  return path.join(basepath, relativePath).replace(/\\/g, '/');
}

function redirect(res, route, delay = 0) {
  log.info(`Redirecting to '${route}'...`);
  setTimeout(() => res.redirect(route), delay);
}

function redirectRelative(res, relativePath, delay = 0) {
  redirect(res, relativeRoute(relativePath));
}

// Get game by ID
router.get("/:gameId", (req, res) =>
{
  log.info(`${basepath}/${req.params.gameId} from ${req.ip}`);

  // Game data should only update once per day, max...
  // So we set a cache control to help maximize performance
  res.set({
    'Cache-Control': 'public, max-age=86400' // max-age in seconds
  });

  Game.find({gameId: req.params.gameId})
    .then(game => {
      res.json(game);
    })
    .catch(err => {
      res.status(404).json({ message: err.message });
    });
});

// Add a game
router.post('/', async (req, res) => {
  log.info('Incoming game POST request...');
  try {
    const game = req.body;
    log.info(`> [game]:\n${JSON.stringify(game)}`);
    const updatedGame = await addOrUpdateGame(game);
    res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: error });
  }
  log.info('> Finished processing game POST request')
});

module.exports = { basepath, route: router };