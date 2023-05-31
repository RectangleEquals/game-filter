const config = require("../config/config");
const { passport } = require('../passport');
const DiscordUser = require("../models/DiscordUser");
const User = require("../models/User");
const UserSession = require("../models/UserSession").model;
const { Strategy } = require('passport-discord');
const refresh = require('passport-oauth2-refresh');

const callbackUrl = config.DISCORD_REDIRECT_URL;
const scopes = config.DISCORD_SCOPES.split(' '); // ['identify', 'guilds', 'email']

const callback = async(req, accessToken, refreshToken, profile, done) =>
{
  try
  {
    console.log(`Updating discord user ${profile.username} (${profile.id})...`);
    if(!(req.query && req.query.state))
      throw new error('invalid_state');

    let userSession = await UserSession.findOne({ accessToken: req.query.state });
    let user = await User.findById(userSession.userId);

    let discordUser = await DiscordUser.findOne({ discordId: profile.id });
    if (!discordUser) {
      // Create a new user with the Discord profile
      discordUser = new DiscordUser({
        discordId: profile.id,
        email: profile.email,
        userName: profile.username,
        avatarUrl: getAvatarUrl(profile.id, profile.avatar),
        guilds: profile.guilds,
        accessToken: accessToken,
        refreshToken: refreshToken,
        userId: user.id
      });

      // Save the new user to the database
      await discordUser.save();
    } else {
      // Update the existing user with the latest tokens
      discordUser.accessToken = accessToken;
      discordUser.refreshToken = refreshToken;
      await discordUser.save();
    }

    console.log(`> Finished updating discord user ${profile.username} (${profile.id})`);
    return done(null, discordUser);
  } catch (err) {
    console.error(`> Failed to update discord user ${profile.username} (${profile.id}): ${err}`);
    return done(err, null);
  }
}

const strategy = new Strategy({
  clientID: config.DISCORD_CLIENT_ID,
  clientSecret: config.DISCORD_CLIENT_SECRET,
  callbackURL: callbackUrl,
  passReqToCallback: true,
  scope: scopes
}, callback);

const use = () =>
{
  // Serialize the user into a session
  passport.serializeUser((user, done) => {
    console.log('> (discord) Serializing User...');
    done(null, user.id);
  });

  // Deserialize the user from the session
  passport.deserializeUser(async (id, done) => {
    console.log('> (discord) Deserializing User...');
    //const user = DiscordUser.find(u => u.id === id);
    const user = await DiscordUser.findOne({ discordId: id });
    done(null, user);
  });

  passport.use( strategy );
  refresh.use( strategy );
}

const getUserGuildRelationships = async (guildIds) => {
  try {
    console.log(`> Retrieving guild relationships...`);

    // Retrieve all users who have linked their Discord accounts
    const discordUsers = await DiscordUser.find({
      guilds: { $elemMatch: { id: { $in: guildIds } } },
    });

    // Build the final list of user information
    const userList = discordUsers.map((user) => {
      return {
        discordId: user.discordId,
        userName: user.userName,
        avatarUrl: user.avatarUrl,
        guilds: user.guilds,
      };
    });

    return userList;
  } catch (err) {
    console.error(`> Failed to retrieve guild relationships: ${err}`);
    return null;
  }
};

const getAvatarUrl = (discordId, avatarId, size = 32, format = 'webp') => {
  return `https://cdn.discordapp.com/avatars/${discordId}/${avatarId}.${format}?size=${size}`;
}

const getGuildIconUrl = (guildId, iconId, size = 32, format = 'webp') => {
  return `https://cdn.discordapp.com/icons/${guildId}/${iconId}.${format}?size=${size}`;
}

module.exports = { strategy, use, getUserGuildRelationships, getAvatarUrl, getGuildIconUrl };