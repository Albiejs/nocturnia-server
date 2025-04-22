// GameBoard.js

import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const socket = io("http://localhost:5000"); // Ganti dengan URL servermu jika sudah deploy

const cardTypes = [
  { type: "Voidstone", color: "bg-black", description: "Ambisi dan Marah" },
  { type: "Moonshade", color: "bg-gray-700", description: "Kesedihan dan Penyesalan" },
  { type: "Bloodthorn", color: "bg-red-900", description: "Trauma dan Pengkhianatan" },
  { type: "Duskwell", color: "bg-blue-900", description: "Dendam dan Kesepian" },
];

const specialCards = [
  { name: "Veritas Curse", effect: "Jawab pertanyaan jujur dari lawan" },
  { name: "Mind Reversal", effect: "Tukar semua kartu dengan pemain lain" },
  { name: "Soul Drain", effect: "Semua pemain kecuali kamu draw 1 kartu" },
  { name: "Obliviate", effect: "Lewati giliran dan hapus 1 kartu lawan" },
  { name: "Black Mirror", effect: "Ungkapkan rasa takut terbesarmu" },
  { name: "Dark Pact", effect: "Beraliansi—jika salah satu menang, dua-duanya kalah" },
];

export default function GameBoard() {
  const [playerCards, setPlayerCards] = useState([]);
  const [playerId, setPlayerId] = useState("");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      setPlayerId(socket.id);
    });

    socket.emit("join_game");

    socket.on("game_state", (state) => {
      setPlayers(state.players);
      setPlayerCards(state.cards[socket.id] || []);
    });

    return () => {
      socket.off("connect");
      socket.off("game_state");
    };
  }, []);

  const drawCard = () => {
    socket.emit("draw_card");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-4 font-serif">
      <h1 className="text-4xl font-bold text-center mb-6 tracking-wide text-purple-200">
        Judgement of Nocturnia
      </h1>

      <p className="text-center text-purple-300 mb-4">Player ID: {playerId}</p>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {playerCards.map((card, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl shadow-lg p-4 ${card.color} border border-gray-700`}
          >
            <h2 className="text-xl font-semibold">{card.type}</h2>
            <p className="text-sm text-gray-300">{card.description}</p>
          </motion.div>
        ))}
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-purple-300">Arcana Cards</h2>
        <div className="grid grid-cols-2 gap-4">
          {specialCards.map((card) => (
            <Card key={card.name} className="bg-gradient-to-r from-purple-950 to-indigo-900 border border-purple-800 text-white">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold">{card.name}</h3>
                <p className="text-sm text-purple-300">{card.effect}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="mt-10 text-center">
        <Button onClick={drawCard} className="bg-purple-800 hover:bg-purple-700 text-white px-6 py-3 rounded-xl shadow-xl">
          Draw Card
        </Button>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-purple-400">Players in Room:</h3>
        <ul className="text-sm text-gray-400 mt-2">
          {players.map((id) => (
            <li key={id}>{id === playerId ? "You" : id}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
