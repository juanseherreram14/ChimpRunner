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
    <UserContext.Provider value={{ username, setUsername }}> {/* Envuelve todo con el proveedor de contexto */}
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
      </div>
    </UserContext.Provider>
  );
}

export default Formulario;
