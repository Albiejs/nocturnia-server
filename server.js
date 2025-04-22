// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let playerCards = {};

const specialCards = [
  { name: "Veritas Curse", effect: "Jawab pertanyaan jujur dari lawan" },
  { name: "Mind Reversal", effect: "Tukar semua kartu dengan pemain lain" },
  { name: "Soul Drain", effect: "Semua pemain kecuali kamu draw 1 kartu" },
  { name: "Obliviate", effect: "Lewati giliran dan hapus 1 kartu lawan" },
  { name: "Black Mirror", effect: "Ungkapkan rasa takut terbesarmu" },
  { name: "Dark Pact", effect: "Beraliansi—jika salah satu menang, dua-duanya kalah" },
];

const cardTypes = [
  { type: "Voidstone", color: "bg-black", description: "Ambisi dan Marah" },
  { type: "Moonshade", color: "bg-gray-700", description: "Kesedihan dan Penyesalan" },
  { type: "Bloodthorn", color: "bg-red-900", description: "Trauma dan Pengkhianatan" },
  { type: "Duskwell", color: "bg-blue-900", description: "Dendam dan Kesepian" },
];

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A player connected: ', socket.id);
  
  players.push(socket.id);

  // Assign initial cards to each player
  playerCards[socket.id] = getRandomCards();

  socket.emit('game_state', {
    players,
    cards: playerCards,
  });

  socket.on('draw_card', () => {
    const drawnCard = getRandomCard();
    playerCards[socket.id].push(drawnCard);
    io.emit('game_state', {
      players,
      cards: playerCards,
    });
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected: ', socket.id);
    players = players.filter(id => id !== socket.id);
    delete playerCards[socket.id];
    io.emit('game_state', {
      players,
      cards: playerCards,
    });
  });
});

const getRandomCard = () => {
  const randomCard = cardTypes[Math.floor(Math.random() * cardTypes.length)];
  return randomCard;
};

const getRandomCards = () => {
  let cards = [];
  for (let i = 0; i < 7; i++) {
    cards.push(getRandomCard());
  }
  return cards;
};

server.listen(5000, () => {
  console.log('Server running on port 5000');
});
