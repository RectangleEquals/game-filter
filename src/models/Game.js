const config = require("../config/config");
const mongoose = require("mongoose");

// Game model
const Game = mongoose.model(config.DB_GAMES_COLLECTION, {
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