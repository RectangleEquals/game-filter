const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    enum: ['INFO', 'WARNING', 'ERROR'],
    required: true
  },
  message: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Log', logSchema);
