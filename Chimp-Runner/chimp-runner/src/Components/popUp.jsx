import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/popUp.css';

const Popup = ({ username, score }) => {
  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Game Over! {username}, tu puntaje es: {score}</h2>
        <div className="popup-buttons">
          <button onClick={() => window.location.reload()}>Volver a Jugar</button>
          <Link to="/leaders"><button>Continuar</button></Link>
        </div>
      </div>
    </div>
  );
};

export default Popup;
