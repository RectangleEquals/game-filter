const mongoose = require('mongoose');
const preferenceSchema = require('./Preferences');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String
  },
  password: {
    type: String
  },
  verified: {
    type: Boolean
  },
  socialLogins: [{
    provider: {
      type: String,
      enum: ['discord', 'steam', 'microsoft', 'epic'],
      required: true
    },
    providerId: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String
    }
  }],
  preferences: {
    type: preferenceSchema,
    default: {}
  }
});

module.exports = mongoose.model('User', userSchema);