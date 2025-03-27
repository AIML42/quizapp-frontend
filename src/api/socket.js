import io from 'socket.io-client';

const socket = io('https://quizapp-backend-n67n.onrender.com', {
  withCredentials: true,
});

export default socket;