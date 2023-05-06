const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1d' }
});

module.exports = mongoose.model('usersessions', UserSessionSchema);
