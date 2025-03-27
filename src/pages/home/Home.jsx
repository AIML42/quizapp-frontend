import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, joinGame } from '../../api/api';
import './Home.css';

function Home() {
  const [playerName, setPlayerName] = useState('');
  const [category, setCategory] = useState('');
  const [totalPlayers, setTotalPlayers] = useState(2);
  const [gameId, setGameId] = useState('');
  const navigate = useNavigate();

  const handleCreateGame = async () => {
    try {
      const response = await createGame({ playerName, category, totalPlayers });
      const { gameId, playerId } = response.data;
      sessionStorage.setItem('playerId', playerId);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Error creating game:', error);
      alert(error.response?.data?.message || 'Error creating game');
    }
  };

  const handleJoinGame = async () => {
    try {
      const response = await joinGame({ gameId, playerName });
      const { playerId } = response.data;
      sessionStorage.setItem('playerId', playerId);
      navigate(`/game/${gameId}`);
    } catch (error) {
      console.error('Error joining game:', error);
      alert(error.response?.data?.message || 'Error joining game');
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Quiz Game</h1>
      <div className="home-cards">
        <div className="card create-game-card">
          <h2>Create Game</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-field"
          >
            <option value="">Category (optional)</option>
            <option value="League of Legends">League of Legends</option>
            <option value="Computer Science">Computer Science</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
          <input
            type="number"
            placeholder="Total Players"
            value={totalPlayers}
            onChange={(e) => setTotalPlayers(Number(e.target.value))}
            min="2"
            max="5"
            className="input-field"
          />
          <button onClick={handleCreateGame} className="action-button">
            Create Game
          </button>
        </div>
        <div className="card join-game-card">
          <h2>Join Game</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="input-field"
          />
          <input
            type="text"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            className="input-field"
          />
          <button onClick={handleJoinGame} className="action-button">
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;