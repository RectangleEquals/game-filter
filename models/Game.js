const mongoose = require("mongoose");

const DB_GAMES_COLLECTION = process.env.DB_GAMES_COLLECTION || "games"

// Game model
const Game = mongoose.model(DB_GAMES_COLLECTION, {
  title: String,
  description: String,
  releaseDate: Date,
  developer: String,
  publisher: String,
  platforms: [String],
  storePlatforms: [String],
  features: [String],
  reviews: [{ user: String, rating: Number, comment: String }],
});

module.exports = Game;