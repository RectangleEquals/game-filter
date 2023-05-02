const config = require("./src/config/config");
const express = require("express");
const server = express();
const database = require("./src/database");
const bodyParser = require("body-parser");
const compression = require("compression");
const corsWhitelist = require("./src/corsWhitelist");
const routes = require("./src/routes");

// connect to remote database
database.connect().then(async (client) =>
{
  // don't run the server without a valid database connection
  if(client === undefined || client === null) {
    console.error("Failed to connect to database!");
    process.exit(-1);
  }

  // run server
  await run();
});

// determines middleware priorities and starts server
async function run() {
  // setup middlewares
  console.log('Setting up middlewares...');
  await useBodyParser();
  await useCompression();
  await useCors();
  //await useCookieParser();
  //await useSession();
  await useRequestLogging();
  //await useRegenerateFix();
  //await usePassport();
  await useRoutes();

  // start server
  console.log('Starting listen server...');
  await listen();

  console.log('=== SERVER IS READY ===');
}

// bodyparser
async function useBodyParser() {
  console.log('> bodyparser');
  server.use(bodyParser.urlencoded({ extended: false }));
  server.use(bodyParser.json());
}

// cors
async function useCors() {
  console.log('> cors');
  await corsWhitelist.setup(server);
  server.use(corsWhitelist.middleware);
}

// compression middleware
async function useCompression() {
  console.log('> compression');
  server.use(compression());
}

// request logging
async function useRequestLogging() {
  console.log('> request logging');
  server.use((req, res, next) => {
    console.log(`[request]: ${req.method}:${req.url}`);
    next();
  });
}

// routes
async function useRoutes() {
  console.log('> routes');
  return await routes.use(server, err => {
    console.error(err);
    process.exit(-1);
  });
}

/*
function isAuthorized(req, res, next) {
  if(req.user) {
      console.log("User is logged in.");
      res.json({
        discord: req.user.discord,
        id: req.user._id,
        session: req.user.sessionID,
        hasGamePass: req.user.hasGamePass,
        createdAt: req.user.createdAt
      });
      //res.redirect('/dashboard');
  } else {
      console.log("User is not logged in.");
      res.redirect('/api/v1/auth/login');
      next();
  }
}
*/

// starts the http listen server
async function listen()
{
  /*
  server.get('/', isAuthorized, (req, res) => {
    //res.render('home');
  });
  */

  server.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
};