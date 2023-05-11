const config = require("../config/config");
const express = require("express");
const { getPassport, passport } = require('../passport');
const { generateAccessToken } = require("../lib/security");
const database = require("../database");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const multer = require("multer");
const upload = multer();
const Mailer = require("../lib/mailer");
const path = require('path');

const router = express.Router();
const pp = getPassport(router);
const basepath = config.AUTH_PATH;

async function verifyAccessToken(accessToken) {
  const userSession = await UserSession.findOne({ accessToken });
  if (!userSession) throw new Error("Unauthorized (Bad Access Token)");
  return userSession;
}

function isAuthorized(req, res, next) {
  console.log("Checking authorization...");

  upload.none()(req, res, (err) => {
    if (err) {
      console.log("> Error parsing request body");
      return res.status(400).json({ message: "Error parsing request body", error: err.message });
    }

    // Check if the request has a valid access token
    if (!req.body || !req.body.accessToken) {
      console.log("> Unauthorized");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Verify the access token
    verifyAccessToken(req.body.accessToken)
      .then(userSession => {
        req.userSession = userSession;
        console.log("> Authorized");
        next();
      })
      .catch(err => {
        console.log(`> ${error.message}`);
        return res.status(401).json({ message: "Unauthorized", error: err.message });
      });
  });
}

async function handleRegistration(req, res, next)
{
  console.log('Incoming registration request...');

  try {
    const user = await User.findOne({ email: req.email });
    next();
  } catch (err) {
    res.status(409).send('exists');
  }
}

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
  res.status(200).send('ok');
});

router.get("/verify/:token", async(req, res) => {
  const token = req.params.token;
  if(!token) {
    console.warn(`Bad verification request: ${JSON.stringify(req.query)}`);
    res.status(400).send('Bad verification request');
    return;
  }

  console.log(`Verification requested from user: ${token}`);
  res.status(200).send('Verified!');
});

// Creates a new, unverified User and sends them an account verification email
router.post("/register", upload.none(), handleRegistration, async (req, res) => {
  // TODO: Incorporate the following:
  //  - Add error checking for when a user already exists and/or is already verified
  //  - Add the generated verification token to the User collection for use in the /verify route
  //  - Add the /verify route as a GET request which checks query params for the token
  //      and updates the corresponding User `verified` field upon successful verification
  //  - Add verification to the /login route (making sure only verified users can actually login)
  try {
    const token = generateAccessToken(req.body.email, req.body.displayname);
    Mailer.createFromHtmlFile(
      config.MAILER_EMAIL_SERVER,
      config.MAILER_EMAIL_PORT,
      config.MAILER_EMAIL_USERNAME,
      config.MAILER_EMAIL_PASSWORD,
      req.body.email,
      'GameFilter Account Verification',
      path.resolve(process.cwd(), 'src', 'assets', 'VerificationEmail.html'),
      html => {
        return html.replace(/<a href="#top"/g, `<a href="http://game-filter.com/verify?token=${token}"`);
      }
    ).then(mailer => {
      mailer.send().then(result => {
        if(result !== undefined && result !== null && result !== false)
          res.status(200).send('ok');
        else
          res.status(400).send(result.error.message);
      }).catch(err => {
        res.status(400).send(err.message);
      });
    }).catch(err => {
      res.status(400).send(err.message);
    });
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.post("/login", upload.none(), pp.initializePassport, pp.sessionPassport, handleLogin, async (req, res) =>
{
  console.log(`Login requested from user: ${req.userId}`);
  // res.setHeader('Access-Control-Allow-Origin', 'http://gamefilter.servegame.com');

  try {
    // Validate the session
    await database.validateSessionsForUser(req.userId, true);
    
    // Update the database
    let accessToken = generateAccessToken(req.userId, req.sessionID);
    console.log(`Updating session for user ${req.userId}...`);
    userSession = await UserSession.findOneAndUpdate(
      { accessToken: accessToken },
      { $set: { accessToken: accessToken, sessionId: req.sessionID, userId: req.userId } },
      { upsert: true, new: true }
    );
    req.session.save();
    console.log(`UserSession document updated: ${userSession}`);

    // Send the response with an access token back to the client
    res.status(200).json({ accessToken: accessToken });
  } catch (err) {
    console.error(err);
    res.status(400);
  }
});

router.post("/logout", isAuthorized, async (req, res) =>
{
  if(!req.userSession || !req.userSession.userId)
    return res.status(400).json({ message: 'Unknown User' });
    
  await database.validateSessionsForUser(req.userSession.userId, true);
  res.status(200).send('ok');
});

module.exports = { basepath, route: router, isAuthorized };