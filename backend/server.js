import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 3001;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

let gameState = {
    question: '',
    answers: Array(8).fill({ text: '', points: '', revealed: false }),
    teamAScore: 0,
    teamBScore: 0,
    strikes: 0,
    activeTeam: null
};

io.on('connection', (socket) => {
  console.log('A user connected');

  // Send the current game state to the new user
  socket.emit('gameState', gameState);

  socket.on('updateGameState', (newGameState) => {
    gameState = { ...gameState, ...newGameState };
    io.emit('gameState', gameState);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});