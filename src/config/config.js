// if (process.env.NODE_ENV !== "production")
//   require("dotenv").config();

/*
// Assign some defaults to any potentially unassigned env variables
*/

// Server
process.env.NODE_ENV=               process.env.NODE_ENV                || "production"
process.env.PORT=                   process.env.PORT                    || 4000
process.env.PRODUCTION_DOMAIN_NAME= process.env.NODE_ENV === "production" ? process.env.PRODUCTION_DOMAIN_NAME : "localhost"
process.env.API_PATH=               process.env.API_PATH                || "/api"
process.env.AUTH_PATH=              process.env.AUTH_PATH               || "/api/auth",
process.env.CORS_WHITELIST=         process.env.CORS_WHITELIST          || "localhost"

// Database
process.env.DB_SERVER_PROTOCOL=     process.env.DB_SERVER_PROTOCOL      || "mongodb"
process.env.DB_SERVER_DOMAIN=       process.env.DB_SERVER_DOMAIN        || "127.0.0.1"
process.env.DB_GAMEFILTER_DBNAME=   process.env.DB_GAMEFILTER_DBNAME    || "gamefilter"
process.env.DB_GAMES_COLLECTION=    process.env.DB_GAMES_COLLECTION     || "games"
process.env.DB_SESSION_COLLECTION=  process.env.DB_SESSION_COLLECTION   || "sessions"

module.exports = process.env;