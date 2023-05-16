import React, { useState, useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import resolveUrl from "utils/resolveUrl";
import DOMPurify from 'dompurify';
import './VerifyAccountModal.css';

const apiUrlBase = import.meta.env.VITE_API_AUTHPATH || "http://localhost/api/auth";
const apiUrlVerify = resolveUrl(apiUrlBase, 'verify');

function VerifyAccountModal({ token, onAccountVerified })
{
  const [show, setShown] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [alertMessage, setAlertMessage] = useState({ variant: 'warning', title: 'Verifying Account', message: 'Please Wait...' });

  useEffect(_ => {
    verifyAccount();
  }, []);

  const handleClose = () => {
    setShown(false);
    if(isVerified && onAccountVerified)
      onAccountVerified(token);
  };

  const verifyAccount = async() => {
    setAlertMessage({ variant: 'warning', title: 'Verifying Account', message: 'Please Wait...' });
    const url = resolveUrl(apiUrlVerify, token);
    await fetch(url, {
      method: 'GET',
      mode: 'cors'
    }).then(async response => {
      if(response.ok) {
        setAlertMessage({ variant: 'success', title: 'Success', message: "You're all set!<br/>Feel free to login" });
        setIsVerified(true);
      } else {
        const status = response.status;
        const result = await response.text();
        switch(status) {
          case 400:
            if(result === 'verified') {
              setAlertMessage({ variant: 'warning', title: 'Oops!', message: `Your account has already been verified!<br/>Feel free to login` });
            } else if(result === 'pending') {
              setAlertMessage({ variant: 'warning', title: 'Oops!', message: `Your account is still pending verification!<br/>Try waiting a while before logging in` });
            } else if(result === 'invalid') {
              setAlertMessage({ variant: 'warning', title: 'Oops!', message: `Invalid or expired invitation<br/>Try registering again` });
            } else {
              setAlertMessage({ variant: 'danger', title: 'Oops!', message: `Something went wrong!<br/>Response: ${result}` });
            }
            break;
          default:
            setAlertMessage({ variant: 'danger', title: 'Oops!', message: 'Something went wrong!' });
            break;
        }
      }
      setIsVerifying(false);
    }).catch(err => {
      setAlertMessage({ variant: 'danger', title: 'Error', message: err.message });
      setIsVerifying(false);
    })
  }

  return (
    <Modal className="verify-account-modal" show={show} onHide={handleClose} centered backdrop={isVerifying ? "static" : true} keyboard={!isVerifying}>
      <Modal.Header className="verify-account-modal-header" closeButton={!isVerifying}>
        <Modal.Title>Account Verification</Modal.Title>
      </Modal.Header>
      <Modal.Body className="verify-account-modal-body">
        {alertMessage && alertMessage.variant && alertMessage.message && alertMessage.message.length > 0 &&
          <Alert className="pt-0 pb-2" variant={alertMessage.variant} style={{marginTop: '20px', marginBottom: '20px', wordWrap: 'break-word'}}>
            <Alert.Heading>{alertMessage.title}</Alert.Heading>
            <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(alertMessage.message) }} />
          </Alert>
        }
      </Modal.Body>
        <Modal.Footer style={{display: 'flex', justifyContent: 'space-between', alignContent: 'center', alignItems: 'center'}}>
          { token && <p style={{fontSize: "10pt", alignSelf: "flex-end"}}>Token: {token}</p> }
          <div>
            {alertMessage.variant === 'danger' && (
              <Button variant="success" onClick={verifyAccount} disabled={isVerifying} style={{marginLeft: "4px", marginRight: "4px"}}>
                Try Again
              </Button>
            )}
            <Button variant="secondary" onClick={handleClose} disabled={isVerifying}>
              Close
            </Button>
          </div>
        </Modal.Footer>
    </Modal>
  );
}

export default VerifyAccountModal;