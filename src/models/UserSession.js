const mongoose = require('mongoose');

const UserSessionSchema = new mongoose.Schema({
  accessToken: { type: String, required: true, unique: true},
  sessionId: { type: String, required: true, unique: true },
  userId: { type: String, required: true, unique: true }
});

module.exports = {schema: UserSessionSchema, model: mongoose.model('usersessions', UserSessionSchema)};
