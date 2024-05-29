import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Formulario from './Pages/Formulario'; // Importa UserContext desde Formulario
import LeaderBoard from './Pages/leaderBoard';
import Dino from './Pages/Dino';
import { UserContext } from './Pages/Formulario'; 
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'; // Importar getFirestore

function App() {
  const [db, setDb] = useState(null); // Estado para la instancia de Firestore

  // Inicializa Firebase al cargar la aplicación
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyBiHoE9hoo29nw3xXs_lWDYsTZ9z-i2wE0",
      authDomain: "chimp-runner.firebaseapp.com",
      projectId: "chimp-runner",
      storageBucket: "chimp-runner.appspot.com",
      messagingSenderId: "712162433195",
      appId: "1:712162433195:web:e8d1466d40865321083fee",
      measurementId: "G-NNLN76YVNE"
    };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const firestore = getFirestore(app); // Crear instancia de Firestore
    setDb(firestore); // Guardar la instancia en el estado

    // Cleanup function
    return () => {
      // Aquí puedes realizar cualquier limpieza necesaria cuando el componente se desmonta
    };
  }, []); // El segundo argumento [] indica que este efecto solo se ejecutará una vez, similar a componentDidMount
  
  return (
    <Router>
      <UserContext.Provider value={{ username: '', setUsername: () => {}, db }}> {/* Proporciona la instancia de Firestore como parte del contexto */}
        <Routes>
          <Route path="/" element={<Formulario />} />
          <Route path="/leaders" element={<LeaderBoard />} />
          <Route path="/game" element={<Dino />} />
        </Routes>
      </UserContext.Provider>
    </Router>
  );
}

export default App;
