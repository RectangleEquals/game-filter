const config = require("./src/config/config");
const express = require("express");
const server = express();
const database = require("./src/database");
const compression = require("compression");
const corsWhitelist = require("./src/corsWhitelist");
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { getPassport, passport } = require('./src/passport');
const fs = require('fs');
const path = require('path');
//const discordStrategy = require('./src/strategies/discord');
const localStrategy = require('./src/strategies/local');
//const routes = require("./src/routes");

const oneDayInMilliseconds = 86400000;

async function run()
{
  console.log('Running server...');

  try {
    // connect to remote database
    database.getClient().then(async (client) =>
    {
      console.log('Testing connection...');

      // don't run the server without a valid database connection
      if(client === undefined || client === null) {
        console.error('Failed to connect to database!');
        process.exit(-1);
      }

      // init server
      console.log('Initializing server...');
      await init();

      console.log('Returning server...');
      return server;
    }).catch(err => {
      console.error(`[SERVER]: ${err.message}`);
    });
  } catch (error) {
    console.error(`[SERVER (root)]: ${err.message}`);
  }

  return server;
}

// determines middleware priorities and starts server
async function init() {
  // setup middlewares
  console.log('Setting up middlewares...');

  try{
    //await useCompression();
    //await useCookieDomainFix();
    await useBodyParser();
    await useCors();
    //await useCookieParser();
    await useSession();
    //await useRequestLogging();
    //await useRegenerateFix();
    await usePassport();
    await useRoutes();
  } catch(err) {
    console.error(`[SERVER (init)]: ${err.message}`);
    process.exit(-1);
  }

  // start server
  console.log('Starting listen server...');
  await listen();

  console.log('=== SERVER IS READY ===');
}

/*
async function useCookieDomainFix() {
  console.log(`> cookie domain fix (${config.PRODUCTION_DOMAIN_NAME})`);
  server.use((req, res, next) => {
    res.set('Set-Cookie', `${res.getHeader('Set-Cookie')}; domain=${config.PRODUCTION_DOMAIN_NAME}; HttpOnly; Secure; SameSite=None`);
    next();
  });
}
*/

// compression middleware
async function useCompression() {
  console.log('> compression');
  server.use(compression());
}

// bodyparser (NOTE: As of Express v4.16, this is now built in)
async function useBodyParser() {
  console.log('> bodyparser');
  server.use(express.urlencoded({extended : false}));
  server.use(express.json());
}

// cors
async function useCors() {
  console.log('> cors');
  await corsWhitelist.setup(server);
  server.use(corsWhitelist.middleware);
}

// cookie parser
async function useCookieParser() {
  console.log('> cookie parser');
  server.use(cookieParser());
}

// express session
async function useSession() {
  // NOTE: the '(var | 0)' forces the env variable string into a number
  const expires = (config.SESSION_COOKIE_LIFETIME | 0) || oneDayInMilliseconds;
  console.log(`> express session (via domain '${config.PRODUCTION_DOMAIN_NAME}' with expiration of '${expires}')`);

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
  console.log('> request logging');
  server.use((req, res, next) => {
    console.log(`[request]: ${req.method}:${req.url}`);
    next();
  });
}

// session.regenerate fix (https://github.com/jaredhanson/passport/issues/904)
async function useRegenerateFix()
{
  console.log('> session.regenerate fix');
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
  console.log('> passport');
  getPassport(server);

  localStrategy.use();
  //discordStrategy.use();
  //steamStrategy.use();
}

// routes
async function useRoutes() {
  console.log('> routes');

  // Client Root
  const clientRoot = path.resolve(process.cwd(), 'client', 'dist');
  console.log(`>> Client '${clientRoot}' exists?... ${fs.existsSync(clientRoot) ? 'YES' : 'NO'}`);
  server.get(express.static(clientRoot), async(req, res) => {
    console.log('Serving client...');
  });

  // Auth
  const auth = require('./src/api/auth');
  server.use(auth);

  // return await routes.use(server, err => {
  //   console.error(err.message);
  //   process.exit(-1);
  // });
}

// starts the http listen server
async function listen()
{
  server.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));
};

module.exports = run().then(srv => srv).catch(err => console.error(`[MAIN]: Fatal error: ${err.message}`));