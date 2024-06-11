import React, { useEffect, useState } from 'react';
import { getFirestore, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import '../Styles/leaderBoard.css';

function LeaderBoard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const db = getFirestore();
        const scoresCollection = collection(db, 'Usuarios');
        const leaderboardQuery = query(scoresCollection, orderBy('score', 'desc'), limit(5));
        const snapshot = await getDocs(leaderboardQuery);

        const leaderboardData = snapshot.docs.map(doc => ({
          id: doc.id,
          username: doc.data().username,
          score: doc.data().score
        }));

        setLeaderboard(leaderboardData);
      } catch (error) {
        console.error('Error fetching leaderboard:', error);
      }
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diffToMonday = (dayOfWeek === 0 ? 6 : dayOfWeek - 1); // Calculate days to last Monday
      const lastMonday = new Date(now);
      lastMonday.setDate(now.getDate() - diffToMonday);
      lastMonday.setHours(0, 0, 0, 0); // Start of Monday

      const endOfWeek = new Date(lastMonday);
      endOfWeek.setDate(lastMonday.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999); // End of Sunday

      const difference = endOfWeek - now;

      let timeLeft = {};

      if (difference > 0) {
        timeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        };
      }

      return timeLeft;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = time => {
    return `${time.days || 0}d ${time.hours || 0}h ${time.minutes || 0}m ${time.seconds || 0}s`;
  };

  return (
    <div className="leaderboard-container">
      <div className="countdown">
        <h2>Countdown</h2>
        <div>{formatTime(timeLeft)}</div>
      </div>
      <h1>Leaderboard</h1>
      <table>
        <thead>
          <tr>
            <th>Posición</th>
            <th>Usuario</th>
            <th>Puntaje</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.id}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderBoard;
