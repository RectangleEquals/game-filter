import { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import resolveUrl from "utils/resolveUrl";
import getExternalIP from "utils/getExternalIP";
import { Container, Alert } from "react-bootstrap";

const apiUrlBase = import.meta.env.VITE_API_BASEPATH || "http://localhost/api";
const apiUrlAuth = resolveUrl(apiUrlBase, 'auth');

const LoginModal = ({ shown, setShowModal, setLoginStatus }) =>
{
  const [provider, setProvider] = useState('');
  const [loginController, setLoginController] = useState(new AbortController());
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({variant: 'info', title: 'Please choose a login provider:'});

  useEffect(() =>
  {
    (async() => {
      // Ignore scenarios where we aren't currently attempting to log in
      if(!isLoggingIn || provider.length < 1)
        return;

      // Get the current IP of the client
      const externalIP = await getExternalIP();
      if(externalIP === '') {
        console.error('Failed to get external IP!');
        return;
      }

      // Make an API call to the backend server to initiate the social login flow
      const queryParams = {
        provider: provider,
        from: externalIP
      };
      const queryString = Object.keys(queryParams)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
        .join('&');
      const authUrl = `${apiUrlAuth}?${queryString}`;

      await fetch(authUrl, {signal: loginController.signal})
        .then(response => handleResponse(response))
        .catch(err => {
          setIsLoggingIn(false);
          setAlertMessage({variant: 'danger', title: `Error (${authUrl})`, message: err.message})
          setTimeout(() => setShown(false), 2000);
        });
    })();
  }, [isLoggingIn]);

  useEffect(() => {
    if(isLoading) {
      setAlertMessage({
        variant: 'info',
        title: alertMessage.title,
        message: 'Please wait...'
      })
    }
  }, [isLoading])

  const abortRequest = () => {
    loginController.abort('User-initiated login cancellation');
    setLoginController(new AbortController());
  }

  const handleClose = () => {
    if (isLoggingIn)
      abortRequest();
    setShown(false);
  }

  const handleResponse = async(response) => {
    const data = await response.json();

    // Simulate a delayed request
    /*
    if(provider === 'discord') {
      console.log("Waiting for 4 seconds...");
      await new Promise(resolve => setTimeout(resolve, 4000));
      console.log("Done waiting!");
    }
    */

    // Validate that we are still attempting to log in, and that all response data is valid
    if(isLoggingIn && data && data.message) {
      // Update login status, then close the dialog
      const loginStatus = data.message === 'ok';
      setLoginStatus(loginStatus);
      setIsLoggingIn(false);
      if(loginStatus)
        handleClose();
      else {
        setAlertMessage({variant: 'warning', title: 'Login Failed', message: `Server response: ${data.message}`})
        setTimeout(() => setShown(true), 2000);
      }
    }
  }

  const handleLogin = async (requestedProvider) =>
  {
    // Make sure we set the loading state and log out the current user before making a login request
    setIsLoading(true);
    setProvider(requestedProvider);
    setLoginStatus(false);
    setIsLoggingIn(true);
  };

  const setShown = (shown) => {
    setAlertMessage({variant: 'info', title: 'Please choose a login provider:', message: ''});
    setShowModal(shown);
    setIsLoading(false);
  }

  return (
    <Modal show={shown} onHide={handleClose} centered>
      <Modal.Header>
        <Modal.Title>Login</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Container>
          <Alert variant={alertMessage.variant}>
            <Alert.Heading>{alertMessage.title}</Alert.Heading>
            {alertMessage.message}
          </Alert>
        </Container>
      </Modal.Body>
      <Modal.Footer>
        <Container className="d-flex flex-column align-items-center">
          <Button
            className="flex-grow-1 w-100 mb-1"
            variant="primary"
            disabled={isLoading}
            onClick={() => handleLogin("discord")}>
            Discord
          </Button>
          <Button
            className="flex-grow-1 w-100 mb-1"
            variant="secondary"
            disabled={isLoading}
            onClick={() => handleLogin("steam")}> 
            Steam
          </Button>
          <Button
            className="flex-grow-1 w-100 mb-1"
            variant="success"
            disabled={isLoading}
            onClick={() => handleLogin("microsoft")}> 
            Microsoft
          </Button>
          <Button
            className="flex-grow-1 w-100"
            variant="danger"
            disabled={isLoading}
            onClick={() => handleLogin("epic")}> 
            Epic Games
          </Button>
          <hr></hr>
        </Container>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;