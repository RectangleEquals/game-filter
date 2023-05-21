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
  registrationToken: {
    type: String
  },
  socialLogins: [{
    provider: {
      type: String,
      enum: ['discord', 'steam', 'microsoft', 'epic'],
      required: true
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    }
  }],
  preferences: {
    type: preferenceSchema,
    default: {}
  }
});

module.exports = mongoose.model('User', userSchema);