import React, { useEffect, useRef, useState, useContext } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../Styles/Game.css';
import '../Styles/Dino.css';
import { UserContext } from './Formulario'; 
import Popup from '../Components/popUp';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

function saveScoreToFirestore(db, username, score) {
  // Utiliza las funciones de Firestore para guardar el score
  addDoc(collection(db, 'Usuarios'), {
    username: username, // Pass the username parameter
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
  const cactusRef = useRef();
  const [score, setScore] = useState(0);
  const [obstacleSpeed, setObstacleSpeed] = useState(10);
  const speedIncrement = 5000;
  const [isGameOver, setIsGameOver] = useState(false);
  const cactusAnimationIntervalRef = useRef(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const usernameFromURL = searchParams.get('username');
    setUsername(usernameFromURL);
  }, [location.search]);

  
  // Función para hacer saltar al dinosaurio
  const jump = () => {
    if (!!dinoRef.current && dinoRef.current.classList !== 'jump') {
      dinoRef.current.classList.add('jump');
      setTimeout(function () {
        dinoRef.current.classList.remove('jump');
      }, 300);
    }
  };

 

  useEffect(() => {
    const isAlive = setInterval(function () {
      // Obtener la posición Y actual del dinosaurio
      const dinoTop = parseInt(
        getComputedStyle(dinoRef.current).getPropertyValue('top')
      );
  
      // Obtener la posición X actual del cactus
      let cactusLeft = parseInt(
        getComputedStyle(cactusRef.current).getPropertyValue('left')
      );
  
      // Detectar colisión con cactus
      if (cactusLeft < 40 && cactusLeft > 0 && dinoTop >= 140) {
        // Colisión
        setIsGameOver(true); // Cambiar el estado a true para mostrar el Popup
        clearInterval(isAlive); // Detener el intervalo
      } else {
        setScore((prevScore) => {
          // Aumentar la velocidad de los obstáculos cada 50 puntos
          if (prevScore >= 1000 && prevScore % 50 === 0) {
            setObstacleSpeed((prevSpeed) => prevSpeed - speedIncrement);
          }
          return prevScore + 1;
        });
      }
    }, obstacleSpeed);
  
    // Limpieza del intervalo al desmontar el componente
    return () => {
      clearInterval(isAlive);
    };
  }, [obstacleSpeed]); // Solo depende de obstacleSpeed
  
  // useEffect para la animación de los cactus
  useEffect(() => {
    // Iniciar la animación solo si el juego no ha terminado
    if (!isGameOver) {
      const cactusAnimationInterval = setInterval(() => {
        // Aquí va la lógica para animar los cactus
        // Por ejemplo, mover los cactus a la izquierda
      }, 100); // Ajusta el intervalo según tu animación
  
      // Limpieza del intervalo al desmontar el componente o al finalizar el juego
      return () => {
        clearInterval(cactusAnimationInterval);
      };
    }
  }, [isGameOver]); // Dependencia solo para iniciar la animación y limpiar el intervalo al finalizar el juego
  
  useEffect(() => {
    // Iniciar la animación solo si el juego no ha terminado
    if (!isGameOver) {
      const cactusAnimationInterval = setInterval(() => {
        // Aquí va la lógica para animar los cactus
        // Por ejemplo, mover los cactus a la izquierda
      }, 100); // Ajusta el intervalo según tu animación
  
      // Guardar la referencia del intervalo para poder limpiarlo más tarde
      cactusAnimationIntervalRef.current = cactusAnimationInterval;
    }
  
    // Limpieza del intervalo al finalizar el juego
    return () => {
      clearInterval(cactusAnimationIntervalRef.current);
    };
  }, [isGameOver]); // Dependencia para iniciar la animación y limpiar el intervalo al finalizar el juego
  

  // useEffect para agregar el evento de salto dependiendo del tipo de dispositivo
  useEffect(() => {
    const handleJump = () => {
      jump();
    };

    // Detectar el tipo de dispositivo a través del User-Agent
    const isMobileDevice = /Mobi|Android/i.test(navigator.userAgent);

    // Si es un dispositivo móvil, agregar evento de salto al tocar la pantalla
    if (isMobileDevice) {
      document.addEventListener('touchstart', handleJump);
    } else {
      // Si es una computadora, agregar evento de salto con la barra espaciadora
      document.addEventListener('keydown', (event) => {
        if (event.keyCode === 32) {
          jump();
        }
      });
    }

    return () => {
      document.removeEventListener('touchstart', handleJump);
      document.removeEventListener('keydown', handleJump);
    };
  }, []);

  useEffect(() => {
    if (isGameOver && db && username!=null && score) {
      saveScoreToFirestore(db, username, score); // Pass the username
    }
  }, [isGameOver, db, username, score]);
  
  
  
  return (
    <div className="container">
      <div className="ad top">Anuncio Superior</div>
      <h1 className="title">Chimp Runner</h1>
      <h2 className="welcome-message">Bienvenido {usernameFromContext || username} </h2> {/* Mensaje de bienvenida */}
      <div className="game">
        Score : {score}
        <div id="dino" ref={dinoRef}></div>
        <div id="cactus" ref={cactusRef}></div>
      </div>
      {isGameOver && <Popup username={usernameFromContext || username} score={score} />}
 {/* Renderizar el Popup si el juego ha terminado */}
      <Link to="/leaders">
        <button className="play-button">Ir a LeaderBoard</button>
      </Link>
      <div className="ad bottom">Anuncio Inferior</div>
    </div>
  );
  
}

export default Dino;
