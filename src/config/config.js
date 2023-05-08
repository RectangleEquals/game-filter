if (process.env.NODE_ENV !== "production")
  require("dotenv").config();

// Assign some defaults to any potentially unassigned env variables
const defaults = {
  // Server
  NODE_ENV:               process.env.NODE_ENV                || "production",
  PORT:                   process.env.PORT                    || 4000,
  PRODUCTION_DOMAIN_NAME: process.env.NODE_ENV === "production" ? process.env.PRODUCTION_DOMAIN_NAME : "localhost",
  API_PATH:               process.env.API_PATH                || "/api",
  AUTH_PATH:              process.env.AUTH_PATH               || "/api/auth",

  // Database
  DB_SERVER_PROTOCOL:     process.env.DB_SERVER_PROTOCOL      || "mongodb",
  DB_SERVER_DOMAIN:       process.env.DB_SERVER_DOMAIN        || "127.0.0.1",
  DB_GAMEFILTER_DBNAME:   process.env.DB_GAMEFILTER_DBNAME    || "gamefilter",
  DB_GAMES_COLLECTION:    process.env.DB_GAMES_COLLECTION     || "games"
};

module.exports = Object.assign({}, defaults, process.env);