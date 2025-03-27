import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socket from '../../api/socket';
import './GameRoom.css';

function GameRoom({ match }) {
    const { gameId } = useParams();
    const playerId = sessionStorage.getItem('playerId');
    const navigate = useNavigate();
    const [players, setPlayers] = useState([]);
    const [gameStatus, setGameStatus] = useState('waiting');
    const [currentRound, setCurrentRound] = useState(1);
    const [question, setQuestion] = useState(null);
    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [winner, setWinner] = useState(null);
    const [finalScores, setFinalScores] = useState(null);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [answeredPlayers, setAnsweredPlayers] = useState([]);

    useEffect(() => {
        socket.emit('join-game', { gameId, playerId });

        socket.on('player-joined', (data) => {
            setPlayers(data.players);
        });

        socket.on('game-starting', (data) => {
            let timeLeft = 5;
            setCountdown(timeLeft);
            const countdownInterval = setInterval(() => {
                timeLeft -= 1;
                setCountdown(timeLeft);
                if (timeLeft <= 0) {
                    clearInterval(countdownInterval);
                    setCountdown(null);
                }
            }, 1000);
        });

        socket.on('start-game', (data) => {
            setGameStatus('active');
            setCountdown(null);
        });

        socket.on('new-round', (data) => {
            setCurrentRound(data.round);
            setQuestion(data.question);
            setCorrectAnswer(null);
            setWinner(null);
            setHasAnswered(false);
            setAnsweredPlayers([]);
        });

        socket.on('round-end', (data) => {
            setCorrectAnswer(data.correctAnswer);
            setWinner(data.winner);
            setPlayers(data.players);
            setHasAnswered(true);
            setAnsweredPlayers(data.answeredPlayers);
        });

        socket.on('game-end', (data) => {
            setGameStatus('finished');
            setFinalScores(data.finalScores);
        });

        socket.on('session-deleted', (data) => {
            console.log(data.message);
        });

        socket.on('error', (data) => {
            console.error(data.message);
            alert(data.message);
        });

        return () => {
            socket.off('player-joined');
            socket.off('game-starting');
            socket.off('start-game');
            socket.off('new-round');
            socket.off('round-end');
            socket.off('game-end');
            socket.off('session-deleted');
            socket.off('error');
        };
    }, [gameId, playerId]);

    const handleAnswer = (answer) => {
        if (!hasAnswered) {
            socket.emit('submit-answer', { gameId, playerId, answer });
            setHasAnswered(true);
            setAnsweredPlayers((prev) => [...prev, playerId]);
        }
    };

    const handlePlayAgain = () => {
        sessionStorage.removeItem('playerId');
        navigate('/');
    };

    if (gameStatus === 'finished') {
        return (
            <div className="game-room-container game-over">
                <h1 className="game-over-title">Game Over!</h1>
                <h2 className="section-title">Final Scores</h2>
                <div className="final-scores">
                    {finalScores.map((player) => (
                        <div key={player.playerId} className="score-card">
                            <span>{player.name}</span>
                            <span>{player.score}</span>
                        </div>
                    ))}
                </div>
                <button onClick={handlePlayAgain} className="play-again-button">
                    Play Again
                </button>
            </div>
        );
    }

    return (
        <div className="game-room-container">
            <div className="game-header">
                <h1>
                    Game Room: <span className="game-id">{gameId}</span>
                    <button
                        className="copy-button"
                        onClick={() => {
                            navigator.clipboard.writeText(gameId);
                            alert('Game ID copied to clipboard!');
                        }}
                    >
                        Copy
                    </button>
                </h1>
                <h2>Round {currentRound}</h2>
            </div>
            <div className="player-sections" style={{ gridTemplateColumns: `repeat(${players.length}, 1fr)` }}>
                {players.map((player) => (
                    <div
                        key={player.playerId}
                        className={`player-section 
              ${player.playerId === playerId ? 'current-player' : ''} 
              ${answeredPlayers.includes(player.playerId) ? 'answered' : ''} 
              ${correctAnswer && winner && winner.playerId === player.playerId ? 'winner' : ''} 
              ${correctAnswer && winner && winner.playerId !== player.playerId ? 'loser' : ''}`}
                    >
                        <div className="player-info">
                            <h3>{player.name}</h3>
                            <p>Score: {player.score}</p>
                        </div>
                        {countdown !== null && gameStatus === 'waiting' && (
                            <div className="countdown-message">
                                <p>Game starting in {countdown} seconds!</p>
                            </div>
                        )}
                        {gameStatus === 'waiting' && countdown === null && (
                            <div className="waiting-message">
                                <p>Waiting for players...</p>
                                <div className="loader"></div>
                            </div>
                        )}
                        {gameStatus === 'active' && question && (
                            <div className="question-section">
                                <p className="question-text">{question.text}</p>
                                <div className="options">
                                    {question.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswer(option)}
                                            disabled={hasAnswered || player.playerId !== playerId}
                                            className={`option-button ${hasAnswered ? 'disabled' : ''}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {correctAnswer && (
                            <div className="round-result">
                                <p>Correct Answer: <span>{correctAnswer}</span></p>
                                {winner ? (
                                    <p>Winner: <span>{winner.name}</span></p>
                                ) : (
                                    <p>No one answered correctly.</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GameRoom;