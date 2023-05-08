const config = require("../config/config");
const express = require("express");
const { getPassport, passport } = require('../passport');
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const multer = require("multer");
const upload = multer();

const router = express.Router();
const pp = getPassport(router);
const basepath = '/api/auth';

async function handleLogin(req, res, next)
{
  console.log('Incoming login request...');

  // Call passport authenticate method with local strategy and callback function
  passport.authenticate('local', (err, user, info) =>
  {
    if (err)
      return next(err);

    if (!user)
      return res.status(401).json({ message: info.message });

    // Set the user ID in the request object for later use
    req.userId = user.id;

    // Call the next middleware function
    return next();
  })(req, res, next);
}

router.get("/", (req, res) => {
  res.status(200).json({ message: "ok" });
});

router.post("/login", upload.none(), pp.initializePassport, pp.sessionPassport, handleLogin, async (req, res) => {
  console.log(`User logged in: ${req.userId}`);
  res.cookie('user', req.userId, {
    path: basepath, 
    sameSite: 'none', 
    secure: true,
    httpOnly: true,
    domain: '.onrender.com'
  });
  res.status(200).json({message: 'Login successful'});

  // Update the database
  try {
    console.log(`Updating database for user ${req.userId}...`);
    const userSession = await UserSession.findOneAndUpdate(
      { sessionId: req.sessionID },
      { $set: { sessionId: req.sessionID, userId: req.userId } },
      { upsert: true, new: true }
    );
    console.log(`UserSession document updated: ${userSession}`);
  } catch (err) {
    console.error(err);
  }

  req.session.save();
});

router.post("/logout", upload.none(), async (req, res) =>
{
  if(!req.session)
    return res.status(400).json({ message: 'Already destroyed' });
  if(!req.body || !req.body.id || !User.findById(req.body.id))
    return res.status(400).json({ message: 'Invalid User ID' });
  
  const sessionId = req.sessionID;
  const userId = req.body.id;
  const store = req.sessionStore;
  console.log(`Destroying session for user ${userId}...`);
 
  req.session.destroy(async(err) =>
  {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }

    // Update the database
    try {
      const userSession = await UserSession.findOne({ userId: userId }).exec();
  
      if (!userSession) {
        console.warn(`UserSession not found for user ${userId}!`);
        return res.status(400).json({ message: `UserSession not found for user ${userId}!` });
      }

      console.log(`Removing session documents from database for user ${userId}...`);
      store.destroy(userSession.sessionId, async err => {
        if(err) {
          console.warn(`Failed to remove document from session collection! ${err}`);
          return res.status(400).json({ message: `Failed to remove document from session collection! ${err}` });
        }

        await userSession.deleteOne({ sessionId: sessionId });
        res.clearCookie(config.SESSION_COOKIE_NAME || "default");
        res.clearCookie("user");
        console.warn(`Session documents removed for user ${userId}!`);
        return res.status(200).json({ message: "ok" });
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: err.message });
    }
  });
});

// Handle login authentication, based on a given provider
/*
async function handleLogin(req, res, next)
{
  console.log('Incoming login request...');
  try {
    if(!(req.query && req.query.provider && req.query.from)) {
      res.status(400).json({ message: 'Bad login request: Wrong query parameters' });
      console.warn('> Bad login request: Wrong query parameters')
      return;
    }
    
    console.log(`> ${basepath} from ${req.ip} - Provider: ${req.query.provider}`);

    let ip = requestIp.getClientIp(req);
    if(req.query.from !== ip) {
      //res.status(400).json({ message: 'Bad login request: IP address mismatch' });
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
    console.log('> Finished processing login request')
  } catch(error) {
    res.status(500).json({ message: error.message });
    console.error(`> Login error: ${error}`);
  }
}
*/

function isAuthorized(req, res, next)
{
  console.log('Checking authorization...');

  // Check if the user is authenticated
  if (!req.session || !req.session.user) {
    console.log('> Unauthorized');
    return res.status(401).send("Unauthorized");
  }

  // Check if the user has the necessary role
  if (req.session.user.role !== "admin") {
    console.log('> Forbidden');
    return res.status(403).send("Forbidden");
  }

  // If the user is authenticated and has the necessary role, call the next middleware
  console.log('> Authorized');
  next();
}

module.exports = { basepath, route: router, isAuthorized };