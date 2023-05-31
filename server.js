const config = require("./src/config/config");
const log = require("./src/lib/log");
const express = require("express");
const server = express();
const database = require("./src/database");
const compression = require("compression");
const corsWhitelist = require("./src/corsWhitelist");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { getPassport, passport } = require("./src/passport");
const fs = require("fs");
const path = require("path");
const discordStrategy = require("./src/strategies/discord");
const localStrategy = require("./src/strategies/local");
//const routes = require("./src/routes");

const oneDayInMilliseconds = 86400000;


async function run()
{
  log.info('Starting server...');

  // Connect to remote database and init server
  try {
    database.getClient().then(async (client) =>
    {
      log.info('Testing connection...');

      // don't run the server without a valid database connection
      if(client === undefined || client === null) {
        log.error('Failed to connect to database!');
        process.exit(-1);
      }

      // init server
      log.info('Initializing server...');
      await init();

      log.info('Returning server...');
      return server;
    }).catch(err => {
      log.error(`[SERVER]: ${err.message}`);
    });
  } catch (error) {
    log.error(`[SERVER (root)]: ${err.message}`);
  }

  return server;
}

// determines middleware priorities and starts server
async function init() {
  // setup middlewares
  log.info('Setting up middlewares...');

  try{
    //await useCompression();
    //await useCookieDomainFix();
    await useBodyParser();
    await useCors();
    await useCookieParser();
    await useSession();
    await useRequestLogging();
    //await useRegenerateFix();
    await usePassport();
    await useRoutes();
  } catch(err) {
    log.error(`[SERVER (init)]: ${err.message}`);
    process.exit(-1);
  }

  // start server
  log.info('Starting listen server...');
  await listen();

  log.info('=== SERVER IS READY ===');
}

// compression middleware
async function useCompression() {
  log.info('> compression');
  server.use(compression());
}

/*
async function useCookieDomainFix() {
  log.info(`> cookie domain fix (${config.PRODUCTION_DOMAIN_NAME})`);
  server.use((req, res, next) => {
    res.set('Set-Cookie', `${res.getHeader('Set-Cookie')}; domain=${config.PRODUCTION_DOMAIN_NAME}; HttpOnly; Secure; SameSite=None`);
    next();
  });
}
*/

// bodyparser (NOTE: As of Express v4.16, this is now built in)
async function useBodyParser() {
  log.info('> bodyparser');
  server.use(express.urlencoded({extended: true}));
  server.use(express.json());
}

// cors
async function useCors() {
  log.info('> cors');
  await corsWhitelist.setup(server);
  server.use(corsWhitelist.middleware);
}

// cookie parser
async function useCookieParser() {
  log.info('> cookie parser');
  server.use(cookieParser());
}

// express session
async function useSession() {
  // NOTE: the '(var | 0)' forces the env variable string into a number
  const expires = (config.SESSION_COOKIE_LIFETIME | 0) || oneDayInMilliseconds;
  log.info(`> express session (via domain '${config.PRODUCTION_DOMAIN_NAME}' with expiration of '${expires}')`);

  server.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: database.getStore(),
    name: config.SESSION_COOKIE_NAME || 'default',
    cookie: {
      maxAge: expires,
      httpOnly: false,
      secure: false,
      sameSite: 'None'
      // domain: config.PRODUCTION_DOMAIN_NAME
    }
  }));
}

// request logging
async function useRequestLogging() {
  log.info('> request logging');
  server.use((req, res, next) => {
    log.info(`[request]: ${req.method}:${req.url}`);
    next();
  });
}

// session.regenerate fix (https://github.com/jaredhanson/passport/issues/904)
async function useRegenerateFix()
{
  log.info('> session.regenerate fix');
  server.use(function(request, response, next) {
    if (request.session && !request.session.regenerate)
        request.session.regenerate = cb => {
          cb();
        }

    if (request.session && !request.session.save)
        request.session.save = cb => {
          cb();
        }

    next();
  });
}

// passport strategies
async function usePassport()
{
  log.info('> passport');
  getPassport(server);

  localStrategy.use();
  discordStrategy.use();
  //steamStrategy.use();
}

// routes
async function useRoutes() {
  log.info('> routes');

  // Debug
  log.info('>> debug');
  const debug = require('./src/api/debug');
  server.use(debug.router);

  // Auth
  log.info('>> auth');
  const auth = require('./src/api/auth');
  server.use(auth.router);

  // Social
  log.info('>> social');
  const link = require('./src/api/link');
  server.use(link.router);
  const user = require('./src/api/user');
  server.use(user.router);

  // return await routes.use(server, err => {
  //   log.error(err.message);
  //   process.exit(-1);
  // });
}

// starts the http listen server
async function listen()
{
  server.listen(config.PORT, () => log.info(`Server running on port ${config.PORT}`));
};

module.exports = run().then(srv => srv).catch(err => log.error(`[MAIN]: Fatal error: ${err.message}`));