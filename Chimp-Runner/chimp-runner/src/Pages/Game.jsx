import React from 'react';
import '../Styles/Game.css';
import staticGameImage from '../Images/dinoGame.jpg'; // Ruta de tu imagen estática
import { Link } from 'react-router-dom';

const App = () => {
  return (
    <div className="container">
      <div className="ad top">Anuncio Superior</div>
      <h1 className="title">Chimp Runner</h1>
      <div className="game">
        <img src={staticGameImage} alt="Game" className="game-image" />
      </div>
      <Link to="/leaders">
      <button className="play-button">Ir a LeaderBoard</button>
      </Link>
      <div className="ad bottom">Anuncio Inferior</div>
    </div>
  );
}

export default App;
