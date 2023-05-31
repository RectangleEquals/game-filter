const log = require("../lib/log");
const { passport } = require("../passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const callback = async (email, password, done) => {
  try {
    const user = await User.findOne({ email: email, password: password });
    if (!user) {
      return done(null, false, { message: 'Incorrect email or password.' });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}

const strategy = new LocalStrategy({
  usernameField: 'email',     // The name of the field for email
  passwordField: 'password',  // The name of the field for password
}, callback);

const use = () =>
{
  passport.serializeUser((user, done) => {
    log.info('> (local) Serializing User...');
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id, done) =>
  {
    log.info('> (local) Deserializing User...');
    
    try {
      const user = await User.findById(id);
      if(!user)
        throw new Error('User not found');
        
        log.info(`> [id]: ${user.id}`);
        log.info(`> [session]: ${user.sessionID}`);
        
      if(done)
        return done(null, user);
    } catch (err) {
      log.error(err);
      if(done)
      return done(err);
    }
  });

  passport.use(strategy);
}

module.exports = { strategy, use };