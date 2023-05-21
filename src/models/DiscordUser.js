const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  id: {
    type: String
  },
  name: {
    type: String
  },
  icon: {
    type: String
  },
  owner: {
    type: Boolean
  },
  permissions: {
    type: Number
  },
  permissions_new: {
    type: String
  },
  features: [String]
});

const discordUserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String
  },
  avatarUrl: {
    type: mongoose.Schema.Types.String
  },
  guilds: {
    type: [guildSchema]
  },
  accessToken: {
    type: String
  },
  refreshToken: {
    type: String
  },
  userId: {
    type: String
  }
});

module.exports = mongoose.model('DiscordUser', discordUserSchema);