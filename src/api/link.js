const config = require("../config/config");
const express = require("express");
const { getPassport, passport } = require('../passport');
const { isAuthorized } = require("./auth");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const multer = require("multer");
const upload = multer();

const router = express.Router();
const pp = getPassport(router); // Grabs the passport singleton


  ////////////////
 // [HANDLERS] //
////////////////

const handleDiscordLogin = (req, res, next) =>
{
  console.log('Incoming Discord account link request...');

  // Call passport authenticate method with discord strategy and callback function
  passport.authenticate('discord', (err, user, info) =>
  {
    if (err) {
      req.error = err;
      return next();
    }

    if (!user) {
      req.error = info;
      return next();
    }

    if (!(req.query && req.query.state)) {
      req.error = new Error("invalid token");
      return next();
    }

    // Everything is okay, set the user object in the request and proceed
    req.discordUser = user;
    next();
  }, {failureRedirect: `/api/link/discord/callback/?error=1`})(req, res, next);
}

  //////////////
 // [ROUTES] //
//////////////

// TODO: Implement an `/api/link/discord/user` POST route to
//  check if a discord account is already linked to a given
//  user with the given accessToken

// Returns Discord OAuth URL
router.post('/api/link/discord', upload.none(), isAuthorized, async(req, res) => {
  try {
    // Handle any errors thrown from previous middleware(s)
    if (!(req.userSession && req.userSession.accessToken)) {
      console.error("[ERROR (/api/link/discord)]: invalid token");
      return res.status(400).send("invalid_token");
    }
    
    res.status(200).send(`${config.DISCORD_AUTHURL}&state=${req.userSession.accessToken}`);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

// Initializes passport for Discord
router.get('/api/link/discord/callback', pp.initializePassport, pp.sessionPassport, handleDiscordLogin, async (req, res) => {
  try {
    // Handle any errors thrown from previous middleware(s)
    if (req.error)
      throw new Error(req.error);

    const userSession = await UserSession.findOne({ accessToken: req.query.state });
    const user = await User.findById(userSession.userId);
    const discordProvider = user.socialLogins.find((login) => login.provider === 'discord');

    if (discordProvider) {
      // If the discord provider exists, update the documentId
      discordProvider.documentId = req.discordUser.id;
    } else {
      // If the discord provider doesn't exist, add a new entry
      user.socialLogins.push({
        provider: 'discord',
        documentId: req.discordUser.id
      });
    }

    await user.save();
    return res.redirect(config.DISCORD_CLIENT_REDIRECT)
  } catch (err) {
    console.error(err.message);
    return res.redirect(`${config.DISCORD_CLIENT_REDIRECT}/${Buffer.from(req.error.message).toString('base64')}`)
  }
});

module.exports = { router }