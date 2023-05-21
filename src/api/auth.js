const config = require("../config/config");
const express = require("express");
const { getPassport, passport } = require('../passport');
const { generateAccessToken } = require("../lib/security");
const database = require("../database");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const multer = require("multer");
const upload = multer();
const badWords = require('bad-words');
const Mailer = require("../lib/mailer");
const path = require('path');

const router = express.Router();
const pp = getPassport(router);
const bw = new badWords();


// TODO: For routes which require auth checks (ie `isAuthorized`), we
//  could implement some extra security by flagging accounts which make
//  too many bad, invalid or unauthorized requests, possibly deleting
//  the account's user sessions to force a logout, or in extreme cases,
//  issuing a temporary/permanent ban for that particular account, making
//  it impossible to log in, make requests or make a new account


  //////////////////
 // [VALIDATORS] //
//////////////////

async function validateAccessToken(accessToken) {
  const userSession = await UserSession.findOne({ accessToken });
  if (!userSession) throw new Error("Unauthorized (Bad Access Token)");
  return userSession;
}

function validateDisplayName(displayName) {
  const regex = /^[a-zA-Z][a-zA-Z0-9]*(?:_[a-zA-Z0-9]+)*$/;
  if(!regex.test(displayName))
    return -1;
  const name = displayName.replace(/_+/g, ' ');
  if(bw.isProfane(name))
    return -2;
  return 1;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

  ///////////////////
 // [AUTHORIZERS] //
///////////////////

function isAuthorized(req, res, next) {
  console.log("Checking authorization...");

  // Check if the request has a valid access token
  if (!req.body || !req.body.accessToken) {
    console.log("> Unauthorized");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Verify the access token
  validateAccessToken(req.body.accessToken)
  .then(userSession => {
    req.userSession = userSession;
    console.log("> Authorized");
    next();
  })
  .catch(err => {
    console.log(`> ${error.message}`);
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  });
}

  ////////////////
 // [HANDLERS] //
////////////////

async function handleRegistration(req, res, next)
{
  console.log(`Incoming registration request from ${req.body.email}...`);

  try {
    req.registration = {};
    req.registration.user = await User.findOne({ email: req.body.email });
    
    // Check if a user already exists
    if(req.registration.user)
    {
      // User already exists, check if they're verified
      if(req.registration.user.verified) {
        console.log(`> Registration request from ${req.body.email} already verified...`);
        req.registration.res = { status: 418, message: 'verified' };
        
        return next();
      }

      // User exists but isn't verified, check if they're pending account verification
      if(req.registration.user.registrationToken) {
        console.log(`> Registration request from ${req.body.email} already pending...`);
        req.registration.res = { status: 418, message: 'pending' };

        return next();
      }
    } else {
      // User doesn't exist in the database yet...
      // Let's validate their requested DisplayName
      const isValid = validateDisplayName(req.body.displayName);
      if(isValid !== 1) {
        let message;

        if(isValid === -1)
          message = 'invalid_name';
        else if(isValid === -2)
          message = 'profane';

        req.registration.res = { status: 418, message: message };

        return next();
      }

      // Now we make sure to also validate the email
      if(!validateEmail(req.body.email)) {
        req.registration.res = { status: 418, message: 'invalid_email' };
        return next();
      }

      // Add them to the database, and set their pending status
      const token = generateAccessToken(req.body.email, req.body.displayName);
      const newUser = new User({
        email: req.body.email,
        displayName: req.body.displayName,
        password: req.body.password,
        verified: false,
        registrationToken: token,
        socialLogins: []
      });

      // Update the database
      await newUser.save();
      req.registration.user = newUser;
      req.registration.res = { status: 200, message: 'new' };
    }
  } catch (err) {
    req.registration.res = { status: 400, message: err };
  }

  next();
}

async function handleLogin(req, res, next)
{
  console.log('Incoming login request...');

  // Call passport authenticate method with local strategy and callback function
  passport.authenticate('local', (err, user, info) =>
  {
    if (err) {
      req.error = err;
      return next();
    }

    if (!user) {
      req.error = info;
      return next();
    }

    // Check if the user is verified
    if (!user.verified) {
      req.error = new Error("User hasn't verified their account");
      return next();
    }

    // Everything is okay, set the user object in the request and proceed
    req.user = user;
    next();
  })(req, res, next);
}

  //////////////
 // [ROUTES] //
//////////////

router.post("/api/auth/register", upload.none(), handleRegistration, async (req, res) =>
{
  try {
    switch(req.registration.res.status) {
      case(200):
      {
        const token = req.registration.user.registrationToken;

        if(req.registration.res.message === 'new')
        {
          // Handle new users by sending an account verification email
          Mailer.createFromHtmlFile(
            config.MAILER_EMAIL_SERVER,
            config.MAILER_EMAIL_PORT,
            config.MAILER_EMAIL_USERNAME,
            config.MAILER_EMAIL_PASSWORD,
            req.body.email,
            'GameFilter Account Verification',
            path.resolve(process.cwd(), 'src', 'assets', 'VerificationEmail.html'),
            html => {
              return html.replace(/<a href="#top"/g, `<a href="http://gamefilter.servegame.com/verify/${token}"`);
            }
          ).then(mailer => {
            mailer.send().then(result => {
              if(result !== undefined && result !== null && result !== false) {
                console.error(`> Verification pending for ${req.body.email} with token ${token}...`);
                res.status(200).json({token: token});
              } else {
                console.error(`[ERROR]: ${result.error.message}`);
                res.status(400).send(result.error.message);
              }
            }).catch(err => {
              console.error(`[ERROR]: ${err.message}`);
              res.status(400).send(err.message);
            });
          }).catch(err => {
            console.error(`[ERROR]: ${err.message}`);
            res.status(400).send(err.message);
          });
          return;
        } else if(req.registration.res.message === 'verified') {
          // User has already been verified
          res.status(200).send('verified');
          return;
        } else if(req.registration.res.message === 'pending') {
          // User verification is still pending
          res.status(200).send('pending');
          return;
        } else {
          console.warn('[WARNING]: Unhandled 200 status in registration route...');
          res.status(500).send('unhandled');
          return;
        }
      }
      case(400):
      {
        console.error(`[ERROR]: ${req.registration.res.message}`);
        res.status(400).send(req.registration.res.message);
        return;
      }
      case(418):
      {
        console.warn(`[WARNING]: Failed registration! Reason: ${req.registration.res.message}`);
        res.status(418).send(req.registration.res.message);
        return;
      }
      default:
        console.error(`[ERROR]: Unhandled status`);
        res.status(500).send('unhandled');
        return;
    }
  } catch (err) {
    console.error(`[ERROR]: ${err.message}`);
    res.status(400).send(err.message);
  }
});

router.get("/api/auth/verify/:token", async(req, res) => {
  try {
    const token = req.params.token;

    // Handle situations where a token is somehow null, empty, undefined, etc
    if(!token || token.length < 1) {
      console.warn(`Bad verification request: ${JSON.stringify(req.query)}`);
      res.status(400).send('Bad verification request');
      return;
    }

    // Handle situations where a user with the requested token doesn't exist
    const user = await User.findOne({ registrationToken: token });
    if(!user) {
      console.warn(`[WARNING]: Verification requested for invalid user with token: ${token}`);
      res.status(400).send('invalid');
      return;
    }
    console.log(`Verification requested for user ${user.email} with token: ${token}`);

    // Make sure the user hasn't already been verified
    if(user.verified) {
      res.status(400).send('verified');
      return;
    }

    // Verify the user
    const updatedUser = await User.findOneAndUpdate(
      { email: user.email },
      { $set: { verified: true } },
      { upsert: true, new: true }
    );
    
    // Check that all went well
    if(!updatedUser) {
      res.status(400).send('failed');
    }

    res.status(200).send('verified');
  } catch (err) {
    console.error(`[ERROR]: ${err.message}`);
    res.status(400).send(err.message);    
  }
});

router.post("/api/auth/login", upload.none(), pp.initializePassport, pp.sessionPassport, handleLogin, async (req, res) =>
{
  try {
    // Handle any errors thrown from previous middleware(s)
    if (req.error) {
      console.error(req.error);
      return res.status(400).send(req.error.message);
    }

    console.log(`Login requested from user: ${req.user.email} (${req.user.id})`);

    // Validate the session
    await database.validateSessionsForUserId(req.user.id, true);

    // Update the database
    let accessToken = generateAccessToken(req.user.id, req.sessionID);
    console.log(`Updating session for user ${req.user.email} (${req.user.id})...`);
    userSession = await UserSession.findOneAndUpdate(
      { accessToken: accessToken },
      { $set: { accessToken: accessToken, sessionId: req.sessionID, userId: req.user.id } },
      { upsert: true, new: true }
    );
    req.session.save();
    console.log(`UserSession document updated: ${userSession}`);

    // Send the response with an access token back to the client
    res.status(200).json({ accessToken: accessToken, displayName: req.user.displayName });
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
});

router.post("/api/auth/logout", upload.none(), isAuthorized, async (req, res) =>
{
  if(!req.userSession || !req.userSession.userId)
    return res.status(400).json({ message: 'Unknown User' });
    
  await database.validateSessionsForUserId(req.userSession.userId, true);
  res.status(200).send('ok');
});

router.post("/api/auth/user", upload.none(), isAuthorized, async (req, res) => {
  try {
    const user = await User.findById(req.userSession.userId);

    if(!user)
      return res.status(400).send('invalid');

    const expired = await database.validateSessionsForUserId(user.id);
    if(expired)
      return res.status(200).json({ email: user.email, displayName: user.displayName, status: 'inactive' });

    return res.status(200).json({ email: user.email, displayName: user.displayName, social: user.socialLogins, status: 'active' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

module.exports = { router, isAuthorized };