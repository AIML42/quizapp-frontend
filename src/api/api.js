import axios from 'axios';

const api = axios.create({
  baseURL: 'https://quizapp-backend-n67n.onrender.com/api',
});

export const createGame = (data) => api.post('/create', data);
export const joinGame = (data) => api.post('/join', data);
export const getRandomQuestion = (gameId) => api.get(`/questions/random?gameId=${gameId}`);