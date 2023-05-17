import React, { useState, useEffect } from 'react';
import { Button, Container } from 'react-bootstrap';
import backgroundImage from '../../../assets/404.png';
import ImageAsset from 'components/ImageAsset';
import { useSpring, animated } from 'react-spring';
import './NotFound.css'

const calculateBrightness = () => {
  const date = new Date((new Date()).getTime() + hoursToAddOrSubtract * 60 * 60 * 1000);
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const totalSeconds = (hour * 3600) + (minute * 60) + second;
  const maxSeconds = 24 * 3600; // 24 hours in seconds

  // Calculate the brightness multiplier based on the time of day
  let brightnessMultiplier = (hour >= 21 && hour < 3) ? 0.5 : 1;

  // Calculate the brightness value based on the time of day and brightness multiplier
  const brightness = Math.abs(totalSeconds - (maxSeconds / 2)) / (maxSeconds / 2) * brightnessMultiplier;
  return { date: date, brightness: Math.min(Math.max(brightness, minBrightness), maxBrightness) };
}

const hoursToAddOrSubtract = 0;
const minBrightness = 0.0
const maxBrightness = 1.0
const initialBrightness = calculateBrightness().brightness;
const ufoImageSize = 90

export default function NotFound() {
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [brightness, setBrightness] = useState(initialBrightness);
  const [ufoSpeed, setUfoSpeed] = useState(8000);
  const [ufoPosition, setUfoPosition] = useState({ x: window.innerWidth + ufoImageSize, y: ufoImageSize });
  const [pageOpacity, setPageOpacity] = useState(100);
  const [beamSize, setBeamSize] = useState({ width: "10%", height: "0%" });
  const [beamPosition, setBeamPosition] = useState({ x: window.innerWidth / 2, y: 0 });
  const beamSpeed = 1200;

  const ufoProps = useSpring(
    {
      zIndex: 100,
      position: 'absolute',
      top: ufoPosition.y,
      left: ufoPosition.x,
      pointerEvents: 'none',
      config: {
        duration: ufoSpeed
      }
    }
  );

  const beamProps = useSpring({
    zIndex: 99,
    position: 'absolute',
    top: beamPosition.y,
    left: beamPosition.x,
    width: beamSize.width,
    height: beamSize.height,
    pointerEvents: 'none',
    background: 'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.5) 50%, rgba(0, 0, 0, 0) 100%)',
    opacity: `${pageOpacity}%`,
    transform: 'translate(-50%, 0%)',
    config: {
      duration: beamSpeed
    }
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      let cb = calculateBrightness();
      setBrightness(cb.brightness);
      const now = new Date();
      const isMidnight = now.getHours() === 0 && now.getMinutes() <= 2;
      setIsButtonActive(isMidnight);
    }, 1000);

    // Hide the button after two minutes
    setTimeout(() => {
      setIsButtonActive(false);
    }, 2 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const beginUfoAnimation = () => {
    setBeamSize({ width: "0%", height: "0%" });
    setBeamPosition({ x: window.innerWidth / 2, y: 0 });
    flyUfo();
    setTimeout(_ => {
      setBeamSize({ width: "10%", height: "100%" });
      setTimeout(_ => {
        setPageOpacity(0);
      }, 3000);
    }, 10000);
  }
  
  const flyUfo = () => {
    setUfoPosition({ x: window.innerWidth / 2 - 50, y: ufoImageSize });
    setTimeout(_ => {
      setUfoSpeed(2000);
      setUfoPosition({ x: -ufoImageSize, y: ufoImageSize });
    }, 14500);
  };

  const rootContainerStyle = {
    minWidth: '100vw',
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    userSelect: 'none'
  };
  
  const mainContainerStyle = {
    minWidth: '100vw',
    backgroundImage: `url(${backgroundImage})`,
    backgroundPosition: "center",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    fontFamily: "'Bruno Ace SC', cursive",
    textShadow: "1px 3px 4px #0e92c2, 0 0 1em #5865F2, 0 0 0.2em rgba(88, 101, 242, 0.588)",
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    opacity: `${pageOpacity}%`,
    transition: 'opacity 2.5s ease-in-out'
  };

  const gradientColor = `radial-gradient(ellipse at center, rgba(${brightness * 255}, ${brightness * 255}, ${brightness * 255}, 0) 0%, rgba(${(1 - brightness) * 255}, ${(1 - brightness) * 255}, ${(1 - brightness) * 255}, ${brightness}) 95%)`;

  const innerContainerStyle = {
    minWidth: '100vw',
    background: gradientColor,
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,
    opacity: `${pageOpacity}%`,
    transition: 'opacity 5s ease-in-out'
  };

  const innermostContainerStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 10000,
    opacity: `${pageOpacity}%`,
    transition: 'opacity 1.5s ease-in-out'
  };

  return (
    <Container className="d-flex align-items-center justify-content-center m-0 p-0" style={rootContainerStyle}>
      <animated.img src="/src/assets/ufo.gif" style={ufoProps}/>
      <animated.div style={beamProps} />

      <Container className="d-flex align-items-center justify-content-center m-0 p-0" style={mainContainerStyle}>
        <Container className="m-0 p-0" style={innerContainerStyle}>
          <Container className="text-center p-0" style={innermostContainerStyle}>
            <h1 className="display-1" style={{color: 'red', textShadow: "2px 3px 4px #0e92c2, 0 0 1em #FF65F2, 0 0 0.2em rgba(88, 60, 60, 0.588)"}}>404</h1>
            <hr/>
            <h2 className="display-4">Oops! Page not found</h2>
            <hr/>
            <p className="lead">The page you are looking for might have been removed or is<br/>temporarily unavailable or was probably eaten by a dog.</p>
            {!isButtonActive &&
              <div style={{fontFamily: 'Times New Roman', fontSize: "8pt"}}><p>All your page are belong to us: {(brightness * 100).toFixed(2)}%</p></div>
            }
            {isButtonActive &&
              <Button variant="primary" onClick={beginUfoAnimation} disabled={!isButtonActive}>
                All your page are belong to us
              </Button>
            }
          </Container>
          <div className="tumbleweed">
            <ImageAsset className="asset-tumbleweed" />
          </div>
        </Container>
      </Container>
      <div className='text-center' style={{opacity: 1 - pageOpacity}}>
        <h4 style={{fontSize: '22px', margin: 0, padding: 0}}>40404</h4><hr style={{margin: 0, padding: '0.1rem'}}/>
        <p className='lead' style={{fontSize: '12px', margin: 0, padding: 0}}>The 404 page not found</p>
      </div>
    </Container>
  );
};