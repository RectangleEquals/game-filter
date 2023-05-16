import { useState } from "react";
import { Button, Navbar, Nav, Container } from "react-bootstrap";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import '../Home/Home.css';

function Footer({ buildId, commitId }) {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    setVisible(!visible);
  };

  return (
    <footer>
      <Button
        className="navbar-toggler"
        type="button"
        aria-expanded={visible}
        onClick={toggleVisible}
        style={{
          display: "block",
          position: "fixed",
          top: "auto",
          bottom: visible ? "2vw" : "0",
          right: "4px",
          zIndex: "999 !important",
          background: "linear-gradient(to bottom right, #0e92c2 0%, #20f6faaa 10%, #20f6faaa 25%, #5865F2 50%, #5865F2 100%)",
          padding: "0.25rem",
          borderRadius: "0.25rem 0.25rem 0 0",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.5)",
          transition: "opacity 0.2s ease-in-out, bottom 0.2s ease-in-out",
          opacity: visible ? 0.3333 : 0.85
        }}
      >
        {visible ? <IoIosArrowDown size="2em" /> : <IoIosArrowUp size="2em" />}
      </Button>
      <Navbar
      className="navbar-footer"
        bg="light"
        expand="lg"
        variant="dark"
        fixed="bottom"
        style={{
          height: visible ? "2vw" : "0px",
          overflow: "hidden",
          transition: "opacity 0.2s ease-in-out, height 0.2s ease-in-out",
          opacity: !visible ? 0.1 : 0.85
        }}
      >
        <Container fluid className="w-100 d-flex justify-content-between">
          <Nav>
            <Nav.Link
              style={{
                color: "#ffffff",
                fontFamily: "'Bruno Ace SC', cursive",
                textShadow: "1px 3px 4px #0e92c2, 0 0 1em #5865F2, 0 0 0.2em rgba(88, 101, 242, 0.588)",
              }}
            >
              ©2023 Electric Ocean Games
            </Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link
              style={{
                color: "#ffffff",
                fontFamily: "'Bruno Ace SC', cursive",
                textShadow: "1px 3px 4px #0e92c2, 0 0 1em #5865F2, 0 0 0.2em rgba(88, 101, 242, 0.588)",
              }}
            >
              {`Version: ${buildId} ${commitId}`}
            </Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    </footer>
  );
}

export default Footer;
