import React, { useEffect, useRef, useState, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../Styles/Game.css';
import '../Styles/Dino.css';
import { UserContext } from './Formulario'; 
import Popup from '../Components/popUp';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

function saveScoreToFirestore(db, username, score) {
  addDoc(collection(db, 'Usuarios'), {
    username: username,
    score: score
  })
  .then((docRef) => {
    console.log("Score guardado con ID: ", docRef.id);
  })
  .catch((error) => {
    console.error("Error al guardar el score: ", error);
  });
}

function Dino() {
  const { username: usernameFromContext, db } = useContext(UserContext);
  useEffect(() => {
    console.log('Valor de db:', db);
  }, [db]);
  const [username, setUsername] = useState('');
  const location = useLocation();
  const dinoRef = useRef();
  const obstacleRef = useRef();
  const [score, setScore] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(10);
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacleAnimationStarted, setObstacleAnimationStarted] = useState(false);
  const [isFlying, setIsFlying] = useState(false);
  const obstacleAnimationIntervalRef = useRef(null);
  const [isJumping, setIsJumping] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const usernameFromURL = searchParams.get('username');
    setUsername(usernameFromURL);
  }, [location.search]);

  const jump = () => {
    if (!!dinoRef.current && !isJumping) {
      setIsJumping(true);
      dinoRef.current.classList.add('jump');
      setTimeout(function () {
        dinoRef.current.classList.remove('jump');
        setIsJumping(false); // Una vez que termine el salto, establecer a falso
      }, 300);
    }
  };

  useEffect(() => {
    const isAlive = setInterval(function () {
      const dinoTop = parseInt(getComputedStyle(dinoRef.current).getPropertyValue('top'));
      const obstacleLeft = parseInt(getComputedStyle(obstacleRef.current).getPropertyValue('left'));
      const obstacleTop = isFlying ? 60 : 150;
    
      const dinoHeight = 50; // Altura del dinosaurio
      const obstacleHeight = 40; // Altura del cactus
      const dinoBottom = dinoTop + dinoHeight;
      const obstacleBottom = obstacleTop + obstacleHeight;
    
      if (!isJumping && obstacleLeft < 40 && obstacleLeft > 0 && dinoBottom >= obstacleTop && dinoTop <= obstacleBottom) {
        setIsGameOver(true);
        clearInterval(isAlive);
      } else {
        setScore((prevScore) => {
          if (prevScore >= 1000 && prevScore % 50 === 0) {
            setObstacleSpeed((prevSpeed) => prevSpeed - 1);
          }
          return prevScore + 1;
        });
      }
    }, obstacleSpeed);
    
  
    return () => {
      clearInterval(isAlive);
    };
  }, [obstacleSpeed, isJumping, isFlying]);
  

  useEffect(() => {
    if (!isGameOver && obstacleAnimationStarted) {
      const obstacleAnimationInterval = setInterval(() => {
        setIsFlying(Math.random() < 0.5); // 50% de probabilidad de ser volador
      }, 2000); // Cambiar cada 2 segundos
  
      return () => {
        clearInterval(obstacleAnimationInterval);
      };
    }
  }, [isGameOver, obstacleAnimationStarted]);

  useEffect(() => {
    setTimeout(() => {
      setObstacleAnimationStarted(true);
    }, 2000);
  }, []);

  useEffect(() => {
    const handleJump = () => {
      if (!isGameOver) jump();
    };
  
    const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);
  
    if (isMobileDevice) {
      document.addEventListener('touchstart', handleJump);
    } else {
      document.addEventListener('keydown', (event) => {
        if (event.keyCode === 32) {
          handleJump();
        }
      });
    }
  
    return () => {
      document.removeEventListener('touchstart', handleJump);
      document.removeEventListener('keydown', handleJump);
    };
  }, [isGameOver]);
  

  useEffect(() => {
    if (isGameOver && db && username && score) {
      saveScoreToFirestore(db, username, score);
    }
  }, [isGameOver, db, username, score]);

  return (
    <div className="container">

      <h1 className="title">Chimp Runner</h1>
      <h2 className="welcome-message">Bienvenido {usernameFromContext || username} </h2>
      <div className="game">
        Score : {score}
        <div id="dino" ref={dinoRef}></div>
        <div
          id="obstacle"
          ref={obstacleRef}
          className={isFlying ? 'flying' : 'cactus'}
          style={{ animation: obstacleAnimationStarted ? 'block 1s infinite linear' : 'none' }}
        ></div>
      </div>
      {isGameOver && <Popup username={usernameFromContext || username} score={score} />}
      <Link to="/leaders">
        <button className="play-button">Ir a LeaderBoard</button>
      </Link>
     
    </div>
  );
}

export default Dino;
