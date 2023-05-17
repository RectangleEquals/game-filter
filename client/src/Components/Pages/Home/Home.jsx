import React, { useState, useEffect, useRef } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import resolveUrl from "utils/resolveUrl";
import ImageAsset from 'components/ImageAsset';
//import LoginModal from 'components/ModalDialogs/LoginModal';
import LoginOrRegisterModal from 'components/ModalDialogs/LoginOrRegisterModal';
import Footer from '../Navbar/Footer';
import formDataBody from 'form-data-body';
import { useParams } from "react-router-dom";
import VerifyAccountModal from '../../ModalDialogs/VerifyAccountModal';
import './Home.css';

const clientUrlBase = import.meta.env.VITE_CLIENT_BASEPATH || "http://localhost";
const apiUrlBase = import.meta.env.VITE_API_AUTHPATH || "http://localhost/api/auth";
const apiUrlLogout = resolveUrl(apiUrlBase, 'logout');
const buildId = import.meta.env.VERCEL_GIT_COMMIT_SHA || "1.0.0";
const commitId = import.meta.env.VERCEL_GIT_COMMIT_REF || "alpha";
const sessionName = import.meta.env.SESSION_COOKIE_NAME || "__gfsid";

function Home()
{
  const didMountRef = useRef(false);
  const { verification } = useParams();
  const [accessToken, setAccessToken] = useState(sessionStorage.getItem(sessionName));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [wasLoggedIn, setWasLoggedIn] = useState(isLoggedIn);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    console.log(`/${verification}`);
    updateToken();

    if (!didMountRef.current) {
      checkSession();
      didMountRef.current = true;
    }
  }, []);

  const updateToken = () => {
    // Check for the existence of a previous session
    const token = sessionStorage.getItem(sessionName);
  
    // Update the session
    if (token !== accessToken) {
      setAccessToken(token);
    }

    return token;
  }

  const checkSession = () => {
    if (accessToken) {
      // User is logged in
      if(!isLoggedIn)
        handleLoginChange(true);

      console.log('User is logged in');
    } else {
      // User is not logged in
      if(isLoggedIn)
        handleLoginChange(false);

      console.log('User is not logged in');
    }
  }

  const sendLogoutRequest = () =>
  {
    const boundary = formDataBody.generateBoundary();
    const header = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`
    }
    const body = formDataBody({ accessToken: updateToken() }, boundary);
  
    fetch(apiUrlLogout, {
      method: 'POST',
      body: body,
      mode: 'cors',
      headers: header
    })
    .then(response => {
      if (response.status === 200) {
        // Update the isLoggedIn state
        setIsLoggedIn(false);
        sessionStorage.removeItem(sessionName);
        updateToken();
        console.log('User logged out');
      }
    })
    .catch(error => console.error(error));
  }   

  const handleLoginRequest = () => {
    setShowModal(true);
  };
  
  const handleLogoutRequest = () => {
    console.log('handleLogout');
    if(isLoggedIn)
      handleLoginChange(false);
    setShowModal(false);
  };

  const handleLoginChange = (loginStatus) => {
    setIsLoggedIn(loginStatus);
    if(loginStatus != wasLoggedIn) {
      console.log('handleLoginChange: ' + loginStatus);
    }

    // Tell the server to end the session, then refresh the page
    if(loginStatus === false)
      sendLogoutRequest();

    setWasLoggedIn(loginStatus);
  }

  const handleRegister = (token) => {
    if(token)
      console.log(`[TOKEN]: ${token}`);
  }

  const handleVerification = () => {
    console.log("SUCCESS!");
    location.href = clientUrlBase;
  }
 
  return (
    <>      
      <header>
        {/* Navigation Bar */}
        <Navbar className="navbar-header" expand="lg" variant="dark">
          <Container fluid className="w-100">

            {/* Website Logo and Title */}
            <Navbar.Brand className="d-flex align-items-center" href="#">
              <ImageAsset className="asset-main-logo img-website-logo img-show-border" />
              <span className="website-name flex-fill text-center">Game Filter</span>
            </Navbar.Brand>

            {/* Login/Logout Button */}
            <Navbar.Toggle aria-controls="navbar-nav" />
            <Navbar.Collapse id="navbar-nav" className="justify-content-end align-items-center">
              <Nav>
                {isLoggedIn ? (
                  <Nav.Link href="#" className='d-flex flex-row justify-content-center align-items-center' onClick={handleLogoutRequest}>
                    <span className="user-name">Logout</span>
                    <ImageAsset className="asset-user-avatar img-user-avatar img-show-border" />
                  </Nav.Link>
                ) : (
                  <Nav.Link href="#" className='d-flex flex-row justify-content-center align-items-center' onClick={handleLoginRequest}>
                    <span className="discord-name">Login / Register</span>
                    <ImageAsset className="asset-discord-logo img-discord-logo img-show-border" />
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>

          </Container>
        </Navbar>
        <LoginOrRegisterModal shown={showModal} onShowModal={setShowModal} onHandleLogin={handleLoginChange} onHandleRegister={handleRegister} />
        {verification && <VerifyAccountModal token={verification} onAccountVerified={handleVerification}/>}
      </header>

      {/* Main Content */}
      <main id="main-content" name="main-content" className="main-content min-vw-100 flex-grow-1 d-flex flex-column justify-content-center align-items-center">
        {/* Background Logo */}
        <ImageAsset className="asset-main-logo img-main-logo img-vh-100 img-vw-100"/>

        {/* Main Body */}
        <h1 className="text-center main-content-large-text">Welcome to Game Filter!</h1>
        <p className="text-center main-content-small-text">
          Currently under maintenance. We are working hard to get things up and running, so stay tuned!
        </p>
      </main>

      <Footer buildId={buildId} commitId={commitId}></Footer>
    </>
  );
}

export default Home;