if(process.env.NODE_ENV !== "production")
  require("dotenv").config()

env = {
  NODE_ENV:                 process.env.NODE_ENV || "production",
  PORT:                     process.env.PORT || 4000,

  DB_SERVER_PROTOCOL:       process.env.DB_SERVER_PROTOCOL || "mongodb",
  DB_SERVER_USER:           process.env.DB_SERVER_USER,
  DB_SERVER_PASS:           process.env.DB_SERVER_PASS,
  DB_SERVER_DOMAIN:         process.env.DB_SERVER_DOMAIN || "127.0.0.1",
  DB_SERVER_PORT:           process.env.DB_SERVER_PORT,
  DB_GAMEFILTER_DBNAME:     process.env.DB_GAMEFILTER_DBNAME || "gamefilter",
  DB_GAMES_COLLECTION:      process.env.DB_GAMES_COLLECTION || "games",

  CORS_WHITELIST_FILENAME:  process.env.CORS_WHITELIST_FILENAME
}

module.exports = env;