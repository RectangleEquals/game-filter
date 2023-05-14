const config = require('../config/config');
const { randomBytes, createHash } = require('node:crypto');

function generateAccessToken(id1, id2) {
  // Create a random salt value
  const salt = randomBytes(16).toString('hex');

  // Create a string by concatenating the two ids, the salt value, and the current date/time
  const currentDate = new Date().toISOString();
  const inputString = `${id1}-${id2}-${config.SESSION_SECRET}-${salt}-${currentDate}`;

  // Generate a hash of the input string using a cryptographic hash function
  const hash = createHash('sha256').update(inputString).digest('hex');

  // Return the first 32 characters of the hash as the access token
  return hash.substring(0, 32);
}

module.exports = { generateAccessToken }