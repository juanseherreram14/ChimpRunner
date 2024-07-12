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
  const [obstacleSpeed, setObstacleSpeed] = useState(1); // Inicializamos con 1 segundo
  const [isGameOver, setIsGameOver] = useState(false);
  const [obstacleAnimationStarted, setObstacleAnimationStarted] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [currentObstacleType, setCurrentObstacleType] = useState('cactus'); // Tipo de obstáculo actual
  const consecutiveFlyingObstacles = useRef(0); // Contador de obstáculos voladores consecutivos
  const lastObstacleType = useRef(''); // Último tipo de obstáculo generado

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
      if (!dinoRef.current || !obstacleRef.current) return;

      const dinoTop = parseInt(getComputedStyle(dinoRef.current).getPropertyValue('top'));
      const obstacleLeft = parseInt(getComputedStyle(obstacleRef.current).getPropertyValue('left'));
      const obstacleTop = currentObstacleType === 'flying' ? 60 : 150; // Altura ajustada para obstáculos voladores (ligeramente más alto)

      const dinoHeight = 50; // Altura del dinosaurio
      const obstacleHeight = 40; // Altura del obstáculo
      const dinoBottom = dinoTop + dinoHeight;
      const obstacleBottom = obstacleTop + obstacleHeight;

      // Detección de colisiones
      if (obstacleLeft < 40 && obstacleLeft > 0) {
        if ((dinoBottom >= obstacleTop && dinoTop <= obstacleBottom)) {
          setIsGameOver(true);
          clearInterval(isAlive);
        }
      } else if (!isGameOver) { // Asegurarse de que el puntaje solo se incrementa si el juego no ha terminado
        setScore((prevScore) => prevScore + 1);
      }
    }, 50); // Ajustar el intervalo para una detección más frecuente

    return () => {
      clearInterval(isAlive);
    };
  }, [isJumping, currentObstacleType, isGameOver]);
  useEffect(() => {
    let obstacleInterval;
  
    if (!isGameOver && obstacleAnimationStarted) {
      obstacleInterval = setInterval(() => {
        if (obstacleRef.current) {
          const obstacleLeft = parseInt(getComputedStyle(obstacleRef.current).getPropertyValue('left'));
  
          // Generar un nuevo obstáculo solo si el obstáculo anterior ha salido completamente de la pantalla
          if (obstacleLeft <= 0) {
            obstacleRef.current.classList.remove('flying', 'cactus'); // Remover clases existentes
  
            let newObstacleType;
  
            // Verificar y limitar los obstáculos voladores consecutivos
            if (consecutiveFlyingObstacles.current >= 2) {
              newObstacleType = 'cactus';
              consecutiveFlyingObstacles.current = 0; // Resetear el contador
            } else if (lastObstacleType.current === 'flying') {
              newObstacleType = 'cactus';
              consecutiveFlyingObstacles.current = 0;
            } else {
              // Generar aleatoriamente el tipo de obstáculo
              const isFlying = Math.random() < 0.5;
              newObstacleType = isFlying ? 'flying' : 'cactus';
              if (isFlying) {
                consecutiveFlyingObstacles.current += 1;
              } else {
                consecutiveFlyingObstacles.current = 0;
              }
            }
  
            setCurrentObstacleType(newObstacleType);
            lastObstacleType.current = newObstacleType;
  
            // Asignar la clase al obstáculo actual
            obstacleRef.current.classList.add(newObstacleType);
          }
        }
      }, 2000); // Ajusta el intervalo según sea necesario
    }
  
    return () => {
      clearInterval(obstacleInterval);
    };
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
    if (isGameOver) {
      console.log("Game Over");
      if (obstacleRef.current) {
        obstacleRef.current.style.animation = 'none';
      }
    }
  }, [isGameOver]);

  useEffect(() => {
    if (isGameOver && db && username && score) {
      saveScoreToFirestore(db, username, score);
    }
  }, [isGameOver, db, username, score]);

  // Incrementar la velocidad de los obstáculos basado en el puntaje
  useEffect(() => {
    if (!isGameOver) {
      const newSpeed = 1 - Math.min(score / 2000, 0.8); // Incrementa la velocidad con el puntaje de manera más gradual
      setObstacleSpeed(newSpeed);
    }
  }, [score, isGameOver]);

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
          className={currentObstacleType}
          style={{ 
            animation: obstacleAnimationStarted ? `block ${obstacleSpeed}s infinite linear` : 'none' 
          }}
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