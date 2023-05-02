const router = require("express").Router();
const requestIp = require("request-ip");
const addOrUpdateGame = require("../addGame");
const Game = require("../models/Game");
const path = require("path");

const basepath = '/api/games';

function relativeRoute(relativePath) {
  return path.join(basepath, relativePath).replace(/\\/g, '/');
}

function redirect(res, route, delay = 0) {
  console.log(`Redirecting to '${route}'...`);
  setTimeout(() => res.redirect(route), delay);
}

function redirectRelative(res, relativePath, delay = 0) {
  redirect(res, relativeRoute(relativePath));
}

// Get game by ID
router.get("/:gameId", (req, res) =>
{
  console.log(`${basepath}/${req.params.gameId} from ${req.ip}`);

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
  console.log('Incoming game POST request...');
  try {
    let ip = requestIp(req);
    if(req.query.from !== ip) {
      //res.status(400).json({ message: 'Bad auth request: IP address mismatch' });
      console.warn(`> [WARNING]: IP address mismatch! Expected '${ip}' got '${req.query.from}'`);
      //return;
    }
    
    const game = req.body;
    console.log(`> [game]:\n${JSON.stringify(game)}`);
    const updatedGame = await addOrUpdateGame(game);
    res.status(200).json(updatedGame);
  } catch (error) {
    res.status(500).json({ message: error });
  }
  console.log('> Finished processing game POST request')
});

module.exports = { basepath, route: router };