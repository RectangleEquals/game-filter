const config = require("../config/config");
const { getPassport, passport } = require('../passport');
const DiscordUser = require("../models/DiscordUser");
const User = require("../models/User");
const UserSession = require("../models/UserSession");
const { Strategy } = require('passport-discord');
const refresh = require('passport-oauth2-refresh');

// TODO:
// - Gut this down to follow more in suit with `auth.js` and `local.js`
// - Follow https://www.passportjs.org/packages/passport-discord/ for a better understanding
// - Have the client *request* the auth URL from here, adding the callback to a new route in `App.js`

const callbackUrl = config.DISCORD_REDIRECT_URL;
const scopes = config.DISCORD_SCOPES.split(' ');

const callback = async(req, accessToken, refreshToken, profile, done) =>
{
  try
  {
    console.log(`Updating discord user ${profile.username} (${profile.id})...`);
    if(!(req.query && req.query.state))
      throw new error('invalid_state');

    let userSession = await UserSession.findOne({ accessToken: req.query.state });
    let user = await User.findOne({ id: userSession.userId });

    let discordUser = await DiscordUser.findOne({ discordId: profile.id });
    if (!discordUser) {
      // Create a new user with the Discord profile
      discordUser = new DiscordUser({
        discordId: profile.id,
        email: profile.email,
        userName: profile.username,
        avatarUrl: profile.avatar,
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
    done(null, user.id);
  });

  // Deserialize the user from the session
  passport.deserializeUser(async (id, done) => {
    //const user = DiscordUser.find(u => u.id === id);
    const user = await DiscordUser.findOne({ discordId: id });
    done(null, user);
  });

  passport.use( strategy );
  refresh.use( strategy );
}

module.exports = { strategy, use };