const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/User");

const strategy = new LocalStrategy(
  {
    usernameField: 'email',     // The name of the field for email
    passwordField: 'password',  // The name of the field for password
  },
  async (email, password, done) => {
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
);

const use = () =>
{
  passport.use(strategy);

  // TODO: Figure out why these functions never get called
  /*
  passport.serializeUser((user, done) => {
    console.log('(local) Serializing User...');
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) =>
  {
    console.log('(local) Deserializing User...');
    
    try {
      const user = await User.findById(id);
      if(!user)
        throw new Error('User not found');
      
      console.log(`> [id]: ${user.id}`);
      console.log(`> [session]: ${user.sessionID}`);

      if(done)
        return done(null, user);
    } catch (err) {
      console.error(err);
      if(done)
        return done(err);
    }
  });
  */
}

module.exports = { strategy, use };