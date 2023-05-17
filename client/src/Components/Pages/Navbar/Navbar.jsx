import React from 'react';
import { Link } from 'react-router-dom';
import discordLogo from 'assets/discord.svg'
import userAvatar from 'assets/react.svg'

const Navbar = () => {
  const isLoggedIn = false; // replace with actual login status

  const handleLogin = () => {
    // handle login with Discord OAuth2
  }

  const handleLogout = () => {
    // handle logout and clear user data
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <Link to="/" className="navbar-brand">
        GameFilter
      </Link>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to="/preferences" className="nav-link">Preferences</Link>
          </li>
        </ul>
        {isLoggedIn ? (
          <div className="dropdown">
            <button className="btn btn-secondary dropdown-toggle" type="button" id="userDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <img src={userAvatar} alt="User Avatar" className="avatar" />
            </button>
            <div className="dropdown-menu" aria-labelledby="userDropdown">
              <button className="dropdown-item" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={handleLogin}>
            <img src={discordLogo} alt="Discord Logo" className="discord-logo" />
            Login with Discord
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;