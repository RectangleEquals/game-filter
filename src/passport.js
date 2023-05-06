const passport = require('passport');

let _passport = undefined;
class Passport {
  constructor(server) {
    this.server = server;
    this.initializePassport = passport.initialize();
    this.sessionPassport = passport.session();
    _passport = this;
  }

  use() {
    this.server.use(this.initializePassport);
    this.server.use(this.sessionPassport);
  }
}

const getPassport = (server) => {
  if(_passport)
    return _passport;
  _passport = new Passport(server);
  _passport.use();
  return _passport;
}

module.exports = { getPassport, passport };