const config = require("./config/config");
const log = require("./lib/log");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const UserSession = require("./models/UserSession").model;

let client = undefined;
let store = undefined;
let collections = undefined;

const getUrl = (dbName = config.DB_GAMEFILTER_DBNAME) => {
  let auth = `${config.DB_SERVER_USER && config.DB_SERVER_PASS ? `${config.DB_SERVER_USER}:${config.DB_SERVER_PASS}@` : ''}`
  return `${config.DB_SERVER_PROTOCOL}://${auth}${config.DB_SERVER_DOMAIN + (config.DB_SERVER_PORT ? `:${config.DB_SERVER_PORT}` : '')}/${dbName}`;
}

const getStore = () =>
{
  if(store !== undefined)
    return store;
  
  const cmOptions = {
    mongoUrl: getUrl(),
    clientPromise: getClient(),
    collectionName: config.DB_SESSION_COLLECTION
  }

  store = MongoStore.create(cmOptions);
  return store;
}

const getClient = async() =>
{
  if(client === undefined || client === null)
    await connect();
  return client;
}

const getCollection = async(name) => {
  let collection = undefined;

  collections.some(element => {
    let i = element.namespace.indexOf('.');
    const namespace = element.namespace.substring(i + 1);
    if(namespace === name) {
      collection = element;
      return true;
    }
  });

  return collection;
}

const getSessionCollection = async() => {
  return await getCollection(config.DB_SESSION_COLLECTION);
}

const connect = async(strictQuery = true) =>
{
  try {
    if(client !== undefined && client !== null)
      return client;

    const dbOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }

    mongoose.set('strictQuery', strictQuery);

    // Connect to MongoDB
    const dbUrl = getUrl();
    log.info(`Connecting to database: '${dbUrl}'`);

    await mongoose.connect(dbUrl, dbOptions).then(async (newClient) => {
      log.info(`Connected to database: '${dbUrl}'`);
      client = newClient;
      collections = await client.connection.db.collections();
    })
    .catch(err => {
      log.error(`[DATABASE (connect)]: Error connecting to database: '${dbUrl}': ${err.message}`);
      client = undefined;
    });
  } catch (error) {
    log.error(`[DATABASE (connect)]: ${error.message}`);
  }
}

async function validateSessionsForUserId(userId, forceDelete = false)
{
  let expired = true;

  try {
    let userSession = await UserSession.findOne( { userId: userId });
    const exists = Boolean(userSession && userSession.sessionId && userSession.userId);

    if(exists) {
      log.info(`> Validating session ${userSession.sessionId} for user ${userSession.userId}...`);
      const sessionCollection = await getSessionCollection();
      let sessionDoc = await sessionCollection.findOne({ _id: userSession.sessionId });
      
      let currentDate = new Date();
      let expirationDate = currentDate;
      expired = sessionDoc === undefined || sessionDoc === null;
      if(!expired) {
        expirationDate = new Date(sessionDoc.expires);
        expired = currentDate >= expirationDate;
      } else {
        log.info(`> Session ${userSession.sessionId} has expired`);
      }

      if(forceDelete || expired) {
        let prefixString = forceDelete ? 'Forcefully removing' : 'Removing expired'
        // Existing session has expired, so we need to destroy it
        log.info(`> ${prefixString} session ${userSession.sessionId} for user ${userSession.userId}...`);
        await sessionCollection.deleteOne({ _id: userSession.sessionId });
        await userSession.deleteOne({ sessionId: userSession.sessionId })
        prefixString = forceDelete ? 'Forcefully removed' : 'Removed expired'
        log.info(`> ${prefixString} session ${userSession.sessionId}`);
      }
    }
  } catch (err) {
    log.error(`[DATABASE (validateSessionsForUserId)]: ${err.message}`);
  }

  return expired;
}

module.exports = { getUrl, getStore, getClient, getCollection, getSessionCollection, connect, validateSessionsForUserId }