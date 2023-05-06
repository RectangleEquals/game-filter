const passport = require('passport');
const { Strategy } = require('passport-discord');
const User = require('../models/User');
const DiscordUser = require('../models/DiscordUser');
const refresh = require('passport-oauth2-refresh');

const useClientPort = process.env.DISCORD_USE_CLIENT_PORT == 'true';
const callbackUrl = `${process.env.DISCORD_REDIRECT_BASE_URL}:${useClientPort ? process.env.CLIENT_PORT : process.env.PORT}${process.env.DISCORD_REDIRECT_URL}`;
const scopes = process.env.DISCORD_SCOPES.split(',');

const strategy = new Strategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: callbackUrl,
  passReqToCallback: true,
  scope: scopes
}, callback);

async function callback(req, accessToken, refreshToken, profile, done)
{
  console.log(`Authorizing discord user ${profile.id}...`);
  profile.refreshToken = refreshToken;

  try
  {
    if(!req || !req.sessionID || req.sessionID.length < 1)
      return done ? done('Invalid session id in request header', null) : null;

    let bReturning = false;

    // Check if this user already exists via their discord.userID
    let user = await User.findOne({ 'discord.userID': profile.id });
    
    // Check if this user already exists via the current sessionID
    if(!user)
      user = await User.findOne({ sessionID: req.sessionID });
    else
      bReturning = true;

    // User still doesn't exist, so create a new one
    if(!user) {
      console.log('Creating new user...');
      console.log(`> [sessionID]: ${req.sessionID}`);
      console.log(`> [discord.userID]: ${profile.id}`);
      user = await User.create({ sessionID: req.sessionID, 'discord.userID': profile.id });
    } else
      bReturning = true;

    // Notify if this is a preexisting user
    if(bReturning) {
      console.log('Found returning user...');
      console.log(`> [sessionID]: ${user.discord.sessionID}`);
    }
    
    if(!user)
      return done ? done(`Failed to find or create user with discord id ${profile.id}`, null) : null;
    
    // Validate & update this user's sessionID, and discord.userID
    if(user.sessionID !== req.sessionID) {
      // TODO: Invalidate the previous session (possibly via deleting it frm the `sessions` collection?)
      console.log("Updating user's session ID...");
      
      user = await User.findByIdAndUpdate(
        user.id, {
          sessionID: req.sessionID,
          'discord.userID': profile.id
        },
        { upsert: true, new: true }
      );
    }

    // Update (or create) the discord user
    let discordUser = await DiscordUser.findById(user.discord.objectID);
    
    if(!discordUser)
      discordUser = await DiscordUser.create({
        discordID: user.discord.userID,
        avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp`,
        guilds: profile.guilds
      });

    if(!discordUser)
      return done ? done(`Failed to find or create discord user with id ${user.discord.userID}`, null) : null;

    // Update discord avatar, guild info, etc
    discordUser = await DiscordUser.findByIdAndUpdate(
      discordUser.id, {
        discordID: user.discord.userID,
        avatarUrl: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.webp`,
        guilds: profile.guilds
      },
      { upsert: true, new: true }
    );

    // Link the user account collection to the discord user collection
    user = await User.findByIdAndUpdate(
      user.id, {
        discord: {
          objectID: discordUser.id,
          userID: discordUser.discordID
        }
      },
      { upsert: true, new: true }
    );

    // Store the current user into the current session
    req.session.user = user;
    
    return done(null, user);
  } catch (err) {
    console.error(err);
    return done(err, null);
  }
}

function use()
{
  passport.use( strategy );
  refresh.use( strategy );
}

function serializeUser(user, done)
{
  console.log('Serializing Discord User...');
  console.log(`> [id]: ${user.id}`);  
  done(null, user.id);
}

async function deserializeUser(discordID, done)
{
  console.log('Deserializing Discord User...');
  console.log(`> [id]: ${discordID}`);

  try {
    const user = await DiscordUser.findById(discordID);
    if(!user)
      throw new Error('User not found');

    console.log(user);
    if(done)
      done(null, user);

    return user;
  } catch(err) {
    console.error(err);
    if(done)
      done(err, null);
  }

  return null;
}

async function getAvatarUrl(discordID, size = 128)
{
  let user = await deserializeUser(discordID);
  if(!user)
    return null;
  let url = `${user.avatarUrl}?size=${size}`;
  return url;
}

module.exports = { callbackUrl, use, passport, strategy, serializeUser, deserializeUser, getAvatarUrl };