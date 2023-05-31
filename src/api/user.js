const express = require("express");
const { isAuthorized } = require("./auth");
const { getGuildIconUrl, getUserGuildRelationships } = require("../strategies/discord");
const DiscordUser = require("../models/DiscordUser");
const User = require("../models/User");
const multer = require("multer");
const upload = multer();

const router = express.Router();

const getDiscordUserData = async (discordUser) => {
  if (!discordUser) {
    return null;
  }

  // Filter out potentially sensitive or useless information from the user object
  const { guilds, __v, _id, accessToken, refreshToken, userId, ...userData } = discordUser.toObject();
  const processedGuilds = guilds.map(guild => {
    const { _id, ...guildData } = guild;
    return guildData;
  });

  // Get relationships between this user and other users with the same guild(s)
  const userGuildIds = processedGuilds.map(guild => guild.id);
  const userGuildRelationships = await getUserGuildRelationships(userGuildIds);

  // Build the relationships object excluding the current user
  const relationships = userGuildRelationships
    .filter(user => user.discordId !== discordUser.discordId)
    .map(user => {
      const sharedGuilds = user.guilds.filter(guild => userGuildIds.includes(guild.id));
      return {
        user: { id: user.discordId, name: user.userName, avatar: user.avatarUrl },
        guilds: sharedGuilds.map(guild => {return {id: guild.id, name: guild.name, icon: getGuildIconUrl(guild.id, guild.icon)}}),
      };
    });

  return { ...userData, guilds: processedGuilds, relationships };
};

const handleUserRequest = async(req, res, next) =>
{
  // Handle any errors thrown from previous middleware(s)
  if (!(req.userSession && req.userSession.accessToken)) {
    console.error("[ERROR (handleUserRequest)]: invalid token");
    return res.status(400).send("invalid_token");
  }
  
  try {
    // Build user data
    const user = await User.findById(req.userSession.userId);
    let userData = {};
    userData.email = user.email;
    userData.displayName = user.displayName;
    userData.verified = user.verified;
    userData.roles = user.roles;
    userData.preferences = user.preferences;
    userData.socials = [];

    // Build social data
    for (const account of user.socialLogins) {
      switch (account.provider) {
        case "discord":
          const discordUser = await DiscordUser.findById(account.documentId);
          const data = await getDiscordUserData(discordUser);
          if(data) {
            userData.socials.push({discord: data});
          }
          break;
        default:
          // No social account links
          break;
      }
    }

    req.userData = userData;
  } catch (err) {
    req.error = err;
  }

  next();
}

router.post('/api/user', upload.none(), isAuthorized, handleUserRequest, async(req, res) => {
  try {
    // Handle any errors thrown from previous middleware(s)
    if (req.error)
      throw new Error(req.error);
    
    res.status(200).json(req.userData || {});
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

module.exports = { router };