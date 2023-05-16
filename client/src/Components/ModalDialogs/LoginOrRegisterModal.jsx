import { useState, useRef } from 'react';
import { Modal, Form, Button, Tab, Tabs, Alert } from 'react-bootstrap';
import resolveUrl from "utils/resolveUrl";
import DOMPurify from 'dompurify';
import './LoginOrRegisterModal.css';

const apiUrlBase = import.meta.env.VITE_API_AUTHPATH || "http://localhost/api/auth";
const apiUrlLogin = resolveUrl(apiUrlBase, 'login');
const apiUrlRegister = resolveUrl(apiUrlBase, 'register');
const sessionName = import.meta.env.SESSION_COOKIE_NAME || "__gfsid";

export default function LoginOrRegisterModal({ shown, onShowModal, onHandleLogin, onHandleRegistration }) {
  const [title, setTitle] = useState('Login');
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [alertMessage, setAlertMessage] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const formRef = useRef();
  
  const handleClose = () => {
    if(isLoading)
      return;
    onShowModal(false);
    setTimeout(() => setAlertMessage({}), 200);
  }

  const handleLogin = (e) => {
    e.preventDefault();
    if(isLoggingIn)
      return;
    
    setIsLoading(true);
    setIsLoggingIn(true);
    setAlertMessage({variant: "info", message: "Logging in..."});
    
    const data = new FormData(formRef.current);
    fetch(apiUrlLogin, {
      method: 'POST',
      body: data,
      mode: 'cors'
    })
    .then(response => handleLoginResponse(response))
    .catch(err => {
      setAlertMessage({variant: 'danger', title: `Error (${apiUrlLogin})`, message: err.message})
      setIsLoading(false);
      setIsLoggingIn(false);
    });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if(isRegistering)
      return;
    
    setIsLoading(true);
    setIsRegistering(true);
    setAlertMessage({variant: "info", message: "Registering..."});
    
    const data = new FormData(formRef.current);
    fetch(apiUrlRegister, {
      method: 'POST',
      body: data,
      mode: 'cors'
    })
    .then(response => handleRegisterResponse(response))
    .catch(err => {
      setAlertMessage({variant: 'danger', title: `Error (${apiUrlRegister})`, message: err.message})
      setIsRegistering(false);
      setIsLoading(false);
    });
  };

  const handleLoginResponse = (response) =>
  {
    setIsLoading(false);
    setIsRegistering(false);
    setIsLoggingIn(false);

    if (response.ok) {
      response.json().then(data => {
        sessionStorage.setItem(sessionName, data.accessToken);
        setLoginEmail("");
        setLoginPassword("");
        setAlertMessage({variant: 'info', title: '', message: ''});
        onShowModal(false);
        onHandleLogin(true);
      });
    } else {
      response.text().then(text => {
        setAlertMessage({
          variant: "danger",
          title: "Error",
          message: `${text}`,
        });
      }).catch(err => {
        setAlertMessage({ variant: "danger", title: "Error", message: `Error: ${err.message}`});
        setIsRegistering(false);
      })
    }
  }

  const handleRegisterResponse = (response) =>
  {
    setIsLoading(false);

    if (response.ok) {
      response.json().then(data => {
        setLoginEmail("");
        setLoginPassword("");
        setAlertMessage({variant: 'success', title: 'Account Verification', message: 'Please verify your account by visiting your registered email address and clicking the provided link'});
        setIsRegistering(false);
        if(onHandleRegistration)
          onHandleRegistration(data.token);
      });
    } else {
      if(response.status === 418) {
        response.text().then(text => {
          if(text === 'verified') {
            setAlertMessage({variant: 'warning', title: 'Account Verification', message: 'That account has already been registered'});
          } else if(text === 'pending') {
            setAlertMessage({variant: 'warning', title: 'Account Verification', message: 'That account is still pending verification<br/>Try checking the spam folders in your email'});
          } else {
            setAlertMessage({
              variant: "danger",
              title: text === 'invalid_name' || text === 'invalid_email' ? "Invalid" : "Unallowed",
              message: text === 'invalid_name' ?
                "DisplayNames can only contain letters, numbers, and single underscores" :
                text === 'invalid_email' ?
                "Please enter a valid email address" :
                "DisplayNames cannot contain any profane, obscene or overly offensive material"
            });
          }
          setIsRegistering(false);
        }).catch(err => {
          setAlertMessage({ variant: "danger", title: "Error", message: `Error: ${err.message}`});
          setIsRegistering(false);
        })
      } else {
        setAlertMessage({ variant: "danger", title: "Error", message: `Error: ${response.status} ${response.statusText}` });
        setIsRegistering(false);
      }
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setAlertMessage({});
    if (tab === 'login') {
      setTitle('Login');
    } else if (tab === 'register') {
      setTitle('Register');
    }
  };

  const tabStyle = {
    pointerEvents: isLoading ? "none" : "auto",
    opacity: isLoading ? "0.5" : "1"
  };

  return (
    <Modal className="login-register-modal" show={shown} onHide={handleClose} centered>
      <Modal.Header className="login-register-modal-header" closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="login-register-modal-body">
        <Tabs activeKey={activeTab} onSelect={handleTabChange} variant="tabs">
          <Tab
            eventKey="login"
            title="Login"
            disabled={isLoading}
            className="login-tab"
            style={tabStyle} >
            <Tab.Content className="login-tab-content">
              <Form ref={activeTab == "login" ? formRef : null} onSubmit={handleLogin}>
                <Form.Group controlId="loginFormEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    className="mb-2"
                    placeholder="Enter email"
                    disabled={isLoading}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="loginFormPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    placeholder="Password"
                    disabled={isLoading}
                    value={loginPassword}
                    autoComplete="current-password"
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </Form.Group>

                {alertMessage && alertMessage.variant && alertMessage.message && alertMessage.message.length > 0 &&
                  <Alert className="pt-0 pb-2" variant={alertMessage.variant} style={{marginTop: '20px', marginBottom: '20px', wordWrap: 'break-word'}}>
                    <Alert.Heading>{alertMessage.title}</Alert.Heading>
                    {alertMessage.message}
                  </Alert>
                }
                
                <hr/>
                <Button className="flex-grow-1 w-100 mb-1" variant="light" type="submit" disabled={isLoading}>
                  Login
                </Button>
              </Form>
            </Tab.Content>
          </Tab>
          <Tab
            eventKey="register"
            title="Register"
            disabled={isLoading}
            className="register-tab"
            style={tabStyle} >
            <Tab.Content className="register-tab-content">
              <Form ref={activeTab == "register" ? formRef : null} onSubmit={handleRegister}>
                <Form.Group controlId="registerFormDisplayName">
                  <Form.Label>Display Name</Form.Label>
                  <Form.Control
                    name="displayName"
                    type="text"
                    className="mb-2"
                    placeholder="Enter display name"
                    disabled={isLoading}
                    value={registerDisplayName}
                    onChange={(e) => setRegisterDisplayName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="registerFormEmail">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    name="email"
                    type="email"
                    className="mb-2"
                    placeholder="Enter email"
                    disabled={isLoading}
                    value={registerEmail}
                    autoComplete="email"
                    onChange={(e) => setRegisterEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="registerFormPassword">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    name="password"
                    type="password"
                    className="mb-2"
                    placeholder="Password"
                    disabled={isLoading}
                    value={registerPassword}
                    autoComplete="current-password"
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </Form.Group>

                {alertMessage && alertMessage.variant && alertMessage.message && alertMessage.message.length > 0 &&
                  <Alert className="pt-0 pb-2" variant={alertMessage.variant} style={{marginTop: '20px', marginBottom: '20px', wordWrap: 'break-word'}}>
                    <Alert.Heading>{alertMessage.title}</Alert.Heading>
                    <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(alertMessage.message) }} />
                 </Alert>
                }

                <hr/>
                <Button className="flex-grow-1 w-100 mb-1" variant="light" type="submit" disabled={isLoading}>
                  Register
                </Button>
              </Form>
            </Tab.Content>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
}