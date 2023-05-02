const router = require("express").Router();
const requestIp = require("request-ip");
const path = require("path");

const basepath = '/api/auth';

function relativeRoute(relativePath) {
  return path.join(basepath, relativePath).replace(/\\/g, '/');
}

function redirect(res, route, delay = 0) {
  console.log(`Redirecting to '${route}'...`);
  setTimeout(() => res.redirect(route), delay);
}

function redirectRelative(res, relativePath, delay = 0) {
  redirect(res, relativeRoute(relativePath));
}

// Handle login authentication, based on a given provider
router.get("/", async (req, res) =>
{
  console.log('Incoming Auth request...');
  try {
    if(!(req.query && req.query.provider && req.query.from)) {
      res.status(400).json({ message: 'Bad auth request: Wrong query parameters' });
      console.warn('> Bad auth request: Wrong query parameters')
      return;
    }
    
    console.log(`> ${basepath} from ${req.ip} - Provider: ${req.query.provider}`);

    let ip = requestIp(req);
    if(req.query.from !== ip) {
      //res.status(400).json({ message: 'Bad auth request: IP address mismatch' });
      console.warn(`> [WARNING]: IP address mismatch! Expected '${ip}' got '${req.query.from}'`);
      //return;
    }

    // Handle authentication based on requested provider
    switch(req.query.provider) {
      case 'discord':
        res.status(200).json({ message: 'ok', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/200' });
        break;
      case 'steam':
        res.status(501).json({ message: 'Provider not yet implemented', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501' });
        break;
      case 'microsoft':
        res.status(501).json({ message: 'Provider not yet implemented', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501' });
        break;
      case 'epic':
        res.status(501).json({ message: 'Provider not yet implemented', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/501' });
        break;
      default:
        res.status(400).json({ message: 'Unknown provider', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/400' });
        break;
    }
    console.log('> Finished processing auth request')
  } catch(error) {
    res.status(500).json({ message: error.message });
    console.error(`> Auth error: ${error}`)
  }
});

module.exports = { basepath, route: router };