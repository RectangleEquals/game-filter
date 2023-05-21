const config = require("../config/config");
const express = require("express");
const DiscordUser = require("../models/DiscordUser");
const { isAuthorized } = require("./auth");
const User = require("../models/User");
const multer = require("multer");
const upload = multer();

const router = express.Router();

const getDiscordUserData = async(discordUser) => {
  if(!discordUser)
    return null;

  const { guilds, __v, _id, accessToken, refreshToken, userId, ...userData } = discordUser.toObject();
  const processedGuilds = guilds.map(guild => {
    const { _id, ...guildData } = guild;
    return guildData;
  });

  return { ...userData, guilds: processedGuilds };
}

const handleUserRequest = async(req, res, next) =>
{
  // Handle any errors thrown from previous middleware(s)
  if (!(req.userSession && req.userSession.accessToken)) {
    console.error("[ERROR (handleUserRequest)]: invalid token");
    return res.status(400).send("invalid_token");
  }
  
  try {
    // Check for any social links
    const user = await User.findById(req.userSession.userId);
    let userData = [];

    for (const account of user.socialLogins) {
      switch (account.provider) {
        case "discord":
          const discordUser = await DiscordUser.findById(account.documentId);
          const data = await getDiscordUserData(discordUser);
          if(data)
            userData.push({ provider: account.provider, data });
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

module.exports = { router }