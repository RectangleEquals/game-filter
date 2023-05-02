const config = require("./config/config");
const cors = require("cors");
const url = require("url");
const path = require("path");
const fs = require("fs");

let allowedOrigins = [];

function matchDomain(arr, domain) {
  for (let i = 0; i < arr.length; i++) {
    const regex = new RegExp('^' + arr[i].replace(/\*/g, '.*') + '$');
    if (regex.test(domain)) {
      return true;
    }
  }
  return false;
}

const setup = async(server) =>
{
  let whitelistFile = path.resolve(process.cwd(), "src", "config", config.CORS_WHITELIST_FILENAME);
  if(config.NODE_ENV === "production")
    whitelistFile = `/etc/secrets/${config.CORS_WHITELIST_FILENAME}`;

  // Load CORS whitelist from file
  fs.readFile(whitelistFile, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading whitelist:", err);
      return;
    }

    // Parse each line of the file as a regular expression and add it to the array
    const lines = data.trim().split("\n");
    for (let line of lines) {
      const trimmedLine = line.trim();
      allowedOrigins.push(trimmedLine);
    }

    console.log(`[Allowed Origins]:\n${allowedOrigins}`);
  });

  server.use(function (req, res, next) {
    req.headers.origin = req.headers.origin || req.headers.host;
    next();
  });
}

// Enable CORS from allowed origins
const middleware = cors({
  origin: (origin, callback) => {
    const parsedOrigin = url.parse(origin || '');
    const domain = parsedOrigin.hostname || '';

    console.log(`Incoming request from ${domain}`);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!domain) return callback(null, true);

    if (matchDomain(allowedOrigins, domain))
      callback(null, true);
    else
      callback(new Error('Unauthorized cross-origin resource sharing'));
  }
});

module.exports = { setup, middleware };