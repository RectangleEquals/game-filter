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

module.exports = { basepath, route: router, isAuthorized };