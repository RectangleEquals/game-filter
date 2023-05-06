const mongoose = require('mongoose');

const PreferenceSchema = new mongoose.Schema({
  releaseDate: {
    type: Date,
    default: Date.now
  },
  developer: {
    type: String
  },
  publisher: {
    type: String
  },
  platform: {
    type: String,
    enum: ['PC', 'Mac', 'Linux', 'Mobile']
  },
  platformStore: {
    type: String,
    enum: ['Steam', 'Xbox Game Pass', 'Epic']
  },
  features: [{
    type: String,
    enum: ['Multiplayer', 'Controller Support', 'Touch Support', 'VR Support']
  }]
});

module.exports = PreferenceSchema;