import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/popUp.css';

const Popup = ({ username, score }) => {
  return (
    <div className="popup">
      <div className="popup-inner">
        <h2>Game Over! {username}, tu puntaje es: {score}</h2>
        <div className="popup-buttons">
          <h2 className='volver'> Para Volver a Jugar, recarga la página </h2>
          <Link to="/leaders"><button>Ir al Leaderboard </button></Link>
        </div>
      </div>
    </div>
  );
};

export default Popup;
