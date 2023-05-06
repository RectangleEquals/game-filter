const config = require("./config/config");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");

let client = undefined;
let store = undefined;

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
    clientPromise: connect()
  }

  return store = MongoStore.create(cmOptions);
}

const getClient = async() =>
{
  if(client !== undefined || client !== null)
    return client;

  return connect();
}

const connect = async (strictQuery = true) =>
{
  if(client !== undefined && client !== null)
    return client;

  const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }

  mongoose.set('strictQuery', strictQuery);

  // Connect to MongoDB
  const dbUrl = getUrl();
  console.log(`Connecting to database: '${dbUrl}'`);

  return client = mongoose.connect(dbUrl, dbOptions)
  .then((client) => {
    console.log(`Connected to database: '${dbUrl}'`);
    return client;
  })
  .catch((err) => {
    console.error(`Error connecting to database: '${dbUrl}': ${err}`);
    return undefined;
  });
}

module.exports = { getUrl, getStore, getClient, connect }