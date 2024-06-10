import React, { useState, createContext } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Formulario.css';

export const UserContext = createContext();

const Formulario = () => {
  const [username, setUsername] = useState('');
  const handleInputChange = (event) => {
    setUsername(event.target.value);
  };

  return (
    <UserContext.Provider value={{ username, setUsername }}>
      <div className="container">
        <h1>Ingresa tu @ de Insta</h1>
        <form>
          <input
            type="text"
            placeholder="@monke"
            value={username}
            onChange={handleInputChange}
          />
          <Link to={{ pathname: "/game", search: `?username=${username}` }}>
            <button type="submit">Jugar Chimp Runner</button>
          </Link>
        </form>
        <div className="instructions">
          <h2>Instrucciones:</h2>
          <ul>
            <li>Toca la parte blanca de la pantalla para saltar</li>
            <li>Entre más lejos llegues, tendrás un mejor puntaje</li>
            <li>Logra el mejor puntaje semanal para reclamar tu premio</li>
            <li>Buena suerte! Recuerda poner tu usuario de Instagram sin errores.</li>
          </ul>
        </div>
      </div>
    </UserContext.Provider>
  );
}

export default Formulario;
